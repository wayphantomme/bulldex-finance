# Uniswap v4-periphery — Ringkasan

## Apa Ini
`v4-periphery` adalah lapisan kontrak "di atas" `v4-core`. Kalau core cuma nyediain `PoolManager` (singleton, minimal, unopinionated), periphery ini yang bikin protokolnya *bisa dipakai* manusia/dApp: posisi LP dalam bentuk NFT, router untuk swap, quoter off-chain, lens buat baca state, sampai kontrak khusus untuk pool "permissioned" (whitelist).

Status di README: masih under development, GPL-2.0 licensed, didesain buat di-`forge install`.

## Struktur Folder (`src/`)
```
src/
├── PositionManager.sol            # NFT LP position manager (kontrak utama)
├── V4Router.sol                   # abstract router untuk swap
├── PositionDescriptor.sol         # generator tokenURI/SVG untuk NFT posisi
├── UniswapV4DeployerCompetition.sol  # kontes salt CREATE2 buat vanity address PoolManager
├── base/            # building blocks abstract yang di-inherit kontrak utama
├── interfaces/       # semua interface publik
├── libraries/         # helper libraries (encode/decode calldata, math, dll)
├── lens/             # kontrak read-only (StateView, V4Quoter, ReservesLens)
└── hooks/permissionedPools/  # varian PositionManager & Router untuk pool permissioned
```

## Kontrak Utama

### 1. `PositionManager.sol` (PosM) — 574 baris
Kontrak paling sentral. Mint & kelola posisi likuiditas sebagai **ERC-721**.
- Inherit banyak: `ERC721Permit_v4`, `PoolInitializer_v4`, `Multicall_v4`, `DeltaResolver`, `ReentrancyLock`, `BaseActionsRouter`, `Notifier`, `Permit2Forwarder`, `NativeWrapper`.
- Entry point: `modifyLiquidities(bytes unlockData, uint256 deadline)` → membuka lock di `PoolManager` lalu jalanin batch aksi (encode sebagai `Actions` + params).
- Ada varian `modifyLiquiditiesWithoutUnlock` untuk dipanggil saat `PoolManager` sudah unlocked (dari kontrak lain).
- State: `nextTokenId`, `positionInfo[tokenId]`, `poolKeys[poolId]` (mapping id pendek → `PoolKey` biar hemat storage).
- `tokenURI()` didelegasikan ke `PositionDescriptor`.
- Mendukung aksi: `INCREASE_LIQUIDITY`, `DECREASE_LIQUIDITY`, `MINT_POSITION`, `BURN_POSITION`, (2 varian "FROM_DELTAS" sudah **deprecated** karena rawan sandwich attack).

### 2. `V4Router.sol` — abstract, 252 baris
Logic swap generik yang di-inherit router konkret (mis. Universal Router).
- `_handleAction()` menangani: `SWAP_EXACT_IN`, `SWAP_EXACT_IN_SINGLE`, `SWAP_EXACT_OUT`, `SWAP_EXACT_OUT_SINGLE`, plus aksi settlement (`SETTLE`, `SETTLE_ALL`, `TAKE`, `TAKE_ALL`, `TAKE_PORTION`).
- Mendukung `OPEN_DELTA` (`ActionConstants.OPEN_DELTA`) — amount bisa "auto" dihitung dari delta yang sudah ada di `PoolManager`, berguna buat multi-hop.
- Multi-hop swap pakai `PathKey[]`.

### 3. `PositionDescriptor.sol` — 127 baris
Generate metadata NFT (nama, deskripsi, gambar SVG on-chain) buat posisi PosM. Pakai `libraries/SVG.sol`, `Descriptor.sol`, `HexStrings.sol`, `AddressStringUtil.sol`, `CurrencyRatioSortOrder.sol`.

### 4. `UniswapV4DeployerCompetition.sol` — 85 baris
Kontrak kompetisi cari `salt` CREATE2 terbaik (vanity address) untuk deploy `PoolManager`, dengan deadline dan scoring lewat `VanityAddressLib`.

## `base/` — Building Blocks Abstract
| Kontrak | Fungsi |
|---|---|
| `BaseActionsRouter.sol` | Loop generik buat decode & eksekusi batch `Actions` |
| `BaseV4Quoter.sol` | Basis untuk kontrak quoting (revert-based) |
| `DeltaResolver.sol` | Helper settle/take delta ke `PoolManager` |
| `EIP712_v4.sol` | Domain separator EIP-712 (buat signature, mis. Permit) |
| `ERC721Permit_v4.sol` | ERC-721 + permit (approve via signature) — dipakai NFT posisi |
| `ImmutableState.sol` | Nyimpen `poolManager` immutable |
| `Multicall_v4.sol` | Batch banyak call dalam satu tx |
| `NativeWrapper.sol` | Wrap/unwrap native ETH ↔ WETH9 |
| `Notifier.sol` | Sistem subscribe/unsubscribe notifikasi perubahan posisi (buat integrasi external, mis. farming contract) |
| `Permit2Forwarder.sol` | Forward call ke Permit2 (approval token tanpa tx terpisah) |
| `PoolInitializer_v4.sol` | Fungsi `initializePool` |
| `ReentrancyLock.sol` | Guard reentrancy sederhana |
| `SafeCallback.sol` | Validasi caller = `PoolManager` saat unlock callback |
| `UnorderedNonce.sol` | Nonce non-sekuensial (buat signature/permit anti-replay) |

