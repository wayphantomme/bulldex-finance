# Uniswap V3 Core — Ringkasan Teknis

> Referensi arsitektur untuk pengembangan Bulldex Finance.
> Source: `v3-core-main` (official Uniswap V3 core repo), Solidity `0.7.6`.

## Perbedaan Mendasar dari V2

V2 pakai constant product `x*y=k` di seluruh rentang harga (0 sampai ∞), likuiditas nyebar rata dan sebagian besar nganggur karena harga jarang jauh dari titik saat ini. V3 memperkenalkan **concentrated liquidity**: LP bisa milih rentang harga spesifik (`tickLower` – `tickUpper`) buat naruh modalnya, jadi modal lebih efisien tapi kompleksitas matematika & state jauh lebih tinggi.

## Struktur Repo

```
contracts/
├── UniswapV3Factory.sol       # deploy pool per (token0, token1, fee tier)
├── UniswapV3Pool.sol          # inti AMM v3 (869 baris — jauh lebih besar dari V2)
├── UniswapV3PoolDeployer.sol  # helper deploy via CREATE2
├── NoDelegateCall.sol         # guard anti-delegatecall
├── interfaces/                # dipecah granular: pool/, callback/
└── libraries/
    ├── TickMath.sol           # konversi tick <-> sqrtPriceX96
    ├── Tick.sol                # state & update per-tick
    ├── TickBitmap.sol          # cari tick aktif berikutnya secara efisien
    ├── Position.sol            # state per-posisi LP (per range)
    ├── SqrtPriceMath.sol       # hitung delta amount dari perubahan sqrt price
    ├── SwapMath.sol             # hitung 1 langkah swap dalam 1 tick range
    ├── Oracle.sol               # TWAP oracle dgn observation array
    ├── FullMath.sol / FixedPoint96 / FixedPoint128 — math presisi tinggi
    └── LiquidityMath, LowGasSafeMath, SafeCast, BitMath, UnsafeMath, TransferHelper
```

Fee tier di V3 nggak fixed 0.3% kayak V2 — ada 3 tier default: **0.05% (tickSpacing 10)**, **0.3% (tickSpacing 60)**, **1% (tickSpacing 200)**, bisa ditambah owner factory lewat `enableFeeAmount`.

---

## 1. UniswapV3Factory.sol

- `createPool(tokenA, tokenB, fee)` — beda dari V2, key-nya bukan cuma pair token tapi **(token0, token1, fee)** — jadi satu pasangan token bisa punya beberapa pool dengan fee tier berbeda.
- Fee tier ↔ tickSpacing di-mapping di factory (`feeAmountTickSpacing`), bukan hardcode di Pool.
- Punya `owner` yang bisa nambah fee tier baru dan atur protocol fee di tiap pool (governance minimal).

---

## 2. Konsep Inti: Tick & sqrtPriceX96

- Harga direpresentasikan sebagai **`sqrtPriceX96`**: akar kuadrat harga dalam fixed-point Q64.96 — dipakai akar kuadrat karena bikin formula constant-product jadi linear terhadap liquidity, lebih murah secara komputasi.
- Harga dibagi jadi **tick** diskrit, dengan `price = 1.0001^tick`. Tiap tick = 1 basis point pergerakan harga. Range tick: **-887272 sampai 887272**, cukup buat cover rasio harga `2^-128` sampai `2^128`.
- `tickSpacing` menentukan tick mana aja yang boleh dipakai sebagai batas posisi (semakin gede fee tier, semakin lebar spacing → lebih sedikit tick yang perlu di-cross, gas lebih murah untuk pool volatile-fee tinggi).

## 3. Struktur Data Kunci di Pool

| State | Fungsi |
|---|---|
| `slot0` (struct) | sqrtPriceX96, tick saat ini, index & cardinality observation, feeProtocol, unlocked — dikemas biar hemat gas (mirip reserve packing V2) |
| `liquidity` | total likuiditas aktif **di tick saat ini** (bukan total keseluruhan pool) |
| `ticks` mapping | data per-tick: liquidityGross, liquidityNet, fee growth outside, dll |
| `tickBitmap` mapping | bitmap buat cari tick ter-inisialisasi berikutnya secara O(1)-ish, biar swap loop nggak perlu scan semua tick |
| `positions` mapping | posisi LP per `(owner, tickLower, tickUpper)` — nyimpen liquidity & fee growth checkpoint |
| `observations` | array TWAP oracle (sampai 65535 slot, bisa di-grow lewat `increaseObservationCardinalityNext`) — evolusi dari cumulative price V2, sekarang bisa nyimpen histori beberapa titik |

## 4. `mint()` — Nambah Likuiditas (via `_modifyPosition`)

Beda total dari V2. LP nentuin `tickLower` dan `tickUpper` (rentang harga), lalu:
- Kalau tick saat ini **di bawah range** → cuma butuh token0.
- Kalau tick saat ini **di dalam range** → butuh kombinasi token0 + token1, proporsinya dihitung dari `SqrtPriceMath.getAmount0Delta`/`getAmount1Delta`, dan `liquidity` global di-update.
- Kalau tick saat ini **di atas range** → cuma butuh token1.

Tiap kali liquidity di suatu tick berubah (`ticks.update`), sistem cek apakah tick itu "flip" dari uninitialized↔initialized, lalu update `tickBitmap` biar swap loop tau tick mana yang aktif. Sama seperti V2, pakai pola **callback + balance check** (`uniswapV3MintCallback`) — bukan transferFrom langsung, biar fleksibel dipanggil dari router mana pun.

