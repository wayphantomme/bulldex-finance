# Uniswap V2 Core — Ringkasan Teknis

> Referensi arsitektur untuk pengembangan Bulldex Finance.
> Source: `v2-core-master` (official Uniswap V2 core repo), Solidity `0.5.16`.

## Struktur Repo

```
contracts/
├── UniswapV2ERC20.sol       # LP token (ERC20 + permit)
├── UniswapV2Factory.sol     # deploy & registry pair
├── UniswapV2Pair.sol        # inti AMM: mint/burn/swap
├── interfaces/
│   ├── IERC20.sol
│   ├── IUniswapV2Callee.sol
│   ├── IUniswapV2ERC20.sol
│   ├── IUniswapV2Factory.sol
│   └── IUniswapV2Pair.sol
├── libraries/
│   ├── Math.sol              # sqrt, min
│   ├── SafeMath.sol          # overflow-safe uint ops
│   └── UQ112x112.sol         # fixed-point Q112x112 untuk TWAP
└── test/ERC20.sol            # token dummy buat testing
```

3 kontrak inti: **Factory** (pembuat pair), **Pair** (kolam likuiditas + logika AMM), **ERC20** (LP token yang di-mint ke penyedia likuiditas).

---

## 1. UniswapV2Factory.sol

Tugas: bikin pair baru pakai `CREATE2` supaya alamat pair bisa diprediksi di depan (deterministic address), dan menyimpan registry semua pair yang ada.

Poin penting:
- `createPair(tokenA, tokenB)` — token diurutkan (`token0 < token1` berdasarkan alamat) sebelum deploy, biar urutan pair selalu konsisten.
- Pakai `create2` dengan salt `keccak256(token0, token1)` → alamat pair bisa dihitung off-chain tanpa perlu query on-chain (berguna buat router).
- `getPair[tokenA][tokenB]` dan `getPair[tokenB][tokenA]` diisi dua arah.
- `feeTo` / `feeToSetter` — mekanisme protocol fee (kalau `feeTo` bukan zero-address, protocol ambil potongan dari fee swap).

---

## 2. UniswapV2Pair.sol (inti AMM)

Ini kontraknya yang paling penting untuk dipelajari. Prinsip: **constant product formula** `x * y = k`.

### State penting
- `reserve0`, `reserve1` (uint112) + `blockTimestampLast` (uint32) — dikemas jadi **1 storage slot** buat hemat gas.
- `price0CumulativeLast`, `price1CumulativeLast` — akumulator harga buat **TWAP oracle**.
- `kLast` — nilai `k` terakhir, dipakai buat hitung protocol fee.
- `MINIMUM_LIQUIDITY = 1000` — dikunci permanen ke `address(0)` saat mint pertama, biar pool nggak bisa di-drain total (mencegah share price manipulation di awal).

### `mint()` — nambah likuiditas
1. Hitung `amount0`/`amount1` dari selisih balance aktual vs reserve (asumsinya token udah ditransfer duluan ke pair — pola **optimistic transfer**).
2. First mint: `liquidity = sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY`.
3. Mint berikutnya: `liquidity = min(amount0 * totalSupply / reserve0, amount1 * totalSupply / reserve1)` — proporsional, dan pakai `min` biar user nggak bisa "curang" dengan rasio timpang.

### `burn()` — tarik likuiditas
- Pro-rata berdasarkan proporsi LP token yang dibakar terhadap `totalSupply`, dihitung dari **balance aktual pair**, bukan reserve — ini penting biar distribusi selalu fair walau ada balance nyasar (skim target).

### `swap()` — inti trading
1. Optimistic transfer: token output dikirim duluan ke `to` **sebelum** verifikasi input diterima.
2. Support **flash swap**: kalau `data.length > 0`, dipanggil `IUniswapV2Callee(to).uniswapV2Call(...)` — caller bisa pinjem token dulu, lakuin arbitrase/logic apapun, baru bayar di akhir tx yang sama.
3. Verifikasi invariant K setelah fee 0.3%:
   ```
   balance0Adjusted = balance0*1000 - amountIn0*3
   balance1Adjusted = balance1*1000 - amountIn1*3
   require(balance0Adjusted * balance1Adjusted >= reserve0 * reserve1 * 1000^2)
   ```
   Ini cara Uniswap V2 charge fee 0.3% tanpa transfer fee terpisah — cukup pastiin produk k naik (atau tetap) setelah dikurangi fee.

### `_mintFee()` — protocol fee (opsional, off by default)
- Kalau `feeTo` aktif, protokol ambil **1/6 dari pertumbuhan `sqrt(k)`** sejak liquidity event terakhir, di-mint sebagai LP token baru ke `feeTo`.
- Rumus: `liquidity = totalSupply * (sqrt(k_now) - sqrt(k_last)) / (5*sqrt(k_now) + sqrt(k_last))`.

### `_update()` — update reserve + oracle
- Tiap kali reserve berubah, sekali per block (`timeElapsed > 0`), akumulasi harga cumulative pakai fixed-point `UQ112x112` → dipakai oracle eksternal buat hitung TWAP (`(price_end - price_start) / time`).

### Reentrancy guard
- Modifier `lock()` sederhana pakai `unlocked` flag — semua fungsi eksternal utama (`mint`, `burn`, `swap`, `skim`, `sync`) pakai ini.

### `skim()` & `sync()`
- `skim`: kirim kelebihan balance (donasi/airdrop) ke alamat tujuan, balikin ke sync dengan reserve.
- `sync`: paksa reserve match balance aktual (dipakai kalau token rebasing/deflationary bikin reserve out-of-sync).

---

## 3. Libraries

| Library | Fungsi |
|---|---|
| `Math.sol` | `sqrt()` (Babylonian method) dan `min()` — dipakai buat hitung liquidity share |
| `SafeMath.sol` | overflow-safe add/sub/mul untuk Solidity 0.5.x (belum ada native checked math) |
| `UQ112x112.sol` | encode/decode fixed-point 112.112 buat price accumulator (oracle TWAP) |

---

## Insight buat Bulldex Finance

Beberapa pola desain yang layak ditiru/dipelajari lebih dalam:

1. **Optimistic transfer + invariant check** di `swap()` — pola ini yang bikin flash swap possible dan gas-efficient, tapi butuh extra hati-hati soal reentrancy (makanya ada `lock()`).
2. **MINIMUM_LIQUIDITY lock** — defense sederhana tapi krusial buat first-depositor attack.
3. **Reserve packing jadi 1 slot** (`uint112 + uint112 + uint32` = 256 bit) — gas optimization pattern yang relevan kalau Bulldex mau efisien di storage.
4. **Fee dihitung lewat invariant check**, bukan lewat transfer fee terpisah — lebih gas-efficient daripada narik fee eksplisit di setiap leg.
5. **Router terpisah dari Core** — di V2 real, semua logic "user-facing" (slippage check, path multi-hop, dsb) ada di kontrak Router, bukan di Pair. Pair sengaja dibikin minimal & "low-level" (banyak komentar `this low-level function should be called from a contract which performs important safety checks"). Worth dipertimbangkan buat pisahin Core vs Periphery di Bulldex juga.
6. **Protocol fee opsional via `feeTo`** — pola on/off switch yang clean buat monetisasi protokol di masa depan tanpa ubah swap fee dasar.