## `libraries/` — Helper Penting
- **`Actions.sol`** — daftar konstanta aksi (opcode) yang bisa di-batch: liquidity (`INCREASE/DECREASE/MINT/BURN_POSITION`), swap (`SWAP_EXACT_IN/OUT[_SINGLE]`), settlement (`SETTLE*`, `TAKE*`), currency ops (`CLOSE_CURRENCY`, `SWEEP`, `WRAP`/`UNWRAP`, `MINT_6909`/`BURN_6909`), dan aksi khusus permissioned pools (`UNWIND_WITH_FALLBACK`, `SUBSCRIBE`, `UNSUBSCRIBE`).
- **`CalldataDecoder.sol`** (387 baris) — decode calldata mentah jadi struct params per-aksi. Ini yang bikin batching hemat gas (encode compact, decode manual).
- `PathKey.sol` — struct buat multi-hop swap path.
- `LiquidityAmounts.sol` — konversi liquidity ↔ amount0/amount1.
- `SlippageCheck.sol` — validasi slippage min/max saat modify liquidity.
- `PositionInfoLibrary.sol` / `PositionConfig.sol` / `PositionConfigId.sol` — packing info posisi (pool, tickLower/Upper, dsb) jadi bentuk hemat storage.
- `QuoterRevert.sol` — pola "revert to return data" buat quoting off-chain.
- `BipsLibrary.sol`, `ActionConstants.sol`, `CurrencyRatioSortOrder.sol`, `AddressStringUtil.sol`, `HexStrings.sol`, `SVG.sol`, `Descriptor.sol`, `SafeCurrencyMetadata.sol`, `VanityAddressLib.sol`, `Locker.sol`, `ERC721PermitHash.sol` — utilitas pendukung (formatting, math kecil, hashing).

## `lens/` — Kontrak Read-Only (Off-chain Friendly)
| Kontrak | Fungsi |
|---|---|
| `StateView.sol` (109 baris) | Wrapper view atas `StateLibrary` core — baca slot0, tick info, posisi, dll tanpa perlu extsload manual. Ditujukan untuk client off-chain. |
| `V4Quoter.sol` (159 baris) | Simulasi hasil swap (exact in/out) pakai teknik revert-and-catch — **bukan** buat dipanggil on-chain (mahal gas), murni buat quoting off-chain. |
| `ReservesLens.sol` (535 baris) | Hitung TVL/liquidity curve agregat sebuah pool dengan jalan-jalan di initialized ticks (pakai `SqrtPriceMath`), plus baca statistik hook opsional (`IHookStats`, standar "URC-3"). Stateless, `PoolManager` di-pass per call biar bytecode-nya bisa dideploy deterministic. |

## `hooks/permissionedPools/` — Modul Pool Permissioned (Whitelist)
Varian khusus buat pool yang aksesnya dibatasi (mis. RWA, compliance):
- `PermissionedPositionManager.sol` — extends `PositionManager` biasa, nambahin cek allowlist.
- `PermissionedV4Router.sol` — abstract, extends `V4Router`, override `_pay`/`_mapSettleAmount` buat wrap/unwrap "permissioned token".
- `PermissionsAdapter.sol` — ERC-20 wrapper yang membungkus token asli dengan lapisan permission (pakai OZ `Ownable2Step`).
- `PermissionsAdapterFactory.sol` — factory bikin adapter di atas.
- `BaseAllowListChecker.sol` + `interfaces/IAllowlistChecker.sol` — logic cek whitelist yang bisa dikustom.
- `libraries/PermissionFlags.sol` — bitflag buat kombinasi izin (transfer, swap, dll).

## Interfaces (`interfaces/`)
Interface publik untuk tiap kontrak di atas: `IPositionManager`, `IV4Router`, `IV4Quoter`, `IStateView`, `IReservesLens`, `IPositionDescriptor`, `INotifier`, `ISubscriber` (dipanggil PosM ke subscriber saat posisi berubah), `IUnorderedNonce`, `IPermit2Forwarder`, `IEIP712_v4`, `IERC721Permit_v4`, `IMulticall_v4`, `IImmutableState`, `IMsgSender`, `IPoolInitializer_v4`, `IUniswapV4DeployerCompetition`, plus `interfaces/external/IWETH9.sol` dan `IHookStats.sol`.

## Dependency
- `lib/v4-core` — core protocol (PoolManager, types, libraries dasar).
- `lib/permit2` — Uniswap Permit2 buat approval token gasless-ish.
- OpenZeppelin & Solmate (dipakai di modul permissioned pools).

## Pola Desain yang Menonjol
1. **Action-batching pattern** — hampir semua kontrak "aktif" (PosM, Router) pakai pola yang sama: encode urutan `Actions` + params jadi bytes, lalu di-decode & dieksekusi dalam satu unlock callback ke `PoolManager`. Ini pola khas v4 buat gas efficiency & flexibility (mirip "multicall internal").
2. **Delta accounting** — kontrak-kontrak ini nggak transfer token tiap step, tapi ngumpulin "delta" (utang/piutang) ke `PoolManager` lalu di-settle/take di akhir batch (`DeltaResolver`).
3. **Separation of concerns** — core cuma nyimpen state pool, semua UX-facing logic (NFT, router, quoting, descriptor) dipisah ke periphery, sesuai filosofi v4 yang core-nya seminimal mungkin.

---
*Sumber: `v4-periphery-main.zip` (branch `main`, Uniswap/v4-periphery). Disusun otomatis dari struktur & isi source code, bukan dokumentasi resmi.*