## 5. `swap()` — Inti AMM V3 (paling kompleks)

Beda drastis dari V2 yang satu langkah doang. Di V3, swap jalan lewat **while-loop**, tiap iterasi = 1 "step" dalam 1 tick range:

1. Cari `tickNext` (tick ter-inisialisasi berikutnya searah swap) lewat `tickBitmap.nextInitializedTickWithinOneWord`.
2. `SwapMath.computeSwapStep()` hitung berapa banyak yang bisa di-swap dalam step ini (dibatasi oleh: sisa amount, sqrtPriceLimit, atau harga di `tickNext`) — mengembalikan `sqrtPriceX96` baru, `amountIn`, `amountOut`, `feeAmount`.
3. Kalau harga step nyampe persis di `tickNext` → **cross tick**: liquidity aktif berubah (`liquidityNet` ditambah/dikurang tergantung arah), fee growth checkpoint per-tick di-update, oracle observation ditulis kalau ini crossing pertama di block ini.
4. Loop lanjut sampai `amountSpecifiedRemaining == 0` atau harga mentok `sqrtPriceLimitX96`.
5. Fee dipotong tiap step (bukan sekali di akhir kayak V2) dan diakumulasi ke `feeGrowthGlobalX128` — dipakai LP buat klaim fee proporsional ke seberapa lama posisi mereka "in range".
6. Sama seperti V2: **optimistic transfer** dulu (`safeTransfer`), lalu callback (`uniswapV3SwapCallback`), baru verifikasi balance cukup — pola yang enable flash swap.

Kompleksitas ini yang bikin gas cost V3 swap lebih mahal dari V2 kalau harus cross banyak tick, tapi jauh lebih capital-efficient buat LP yang confident soal range harga.

## 6. `flash()` — Flash Loan Native

V3 punya flash loan built-in terpisah dari swap (V2 cuma bisa lewat data param di `swap`). Fee-nya sama kayak fee tier pool (`fee/1e6`), dibayar balik dalam callback `uniswapV3FlashCallback`, lalu fee-nya masuk ke `feeGrowthGlobal` buat LP (dikurangi potongan protocol fee kalau `feeProtocol` aktif).

## 7. Fee & Protocol Fee

- Swap fee di V3 ditentukan per-pool (bukan fixed 0.3%), sesuai fee tier saat pool dibuat.
- Protocol fee (`feeProtocol` di `slot0`, 4 bit per token, packed jadi 1 byte) — pecahan `1/N` dari swap fee bisa diarahkan ke protokol, diatur owner via `setFeeProtocol`, diklaim lewat `collectProtocol`. Beda dari V2 yang ngitung protocol fee dari pertumbuhan sqrt(k) — di V3 lebih simpel, langsung dipotong per-step dari fee yang udah dikumpulkan.

## 8. `NoDelegateCall`

Kontrak pool immutable-heavy (banyak `immutable` var yang di-set di constructor via `parameters()` dari deployer) — modifier `noDelegateCall` mencegah kontrak lain delegatecall ke pool ini dan "mencuri" identitas/state-nya. Pola security yang nggak ada di V2.

## 9. Oracle TWAP (`Oracle.sol`)

Evolusi dari `price0CumulativeLast` V2. V3 nyimpen **array observation** (bisa di-grow sampai 65535 entry) berisi `tickCumulative` dan `secondsPerLiquidityCumulativeX128`. Ini memungkinkan query TWAP untuk **rentang waktu custom** di masa lalu (`observe(secondsAgos[])`), nggak cuma "dari deploy sampai sekarang" kayak V2.

---

## Insight buat Bulldex Finance

1. **Concentrated liquidity = kompleksitas tinggi.** Kalau mau implement fitur serupa, ini big undertaking — perlu tick math presisi tinggi (`TickMath`, `FullMath`), storage layout ticks + bitmap yang efisien, dan swap loop yang benar-benar teruji (V3 core sampe ada audit ToB + fuzzing Echidna/Manticore terpisah, keliatan di folder `audits/`).
2. **Fee tier per-pool, bukan global** — desain yang lebih fleksibel dibanding V2. Kalau Bulldex mau support banyak jenis pair (stable vs volatile), pola ini relevan: pisahin `fee` jadi parameter pool, bukan konstanta protokol.
3. **Callback pattern konsisten** di mint/swap/flash — semua "kirim duluan, verifikasi belakangan" via `balanceOf` check. Ini pattern reusable yang udah kepake juga di V2, jadi worth dijadiin standar internal di Bulldex.
4. **`NoDelegateCall` guard** — worth ditiru kalau kontrak Bulldex banyak pake `immutable` state yang di-set di constructor, biar nggak bisa di-delegatecall dan state-nya "dibajak".
5. **Position per-range** (bukan per-LP-token fungible) — trade-off penting: V3 LP token jadi NFT (di periphery, bukan di core ini) karena tiap posisi punya range unik, beda total dari V2 yang LP token-nya fungible ERC20. Kalau Bulldex mau concentrated liquidity, ini konsekuensi desain yang perlu dipikirin dari awal (fungible vs NFT LP token).
6. **Oracle multi-observation** jauh lebih powerful dari cumulative-price V2 — kalau Bulldex butuh price feed on-chain yang robust, pola `observations` array + `observe(secondsAgos[])` ini pattern yang matang buat dicontek.
