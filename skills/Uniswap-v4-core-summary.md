# Uniswap v4 Core — Ringkasan

Repo: `Uniswap/v4-core` (branch `main`) — hosting logika inti pool (pembuatan pool, swap, liquidity, fee). Lisensi campuran BUSL-1.1 (kode inti) dan MIT (types/libraries/interfaces yang bisa diintegrasikan pihak ketiga).

## Perubahan Arsitektur Besar dari v3 → v4

1. **Singleton contract**: semua pool disimpan dalam satu kontrak `PoolManager.sol`, bukan satu kontrak pool terpisah per pasangan token (seperti v2/v3). Pool diidentifikasi lewat `PoolId` (hash dari `PoolKey`), disimpan di `mapping(PoolId => Pool.State) _pools`.
2. **Flash accounting via `unlock`**: alih-alih transfer token di setiap langkah, PoolManager melacak *net delta* (utang/piutang) selama sesi "unlocked". Integrator memanggil `unlock(data)` → PoolManager memanggil balik `unlockCallback` pada caller → di dalam callback itu caller bebas memanggil `swap`, `modifyLiquidity`, `donate`, `take`, `settle`, `mint`, `burn` berkali-kali → sesi ditutup hanya jika seluruh delta = 0 (dicek lewat `NonzeroDeltaCount`).
3. **Hooks**: setiap pool bisa dipasangi kontrak hook opsional yang mengimplementasikan callback sebelum/sesudah `initialize`, `addLiquidity`, `removeLiquidity`, `swap`, `donate`. Hook mana yang aktif ditentukan oleh **bit-bit terendah dari alamat kontrak hook itu sendiri** (di-mining saat deploy), bukan oleh konfigurasi terpisah — sehingga permission hook tidak bisa berubah setelah pool diinisialisasi.
4. **Native ETH & flash accounting token (ERC-6909)**: currency bisa berupa token native (address(0)) atau ERC-20. PoolManager juga bertindak sebagai multi-token ledger (`ERC6909Claims`) sehingga user bisa "mint/burn" klaim atas saldo di PoolManager tanpa transfer on-chain — berguna untuk swap routing multi-hop.
5. **Dynamic fee & fee override dari hook**: pool bisa punya fee statis atau `DYNAMIC_FEE_FLAG`; jika dinamis, hook `beforeSwap` bisa mengembalikan override fee per-swap (`OVERRIDE_FEE_FLAG`).
6. **Extsload/Exttload**: kontrak menyediakan pembacaan storage & transient storage secara generik/batched agar integrator off-chain/di kontrak lain bisa membaca state pool secara efisien tanpa perlu getter khusus untuk tiap field.

## Struktur Folder

```
src/
├─ PoolManager.sol          # kontrak utama (singleton)
├─ ProtocolFees.sol         # akumulasi & penarikan protocol fee
├─ ERC6909.sol / ERC6909Claims.sol   # ledger multi-token internal
├─ NoDelegateCall.sol       # guard anti delegatecall
├─ Extsload.sol / Exttload.sol       # baca storage/transient storage generik
├─ interfaces/              # IPoolManager, IHooks, IProtocolFees, IExtsload, IExttload, callback/, external/
├─ libraries/               # Pool, Hooks, Position, SwapMath, TickMath, TickBitmap, StateLibrary, dll.
├─ types/                   # PoolKey, PoolId, Currency, BalanceDelta, BeforeSwapDelta, Slot0, PoolOperation
└─ test/                    # helper kontrak untuk pengujian foundry
test/                       # test suite foundry (.t.sol) + gas snapshot (test/PoolManager.gas.spec.ts)
snapshots/                  # gas snapshot JSON per test suite
docs/whitepaper/            # whitepaper v4 (PDF)
```

## Kontrak & File Inti

### `PoolManager.sol` (395 baris)
Kontrak utama, mewarisi `IPoolManager, ProtocolFees, NoDelegateCall, ERC6909Claims, Extsload, Exttload`.

Fungsi publik utama:
- `unlock(bytes data)` — membuka sesi transaksi, memanggil balik `unlockCallback`, memastikan semua delta lunas sebelum mengunci kembali.
- `initialize(PoolKey key, uint160 sqrtPriceX96)` — membuat pool baru; validasi tick spacing, urutan currency0 < currency1, dan validitas alamat hook; memanggil `beforeInitialize`/`afterInitialize`.
- `modifyLiquidity(PoolKey key, ModifyLiquidityParams params, bytes hookData)` — tambah/kurangi likuiditas pada posisi (tickLower/tickUpper + salt unik); memanggil hook before/after; delta caller dan delta hook diakumulasi terpisah.
- `swap(PoolKey key, SwapParams params, bytes hookData)` — jalankan swap lewat `Pool.swap`, terapkan protocol fee dari input token, panggil hook before/after (hook bisa mengubah jumlah swap & menerima/memberi delta sendiri).
- `donate(PoolKey key, uint256 amount0, uint256 amount1, bytes hookData)` — menyumbang token ke LP aktif pool tanpa mengubah likuiditas (menaikkan fee growth).
- `sync(Currency)`, `settle()`, `settleFor(address)`, `take(...)`, `clear(...)`, `mint(...)`, `burn(...)` — primitif akuntansi delta / penyelesaian saldo dalam sesi `unlock`.
- `updateDynamicLPFee(PoolKey key, uint24 newDynamicLPFee)` — hanya bisa dipanggil oleh hook milik pool berfee dinamis.

