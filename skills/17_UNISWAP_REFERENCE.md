# Uniswap Reference — Ringkasan Teknis (v2 → v4 + App Interface)

> Referensi arsitektur untuk pengembangan Bulldex Finance.
> Mencakup: V2 Core, V3 Core, V3 Periphery, V4 Core, V4 Periphery, App Interface.

---

## Daftar Isi

1. [V2 Core](#1-uniswap-v2-core)
2. [V3 Core](#2-uniswap-v3-core)
3. [V3 Periphery](#3-uniswap-v3-periphery)
4. [V4 Core](#4-uniswap-v4-core)
5. [V4 Periphery](#5-uniswap-v4-periphery)
6. [App Interface (Universe)](#6-uniswap-app-interface)
7. [Perbandingan Evolusi V2 → V4](#7-perbandingan-evolusi-v2--v4)

---

## 1. Uniswap V2 Core

> Source: `v2-core-master`, Solidity `0.5.16`

### Struktur Repo

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
└── test/ERC20.sol
```

3 kontrak inti: **Factory** (pembuat pair), **Pair** (kolam likuiditas + logika AMM), **ERC20** (LP token).

### UniswapV2Factory.sol

- `createPair(tokenA, tokenB)` — token diurutkan (`token0 < token1`) sebelum deploy, konsisten.
- Pakai `create2` dengan salt `keccak256(token0, token1)` → alamat pair bisa dihitung off-chain.
- `getPair[tokenA][tokenB]` dan `getPair[tokenB][tokenA]` diisi dua arah.
- `feeTo` / `feeToSetter` — mekanisme protocol fee switch.

### UniswapV2Pair.sol (inti AMM)

**State penting:**
- `reserve0`, `reserve1` (uint112) + `blockTimestampLast` (uint32) — dikemas jadi **1 storage slot**.
- `price0CumulativeLast`, `price1CumulativeLast` — akumulator harga buat **TWAP oracle**.
- `kLast` — nilai `k` terakhir, dipakai buat hitung protocol fee.
- `MINIMUM_LIQUIDITY = 1000` — dikunci permanen ke `address(0)` saat mint pertama.

**`mint()` — Tambah Likuiditas:**
```
// Pertama kali
liquidity = sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY

// Selanjutnya
liquidity = min(amount0 * totalSupply / reserve0, amount1 * totalSupply / reserve1)
```

**`burn()` — Hapus Likuiditas:**
```
amount0 = liquidity * reserve0 / totalSupply
amount1 = liquidity * reserve1 / totalSupply
```

**`swap()` — Formula:**
```
amountOut = (amountIn * 997 * reserveOut) / (reserveIn * 1000 + amountIn * 997)
```
Fee 0.3% langsung masuk reserve — LP earn fee passively.

**Pola keamanan:**
- Reserves disimpan di storage (bukan `balanceOf`) — mencegah flash loan price manipulation.
- Pola **optimistic transfer + callback** (`IUniswapV2Callee`) — memungkinkan flash swap.
- `reentrancy lock` via `uint private unlocked = 1`.

**TWAP Oracle (V2):**
- `price0CumulativeLast` += `price0 * timeElapsed` tiap kali reserves di-update.
- Cuma menyimpan "sejak deploy sampai sekarang" — tidak bisa query range historis.

### Insight untuk Bulldex

- Pool.sol Bulldex mengikuti pola V2: constant product, fee 0.3%, LP token ERC20 fungible.
- `MINIMUM_LIQUIDITY` wajib ada — P-030 di PROBLEMS doc membuktikannya.
- TWAP V2 rentan flash loan — produksi harus pakai Chainlink.

---

## 2. Uniswap V3 Core

> Source: `v3-core-main`, Solidity `0.7.6`

### Perbedaan Mendasar dari V2

V2 menyebarkan likuiditas di seluruh range harga (0 sampai ∞) — sebagian besar modal nganggur. V3 memperkenalkan **concentrated liquidity**: LP pilih range harga spesifik (`tickLower` – `tickUpper`), modal lebih efisien tapi kompleksitas jauh lebih tinggi.

### Struktur Repo

```
contracts/
├── UniswapV3Factory.sol
├── UniswapV3Pool.sol          # inti AMM v3 (869 baris)
├── UniswapV3PoolDeployer.sol
├── NoDelegateCall.sol
├── interfaces/
└── libraries/
    ├── TickMath.sol           # konversi tick <-> sqrtPriceX96
    ├── Tick.sol               # state & update per-tick
    ├── TickBitmap.sol         # cari tick aktif berikutnya efisien
    ├── Position.sol           # state per-posisi LP
    ├── SqrtPriceMath.sol      # hitung delta amount dari perubahan sqrt price
    ├── SwapMath.sol           # hitung 1 langkah swap dalam 1 tick range
    └── Oracle.sol             # TWAP oracle dengan observation array
```

Fee tier: **0.05%** (tickSpacing 10), **0.3%** (tickSpacing 60), **1%** (tickSpacing 200).

### Konsep Inti: Tick & sqrtPriceX96

- Harga direpresentasikan sebagai `sqrtPriceX96` (Q64.96 fixed-point).
- `price = 1.0001^tick` — tiap tick = 1 basis point pergerakan harga.
- Range tick: **-887272 sampai 887272**.
- `tickSpacing` menentukan tick mana yang valid sebagai batas posisi.

### Struktur Data Kunci

| State | Fungsi |
|---|---|
| `slot0` | sqrtPriceX96, tick saat ini, feeProtocol, unlocked — 1 storage slot |
| `liquidity` | total likuiditas aktif **di tick saat ini** |
| `ticks` mapping | data per-tick: liquidityGross, liquidityNet, fee growth outside |
| `tickBitmap` | cari tick ter-inisialisasi berikutnya O(1)-ish |
| `positions` mapping | posisi LP per `(owner, tickLower, tickUpper)` |
| `observations` | array TWAP oracle (sampai 65535 slot, bisa di-grow) |

### `mint()` — Tambah Likuiditas

- Di bawah range → cuma butuh token0
- Di dalam range → butuh kombinasi token0 + token1
- Di atas range → cuma butuh token1

Pakai pola callback `uniswapV3MintCallback` — bukan `transferFrom` langsung.

### `swap()` — While-loop Multi-step

```
while (amountRemaining != 0 && price != priceLimit):
  1. Cari tickNext via tickBitmap
  2. computeSwapStep() — hitung step dalam range ini
  3. Jika harga capai tickNext → cross tick (update liquidityNet)
  4. Akumulasi fee ke feeGrowthGlobalX128
```

Gas lebih mahal dari V2 kalau cross banyak tick, tapi LP jauh lebih capital-efficient.

### `flash()` — Flash Loan Native

Flash loan built-in terpisah dari swap (V2 cuma lewat data param swap). Fee masuk ke LP via `feeGrowthGlobal`.

### Oracle TWAP (V3)

Array `observations` (max 65535) berisi `tickCumulative` + `secondsPerLiquidityCumulativeX128`. Bisa query TWAP untuk **rentang waktu custom** di masa lalu — jauh lebih powerful dari V2.

### Insight untuk Bulldex

1. Concentrated liquidity = big undertaking — perlu tick math presisi tinggi.
2. Fee tier per-pool lebih fleksibel dari fee global.
3. `NoDelegateCall` guard worth ditiru.
4. LP position jadi NFT di periphery (karena tiap posisi punya range unik).
5. Oracle multi-observation jauh lebih robust dari cumulative V2.

---

## 3. Uniswap V3 Periphery

> Source: `v3-periphery-main`, Solidity `0.7.6`

### Posisi dalam Arsitektur

Lapisan **user-facing** di atas v3-core. Core sengaja minimal — periphery yang handle: routing multi-hop, slippage protection, deadline, ETH wrapping, LP position sebagai NFT, quote harga, gasless approval.

### Struktur Repo

```
contracts/
├── SwapRouter.sol                    # exact-input/output swap, single & multi-hop
├── NonfungiblePositionManager.sol    # LP position sebagai ERC721
├── V3Migrator.sol                    # migrasi likuiditas dari V2 ke V3
├── base/
│   ├── Multicall.sol                 # batch banyak call jadi 1 tx
│   ├── SelfPermit.sol                # EIP-2612 permit
│   ├── PeripheryPayments.sol         # handle ETH wrap/unwrap
│   ├── PeripheryValidation.sol       # modifier checkDeadline
│   └── LiquidityManagement.sol
└── lens/
    ├── Quoter.sol / QuoterV2.sol
    └── TickLens.sol
```

### SwapRouter.sol

4 fungsi swap (single-hop vs multi-hop × exact input vs exact output):

| Fungsi | Kegunaan |
|---|---|
| `exactInputSingle` | A→B, input pasti |
| `exactInput` | A→B→C multi-hop, input pasti |
| `exactOutputSingle` | A→B, output pasti |
| `exactOutput` | multi-hop, output pasti (path terbalik) |

**Pola `uniswapV3SwapCallback`:**
Router tidak pegang token user. Pool transfer duluan → callback → router baru narik dari `msg.sender`. Router stateless, aman untuk banyak pool.

**Multi-hop via `Path.sol`:**
Path di-encode: `token0 (20 byte) + fee (3 byte) + token1 (20 byte) + fee (3 byte) + ...`. Tiap hop selesai, `path.skipToken()` potong segmen. Swap berantai via nested callback.

### NonfungiblePositionManager.sol

Karena tiap posisi V3 punya range harga unik, tiap posisi = **1 NFT (ERC721)**.

- `mint()` — buat posisi baru, transfer via callback, mint NFT ke recipient
- `increaseLiquidity()` / `decreaseLiquidity()` — nambah/kurangin tanpa NFT baru
- `collect()` — klaim fee tanpa cabut liquidity
- `burn()` — hanguskan NFT (cuma kalau liquidity & fee = 0)
- `ERC721Permit` — NFT bisa di-approve via signature

### Quoter.sol — Simulasi via Revert

Teknik pintar: panggil `pool.swap()` beneran tapi **revert di akhir** — kembalikan hasil hitungan lewat revert reason. Akurat termasuk price impact & tick crossing, tapi **jangan dipanggil on-chain** (mahal gas), hanya untuk `eth_call` off-chain.

### Libraries Kunci

- **`Path.sol`** — encode/decode path multi-hop
- **`PoolAddress.sol`** — hitung alamat pool via CREATE2 tanpa query on-chain
- **`LiquidityAmounts.sol`** — konversi token amount ↔ liquidity units
- **`OracleLibrary.sol`** — helper baca TWAP dari `observe()`
- **`CallbackValidation.sol`** — verifikasi `msg.sender` dalam callback adalah pool asli

### Insight untuk Bulldex

1. Pisahkan core vs periphery — core audit-friendly, periphery bisa di-upgrade.
2. `CallbackValidation` penting — selalu verifikasi alamat pool dalam callback.
3. `PoolAddress.computeAddress` (CREATE2) eliminasi query on-chain.
4. Multicall + SelfPermit → approve + swap dalam **1 transaksi**.
5. Quoter via revert-trick lebih reliable dari view function duplikat.

---

## 4. Uniswap V4 Core

> Source: `v4-core` (main), Solidity `0.8.26`

### Perubahan Arsitektur Besar dari V3

| Aspek | V3 | V4 |
|---|---|---|
| Pool per pasangan | Kontrak terpisah | **Singleton PoolManager** |
| Transfer token | Tiap langkah | Flash accounting (net delta) |
| Kustomisasi | Tidak ada | **Hooks** (14 callback points) |
| ETH support | Harus WETH | Native ETH (address(0)) |
| LP token ledger | Terpisah | ERC-6909 Claims internal |

### Singleton Contract

Semua pool disimpan dalam satu `PoolManager.sol`. Pool diidentifikasi lewat `PoolId` = hash dari `PoolKey(currency0, currency1, fee, tickSpacing, hooks)`.

### Flash Accounting via `unlock`

```
integrator.unlock(data)
  → PoolManager.unlockCallback(data)
    → integrator bebas panggil: swap, modifyLiquidity, donate, take, settle, mint, burn
  → sesi ditutup jika seluruh delta currency = 0 (NonzeroDeltaCount check)
```

Alih-alih transfer tiap step, PoolManager lacak **net delta** (utang/piutang). Settlement di akhir batch.

### Hooks

Setiap pool bisa dipasangi kontrak hook opsional. **14 flag bit** di alamat kontrak hook menentukan callback mana yang aktif (before/after Initialize, AddLiquidity, RemoveLiquidity, Swap, Donate + 4 flag "returns delta"). Permission tidak bisa berubah setelah pool dibuat.

### Struktur Folder

```
src/
├── PoolManager.sol          # kontrak utama (singleton)
├── ProtocolFees.sol
├── ERC6909.sol / ERC6909Claims.sol
├── NoDelegateCall.sol
├── Extsload.sol / Exttload.sol
├── interfaces/
├── libraries/               # Pool, Hooks, Position, SwapMath, TickMath, TickBitmap, StateLibrary
└── types/                   # PoolKey, PoolId, Currency, BalanceDelta, Slot0
```

### Fungsi Publik Utama PoolManager

- `unlock(bytes data)` — buka sesi, panggil callback, tutup jika delta lunas
- `initialize(PoolKey, sqrtPriceX96)` — buat pool baru
- `modifyLiquidity(PoolKey, params, hookData)` — tambah/kurangi likuiditas
- `swap(PoolKey, SwapParams, hookData)` — eksekusi swap
- `donate(PoolKey, amount0, amount1, hookData)` — donate ke LP aktif
- `settle()`, `take()`, `mint()`, `burn()` — primitif akuntansi delta

### Types Kunci

| Type | Isi |
|---|---|
| `PoolKey` | currency0, currency1, fee, tickSpacing, hooks |
| `PoolId` | hash dari PoolKey |
| `Currency` | wrapper address (address(0) = native ETH) |
| `BalanceDelta` | int256 mengepak dua int128 (amount0, amount1) |
| `Slot0` | bytes32 custom: sqrtPriceX96 (160bit) + tick (24bit) + protocolFee (24bit) + lpFee (24bit) |

### Dynamic Fee & Hook Override

Pool bisa punya fee statis atau `DYNAMIC_FEE_FLAG`. Hook `beforeSwap` bisa mengembalikan override fee per-swap (`OVERRIDE_FEE_FLAG`).

### Insight untuk Bulldex

1. Singleton + flash accounting = gas efficiency drastis untuk multi-hop.
2. Hooks = customization tanpa fork — bisa tambah fee logic, whitelist, oracle sendiri.
3. ERC-6909 ledger internal = efficient multi-token accounting.
4. `NoDelegateCall` + `Extsload` pattern worth ditiru.

---

## 5. Uniswap V4 Periphery

> Source: `v4-periphery` (main), GPL-2.0

### Posisi dalam Arsitektur

Di atas v4-core. Core cuma PoolManager — periphery yang bikin protokol **bisa dipakai dApp**: NFT position manager, router swap, quoter off-chain, lens baca state, pool permissioned.

### Struktur Folder

```
src/
├── PositionManager.sol            # NFT LP position manager
├── V4Router.sol                   # abstract router swap
├── PositionDescriptor.sol         # generator tokenURI/SVG untuk NFT
├── base/                          # building blocks abstract
├── interfaces/
├── libraries/
├── lens/                          # StateView, V4Quoter, ReservesLens
└── hooks/permissionedPools/       # pool dengan whitelist
```

### PositionManager.sol

Entry point: `modifyLiquidities(bytes unlockData, uint256 deadline)` → batch aksi via Actions opcode.

Aksi yang didukung: `INCREASE_LIQUIDITY`, `DECREASE_LIQUIDITY`, `MINT_POSITION`, `BURN_POSITION`.

Inherit: `ERC721Permit_v4`, `Multicall_v4`, `DeltaResolver`, `ReentrancyLock`, `Permit2Forwarder`, `NativeWrapper`.

### V4Router.sol (abstract)

Handle: `SWAP_EXACT_IN`, `SWAP_EXACT_IN_SINGLE`, `SWAP_EXACT_OUT`, `SWAP_EXACT_OUT_SINGLE`. Multi-hop via `PathKey[]`. Mendukung `OPEN_DELTA` — amount auto-dihitung dari delta existing.

### Action-Batching Pattern

```
encode urutan Actions + params → bytes
  → unlock callback ke PoolManager
    → decode & eksekusi tiap aksi
  → settle semua delta di akhir
```

Pola ini konsisten di semua kontrak "aktif" (PosM, Router). Gas efficient, flexible.

### Lens (Read-Only)

| Kontrak | Fungsi |
|---|---|
| `StateView.sol` | Baca slot0, tick info, posisi — untuk client off-chain |
| `V4Quoter.sol` | Simulasi swap via revert-and-catch — off-chain only |
| `ReservesLens.sol` | Hitung TVL/liquidity curve agregat sebuah pool |

### permissionedPools/

Varian untuk pool dengan akses terbatas (RWA, compliance):
- `PermissionedPositionManager` — extends PosM dengan allowlist check
- `PermissionsAdapter` — ERC-20 wrapper dengan lapisan permission
- `PermissionFlags` — bitflag kombinasi izin

### Libraries Penting

- `Actions.sol` — daftar konstanta aksi (opcode)
- `CalldataDecoder.sol` — decode calldata compact per-aksi (hemat gas)
- `SlippageCheck.sol` — validasi slippage saat modify liquidity
- `QuoterRevert.sol` — pola "revert to return data"

### Insight untuk Bulldex

1. Action-batching = cara V4 untuk batch ops — worth ditiru untuk router Bulldex (Phase 3).
2. Delta accounting + settlement di akhir — lebih efisien dari transfer per-step.
3. `Notifier` + `ISubscriber` pattern untuk integrasi farming contract ke posisi LP.
4. `permissionedPools` blueprint kalau Bulldex butuh KYC/whitelist di masa depan.

---

## 6. Uniswap App Interface

> Repo: `interface` (Universe), monorepo frontend Uniswap Labs

### Overview

Monorepo front-end resmi Uniswap Labs. **Bukan smart contract** — isinya kode aplikasi (Web, Mobile, Extension) yang jadi UI untuk protokol Uniswap (v2/v3/v4 + UniswapX).

- Web: `app.uniswap.org`
- Wallet: `wallet.uniswap.org`

### Tiga Aplikasi

| App | Platform | Isi |
|---|---|---|
| `apps/web` | React + Vite | Web app DEX. `src/pages`, `src/state`, `src/featureFlags`, Cypress + Playwright |
| `apps/mobile` | React Native | Wallet mobile. `ios/` (Xcode), `android/` (Gradle), `.maestro/` E2E |
| `apps/extension` | Browser extension | `background/`, `contentScript/`, `entrypoints/`, `workers/` |

### Shared Packages (~29 package)

| Package | Fungsi |
|---|---|
| `ui` | Komponen UI cross-platform (Tamagui) + theme |
| `uniswap` | Core business logic protokol (swap, pool) |
| `wallet` | Logic fungsi wallet (akun, transaksi) |
| `utilities` | Helper umum |
| `chains` | Konfigurasi multi-chain |
| `api`, `trpc`, `react-query` | Data fetching layer |
| `gating`, `experiments`, `compliance` | Feature flag, A/B test, geo-blocking |

### Tech Stack

- TypeScript di semua kode
- **React** (web/extension) + **React Native** (mobile)
- **Redux Toolkit** untuk state kompleks; **Zustand** untuk state simple
- **Tamagui** — sistem UI cross-platform (wajib pakai `styled` dari `ui/src`)
- **Viem** — interaksi blockchain
- **NX** — build orchestration; **Bun** — package manager
- Support Uniswap v2/v3/v4/UniswapX, multi-chain, multi-wallet

### Konvensi Kode

- Komponen: state di atas → event handler → JSX di bawah, max 250 baris
- Hindari `any`, pakai `unknown`; eksplisit return type
- File platform-specific: `.ios.tsx` / `.android.tsx` / `.web.tsx` / `.native.tsx`
- String terjemahan: `useTranslation` + `bun i18n:extract`

### Insight untuk Bulldex Frontend

1. Pisahkan logic per-domain ke package/hook terpisah (bukan semua di 1 file).
2. Zustand untuk state simple, Redux untuk state kompleks yang butuh time-travel/devtools.
3. Multi-platform dari awal kalau mau mobile app — Tamagui memungkinkan share komponen.
4. Feature flags (`gating`) penting untuk rollout fitur baru tanpa deploy ulang.

---

## 7. Perbandingan Evolusi V2 → V4

| Aspek | V2 | V3 | V4 |
|---|---|---|---|
| **Pool per pasangan** | Kontrak terpisah | Kontrak terpisah | Singleton PoolManager |
| **Likuiditas** | Full range (0→∞) | Concentrated (range) | Concentrated + Hooks |
| **Fee tier** | Fixed 0.3% | 0.05% / 0.3% / 1% | Static atau Dynamic |
| **LP token** | ERC20 fungible | NFT (ERC721) | NFT + ERC-6909 claims |
| **Flash loan** | Via swap callback | Native `flash()` | Via unlock session |
| **Oracle** | Cumulative price | Multi-observation array | Multi-observation (diwarisi) |
| **Kustomisasi** | Tidak ada | Tidak ada | Hooks (14 flag bits) |
| **ETH native** | Harus wrap ke WETH | Harus wrap ke WETH | Langsung (address(0)) |
| **Transfer pattern** | Transfer per swap | Optimistic + callback | Flash accounting (net delta) |
| **Relevansi Bulldex** | Basis Pool.sol saat ini | Referensi tick math | Target arsitektur masa depan |

### Rekomendasi untuk Bulldex Roadmap

- **Phase 1-2 (sekarang):** Pola V2 — sederhana, teruji, cukup untuk MVP.
- **Phase 3 (Router):** Pola V3 Periphery — multi-hop, deadline, path encoding.
- **Phase 4+ (masa depan):** Pertimbangkan pola V4 — hook system untuk custom fee logic, farming integration, dan flash accounting untuk gas efficiency.

---

*Last updated: Aug 2026. Sumber: official Uniswap repos (v2-core, v3-core, v3-periphery, v4-core, v4-periphery, interface).*
