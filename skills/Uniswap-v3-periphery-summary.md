# Uniswap V3 Periphery — Ringkasan Teknis

> Referensi arsitektur untuk pengembangan Bulldex Finance.
> Source: `v3-periphery-main` (official Uniswap V3 periphery repo), Solidity `0.7.6`.

## Posisi dalam Arsitektur

Ini lapisan **"user-facing"** yang duduk di atas `v3-core`. Core sengaja dibikin minimal (cuma pool + factory, semua fungsi low-level butuh caller yang "tahu apa yang dilakukan"). Periphery yang nanganin: routing multi-hop, slippage protection, deadline check, wrapping ETH↔WETH, LP position sebagai NFT, quote harga, sampai gasless approval (permit). **Pool di core nggak pernah tahu soal router/NFT manager ini — komunikasi cuma lewat callback interface** (`uniswapV3SwapCallback`, `uniswapV3MintCallback`).

## Struktur Repo

```
contracts/
├── SwapRouter.sol                    # exact-input/output swap, single & multi-hop
├── NonfungiblePositionManager.sol    # LP position sebagai ERC721 (NFT)
├── V3Migrator.sol                    # migrasi likuiditas dari V2 ke V3
├── base/
│   ├── Multicall.sol                  # batch banyak call jadi 1 tx via delegatecall
│   ├── SelfPermit.sol                 # EIP-2612 permit — approve tanpa tx terpisah
│   ├── PeripheryPayments(WithFee).sol # handle ETH wrap/unwrap, sweep token sisa
│   ├── PeripheryValidation.sol        # modifier checkDeadline
│   ├── LiquidityManagement.sol        # helper hitung & tambah liquidity, dgn callback
│   └── PeripheryImmutableState.sol    # simpan factory & WETH9 address
├── lens/
│   ├── Quoter.sol / QuoterV2.sol      # simulasi swap buat dapetin quote off-chain
│   ├── TickLens.sol                   # baca data tick buat UI/analytics
│   └── UniswapInterfaceMulticall.sol  # multicall read-only utk frontend
└── libraries/
    ├── Path.sol                        # encode/decode path multi-hop (token-fee-token-fee-token)
    ├── PoolAddress.sol                 # hitung alamat pool via CREATE2 tanpa query on-chain
    ├── LiquidityAmounts.sol            # konversi amount token <-> liquidity units
    ├── OracleLibrary.sol               # helper baca TWAP dari pool
    └── CallbackValidation.sol          # pastikan callback beneran datang dari pool asli
```

---

## 1. SwapRouter.sol — Inti Trading UX

4 fungsi swap utama, dibedakan dari 2 sumbu: **single-hop vs multi-hop**, dan **exact input vs exact output**.

| Fungsi | Kegunaan |
|---|---|
| `exactInputSingle` | swap A→B, jumlah input pasti, minimal output ditentukan (slippage protection) |
| `exactInput` | swap multi-hop (A→B→C), input pasti |
| `exactOutputSingle` | swap A→B, jumlah **output** yang pasti, maksimal input ditentukan |
| `exactOutput` | swap multi-hop, output pasti — path-nya justru di-encode **terbalik** (dari tokenOut ke tokenIn), karena hitungnya mundur dari hasil akhir |

### Pola penting: `uniswapV3SwapCallback`
Router **tidak pegang token pengguna**. Alurnya:
1. Router manggil `pool.swap(...)`.
2. Pool transfer token keluar duluan (optimistic), lalu manggil balik `uniswapV3SwapCallback` ke router.
3. Di dalam callback ini baru router narik dana dari `msg.sender` (via `pay()`) buat bayar ke pool.

Ini bikin router **stateless** — nggak ada custody token nyangkut, dan aman dipakai bareng banyak pool sekaligus. Callback di-validasi lewat `CallbackValidation.verifyCallback` (hitung ulang alamat pool via `PoolAddress.computeAddress`, mastiin caller emang pool asli — bukan kontrak jahat yang nyamar).

### Multi-hop lewat `Path.sol`
Path di-encode sebagai bytes: `token0 (20 byte) + fee (3 byte) + token1 (20 byte) + fee (3 byte) + token2 ...`. Tiap kali 1 hop kelar, `path.skipToken()` motong segmen depan, lanjut ke pool berikutnya — swap berantai terjadi **di dalam nested callback**, bukan loop eksternal.

### `amountInCached` — trik state sementara
Untuk `exactOutput` multi-hop, jumlah input aktual baru diketahui **setelah** semua hop selesai dihitung mundur. Nilainya disimpan sementara di storage var `amountInCached`, dipakai buat verifikasi `amountIn <= amountInMaximum` di akhir, lalu di-reset ke placeholder `type(uint256).max`.

---

## 2. NonfungiblePositionManager.sol — LP Position sebagai NFT

Beda besar dari V2 (LP token fungible ERC20): karena tiap posisi V3 punya **range harga unik** (`tickLower`, `tickUpper`), tiap posisi direpresentasikan sebagai **1 NFT (ERC721)**, bukan token yang bisa digabung/dipecah bebas.