Semua state pool disimpan di `mapping(PoolId id => Pool.State) internal _pools`.

### `libraries/Pool.sol` (613 baris)
Logika inti pool: struct `State` (slot0, liquidity, feeGrowthGlobal, ticks, tickBitmap, posisi), `initialize`, `modifyLiquidity`, `swap` (loop step-by-step lintas tick memakai `SwapMath`/`TickMath`/`TickBitmap`), `donate`, `updateTick`, `crossTick`, `getFeeGrowthInside`, dll. Berisi error khusus seperti `TicksMisordered`, `PriceLimitAlreadyExceeded`, `PoolNotInitialized`.

### `libraries/Hooks.sol` (340 baris) & `interfaces/IHooks.sol` (152 baris)
Mendefinisikan 14 flag bit (di 14 bit terendah alamat kontrak hook): before/after untuk Initialize, AddLiquidity, RemoveLiquidity, Swap, Donate, ditambah 4 flag "returns delta" (beforeSwap, afterSwap, afterAddLiquidity, afterRemoveLiquidity) yang memperbolehkan hook mengembalikan `BalanceDelta`/`BeforeSwapDelta` sendiri. `validateHookPermissions` dipakai di constructor kontrak hook untuk memastikan alamat deploy sesuai permission yang diinginkan.

### `types/`
- `PoolKey` — struct kunci pool: `currency0`, `currency1`, `fee`, `tickSpacing`, `hooks`.
- `PoolId` — hash dari `PoolKey`.
- `Currency` — wrapper `address`, mendukung native currency (`address(0)`) dan ERC-20, dengan operator overload perbandingan.
- `BalanceDelta` — `int256` custom yang mengepak dua `int128` (amount0, amount1) plus operator `+ - == !=`.
- `BeforeSwapDelta` — `int256` custom yang mengepak delta "specified" & "unspecified" untuk hasil `beforeSwap`.
- `Slot0` — `bytes32` custom yang mengepak `sqrtPriceX96` (160 bit), `tick` (24 bit), `protocolFee` (24 bit, split 12+12 untuk dua arah), `lpFee` (24 bit) — dibaca/ditulis lewat inline assembly untuk hemat gas.
- `PoolOperation` — struct parameter `ModifyLiquidityParams` (tickLower, tickUpper, liquidityDelta, salt) dan `SwapParams` (zeroForOne, amountSpecified, sqrtPriceLimitX96).

### `libraries/LPFeeLibrary.sol` & `ProtocolFeeLibrary.sol`
- LP fee maksimum 1_000_000 (100% dalam satuan hundredths-of-a-bip); flag khusus untuk menandai pool dynamic-fee (`DYNAMIC_FEE_FLAG`) dan override fee dari hook (`OVERRIDE_FEE_FLAG`).
- Protocol fee maksimum 1000 pips (0.1%) per arah, dipotong terlebih dahulu dari input sebelum LP fee dihitung dari sisanya; `calculateSwapFee` menggabungkan protocol fee + LP fee.

### `libraries/StateLibrary.sol` (349 baris)
Kumpulan fungsi *view* eksternal (dipakai integrator/off-chain) untuk membaca state pool langsung dari storage slot PoolManager tanpa perlu getter manual: `getSlot0`, `getTickInfo`, `getTickLiquidity`, `getFeeGrowthGlobals`, `getLiquidity`, `getTickBitmap`, `getPositionInfo`, `getFeeGrowthInside`, dll — memanfaatkan `Extsload`.

### Kontrak pendukung lain
- `ProtocolFees.sol` — akumulasi & penarikan fee protokol oleh owner.
- `ERC6909.sol` / `ERC6909Claims.sol` — implementasi token multi-ID (mirip ERC-1155 ringan) yang dipakai PoolManager untuk merepresentasikan klaim saldo currency sebagai token yang bisa di-mint/burn/transfer.
- `NoDelegateCall.sol` — modifier untuk mencegah pemanggilan lewat delegatecall (menjaga integritas storage singleton).
- `Extsload.sol` / `Exttload.sol` — baca storage biasa & transient storage secara batched/generik.

## Alur Kerja Tipikal (Integrator)

1. Kontrak integrator mengimplementasikan `IUnlockCallback`.
2. Panggil `poolManager.unlock(data)`.
3. Di dalam `unlockCallback`, panggil kombinasi `swap` / `modifyLiquidity` / `donate` / `take` / `settle` / `mint` / `burn` sesuai kebutuhan.
4. Pastikan seluruh delta currency kembali ke nol sebelum callback selesai — jika tidak, transaksi revert (`CurrencyNotSettled`).

## Catatan Tambahan
- Solidity version: `0.8.26` (PoolManager), sebagian file library pakai `^0.8.0` / `^0.8.24`.
- Menggunakan Foundry (`foundry.toml`, `forge install`), test di `test/*.t.sol` + gas snapshot di `snapshots/`.
- Whitepaper resmi tersedia di `docs/whitepaper/whitepaper-v4.pdf`.