- `mint()` — bikin posisi baru: hitung liquidity dari amount token yang dikasih, transfer via `LiquidityManagement` (callback pattern juga: `uniswapV3MintCallback`), lalu `_mint` NFT baru ke recipient.
- `increaseLiquidity()` / `decreaseLiquidity()` — nambah/kurangin liquidity di posisi (NFT) yang udah ada, tanpa perlu bikin NFT baru.
- `collect()` — klaim fee yang udah terkumpul (`tokensOwed0/1`) tanpa narik liquidity utamanya.
- `burn()` — hanguskan NFT posisi (cuma bisa kalau liquidity & tokensOwed udah 0).
- Struct `Position` di kontrak ini nyimpen cache dari state pool (`feeGrowthInside...LastX128`) buat ngitung fee yang belum diklaim tanpa perlu baca-tulis storage pool tiap saat.
- Pakai `poolId` (uint80) buat referensi pool secara ringkas (bukan nyimpen address penuh di tiap posisi) — gas saving pattern.
- Mewarisi `ERC721Permit` — NFT posisi ini bisa di-approve via signature (gasless), bukan cuma `approve()` on-chain biasa.

---

## 3. Quoter.sol / QuoterV2.sol — Simulasi Harga Tanpa Eksekusi

Trik pintar: manfaatin `uniswapV3SwapCallback` tapi **revert di akhir** buat "membatalkan" swap-nya sambil ngembaliin hasil hitungan lewat revert reason. Karena manggil `pool.swap()` beneran (bukan cuma baca reserve terus itung manual), hasil quote-nya **akurat termasuk price impact & tick crossing** — tapi sengaja ditandai **"not gas efficient, jangan dipanggil on-chain"**, cuma buat off-chain call (`eth_call`) dari frontend/backend.

---

## 4. Fitur Pendukung (base/)

| Kontrak | Fungsi |
|---|---|
| `Multicall.sol` | Batch beberapa fungsi jadi 1 transaksi via `delegatecall` ke diri sendiri berkali-kali — dipakai misal buat "create pool + mint position" atau "collect fee + swap sisanya" sekaligus |
| `SelfPermit.sol` | Manfaatin EIP-2612 `permit()` — user tanda tangan approval off-chain, dieksekusi dalam multicall yang sama dengan aksi utama, jadi **1 transaksi aja** (nggak perlu approve dulu baru transact) |
| `PeripheryPayments.sol` | Handle wrap/unwrap ETH↔WETH otomatis (karena pool V3 cuma kerja dengan ERC20, ETH native harus di-wrap), plus fungsi `sweepToken`/`refundETH` buat balikin token sisa |
| `PeripheryValidation.sol` | Modifier `checkDeadline` — reject transaksi yang telat dieksekusi (proteksi dari transaksi nyangkut lama di mempool lalu dieksekusi di harga yang udah beda jauh) |

---

## 5. Libraries Kunci

- **`Path.sol`** — encode/decode path multi-hop, dibahas di atas.
- **`PoolAddress.sol`** — hitung alamat pool via `CREATE2` formula (`keccak256(0xff, factory, salt, init_code_hash)`) **tanpa perlu call on-chain ke factory**. Ini yang bikin router bisa langsung interaksi ke pool manapun asal tau `(token0, token1, fee)`.
- **`LiquidityAmounts.sol`** — konversi antara "jumlah token" dan "unit liquidity" pada suatu range harga — dipakai di `mint`/`increaseLiquidity`.
- **`OracleLibrary.sol`** — helper baca TWAP dari `observe()` pool, ngasih fungsi convenience kayak `consult()` buat dapetin average tick dalam periode tertentu.
- **`CallbackValidation.sol`** — validasi bahwa `msg.sender` di dalam callback beneran pool yang sah (dihitung ulang via `PoolAddress`), bukan kontrak penyerang.

---

## Insight buat Bulldex Finance

1. **Pisahin Core vs Periphery secara tegas.** Core cuma nyimpen logic AMM murni & rentan disalahgunakan kalau dipanggil langsung tanpa guard — Periphery yang nanganin UX (slippage, deadline, ETH wrapping, path multi-hop). Struktur ini bikin core lebih gampang diaudit dan periphery bisa di-upgrade/ganti tanpa migrasi likuiditas.
2. **Callback + `CallbackValidation`** adalah pattern keamanan penting: kalau Bulldex punya router sendiri, jangan percaya blind ke `msg.sender` dalam callback — selalu hitung ulang & verifikasi alamat pool asalnya.
3. **`PoolAddress.computeAddress` (CREATE2 deterministic)** ngilangin kebutuhan query on-chain buat nemuin alamat pool — worth ditiru kalau Bulldex mau router yang gas-efficient.
4. **Multicall + SelfPermit** kombinasi ini penting banget buat UX modern: user bisa approve + swap/add-liquidity dalam **1 transaksi** aja lewat signature off-chain, ngilangin 1 tx approval yang biasanya bikin UX kerasa lambat/mahal.
5. **NFT buat posisi ber-range** — kalau Bulldex nanti serius mau bikin concentrated liquidity (dari insight V3 core kemarin), pola `NonfungiblePositionManager` ini blueprint yang udah teruji: simpan fee-growth checkpoint di posisi, referensi pool via id ringkas, dan pisahin "posisi" dari "kepemilikan token" biar bisa ditransfer/dijual sebagai NFT.
6. **Quoter via revert-trick** adalah teknik yang elegan buat dapetin simulasi eksekusi akurat tanpa nulis ulang seluruh logic swap secara terpisah (view function) — worth dipertimbangkan drpd bikin fungsi "calculateSwap" duplikat yang gampang out-of-sync dengan logic swap asli.
