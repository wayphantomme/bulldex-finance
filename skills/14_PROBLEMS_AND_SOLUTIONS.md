# Bulldex Finance - Problems & Solutions Log

Semua masalah yang ditemukan selama development, beserta solusinya.
Diupdate setiap kali ada problem baru.

---

## Solidity / Foundry

### P-001: forge install failed - "not a git repository"
**Konteks:** Saat pertama kali setup project  
**Problem:** `forge install` gagal karena belum ada git repo  
**Solution:** `git init` dulu di root repo sebelum `forge install`. Foundry menggunakan git submodules untuk dependencies  
**Prevention:** Selalu `git init` sebelum `forge install` di project baru

---

### P-002: OpenZeppelin v5.7.0 crash - "Unknown evm version: osaka"
**Konteks:** Foundry 0.3.0 (Dec 2024)  
**Problem:** OZ v5.7.0 menggunakan `osaka` EVM version yang belum support di Foundry 0.3.0  
**Solution:** Pin OZ ke v5.1.0 di `foundry.toml`: `openzeppelin-contracts = { version = "5.1.0" }`  
**Prevention:** Selalu cek compatibility matrix antara Foundry version dan OZ version

---

### P-003: Deploy.s.sol compile error - em dash character
**Konteks:** String literal di Solidity  
**Problem:** Em dash (—) dalam string literal menyebabkan compile error. Solidity hanya support ASCII  
**Solution:** Ganti em dash dengan hyphen biasa (-). Gunakan `unicode"..."` prefix kalau butuh Unicode  
**Prevention:** Jangan copy-paste teks dari editor yang auto-convert ke em dash

---

### P-004: ERC20.Transfer event reference failed - "Member Transfer not found"
**Konteks:** Foundry tests dengan `vm.expectEmit`  
**Problem:** Tidak bisa reference event lewat contract type syntax `ERC20.Transfer`  
**Solution:** Declare event lokal di test contract dan gunakan itu untuk `vm.expectEmit`
```solidity
event Transfer(address indexed from, address indexed to, uint256 value);
```
**Prevention:** Foundry tidak support event reference via contract type - always declare locally

---

### P-005: vm.prank cannot overwrite a prank
**Konteks:** Foundry nightly breaking change  
**Problem:** `vm.prank` di `setUp()` diikuti `vm.prank` di test - nightly Foundry lebih strict  
**Solution:** Hapus `vm.prank` dari `setUp()`. Token constructor menerima `initialOwner` sebagai param - tidak perlu prank  
**Prevention:** Jangan pakai `vm.prank` di `setUp()` kalau bisa dihindari. Gunakan constructor params

---

### P-006: IERC20Metadata interface conflict - "Identifier already declared"
**Konteks:** PoolFactory.sol  
**Problem:** Interface `IERC20Metadata` dideklarasi dua kali - satu dari OZ import, satu inline di bawah file  
**Solution:** Hapus inline interface, import langsung dari OZ:
```solidity
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
```
**Prevention:** Selalu check apakah interface sudah ada di imported libraries sebelum declare sendiri

---

### P-007: assertLt(address, address) not found in forge-std
**Konteks:** Pool.t.sol test untuk token ordering  
**Problem:** Foundry `assertLt` tidak punya overload untuk `address` type  
**Solution:** Cast ke `uint160`: `assertLt(uint160(t0), uint160(t1))`  
**Prevention:** Foundry std assertions hanya support `uint256` dan `int256`

---

### P-008: Stack too deep in Solidity script
**Konteks:** DeployWETHPool.s.sol  
**Problem:** Terlalu banyak local variables dalam satu function menyebabkan "stack too deep"  
**Solution:** Extract ke helper functions (`_deployWETH`, `_createPool`, `_seedPool`, `_printSummary`)  
**Prevention:** Jaga function agar tidak lebih dari ~7-8 local variables. Extract ke helpers kalau perlu

---

### P-009: Contract verification failing - Etherscan V1 API deprecated
**Konteks:** BDX Token verification  
**Problem:** Foundry CLI verification gagal karena Etherscan V1 API deprecated  
**Solution:** Gunakan flatten + manual verify di Etherscan web UI:
```bash
forge flatten src/Token.sol | pbcopy
# Paste di Etherscan > Contract > Verify > Flatten source code
```
**Prevention:** Selalu gunakan `--etherscan-api-key` dan pastikan API key support V2

---

### P-010: "in-flight transaction limit reached" saat broadcast
**Konteks:** Deploy.s.sol di Sepolia via Alchemy  
**Problem:** Alchemy delegated account limit - terlalu banyak tx inflight sekaligus  
**Solution:** Tambah flag `--skip-simulation --gas-price 5000000000 --timeout 90` ke forge script command  
**Prevention:** Hindari deploy script dengan terlalu banyak sequential transactions via Alchemy free tier

---

### P-011: "replacement transaction underpriced" saat redeploy
**Konteks:** Nonce collision setelah failed broadcast  
**Problem:** Previous failed tx masih di mempool dengan nonce yang sama  
**Solution:** Tunggu tx pending clear, atau tambah `--gas-price` yang lebih tinggi untuk override  
**Prevention:** Selalu check nonce: `cast nonce <address> --rpc-url $RPC`

---

## TypeScript / Frontend

### P-012: TypeScript BigInt literal error TS2737
**Konteks:** wagmi hooks dengan bigint  
**Problem:** `0n`, `1n` syntax error "BigInt literals not available when targeting lower than ES2020"  
**Solution:** Update `tsconfig.json`:
```json
{ "target": "ES2020", "lib": ["dom", "dom.iterable", "ES2020"] }
```
**Prevention:** Selalu set `target: ES2020` untuk project yang pakai wagmi/viem

---

### P-013: useSwap allowance hook ABI type mismatch
**Konteks:** Dynamic ABI selection di useSwap hook  
**Problem:** TypeScript tidak bisa infer ABI type kalau ABI dipilih secara dynamic (`isBDX ? ABI_A : ABI_B`)  
**Solution:** Split jadi dua `useReadContract` hooks terpisah dengan boolean flag `enabled`  
**Prevention:** TypeScript wagmi hooks butuh static ABI type - jangan dynamic selection

---

### P-014: "Hubungkan Dompet" - RainbowKit bahasa Indonesia
**Konteks:** RainbowKit ConnectButton  
**Problem:** RainbowKit auto-detect browser locale  
**Solution:** Tambah `locale="en-US"` ke `RainbowKitProvider`:
```tsx
<RainbowKitProvider locale="en-US">
```
**Prevention:** Selalu set locale explicitly di production

---

### P-015: Swap balance selalu 0 walaupun wallet ada balance
**Konteks:** Swap page balance display  
**Problem:** `useTokenBalance` hook dipanggil dua kali tapi keduanya baca BDX. MUSDC balance tidak pernah dibaca  
**Root cause:**
```ts
const { raw: balanceIn }  = useTokenBalance(address); // reads BDX
const { raw: balanceMUSC } = useTokenBalance(address); // ALSO reads BDX!
```
**Solution:** Buat `useTokenBalances.ts` yang baca semua token sekaligus via multicall:
```ts
const { bdx, musdc, weth, eth } = useTokenBalances(address);
const tokenInBalance = getBalanceForSymbol(tokenIn.symbol, balances);
```
**Prevention:** Kalau punya multiple tokens, selalu baca semua sekaligus dengan multicall. Jangan assume hook yang sama bisa di-reuse untuk token berbeda

---

### P-016: Token picker tidak ada - user tidak bisa pilih ETH/WETH
**Konteks:** Swap UI  
**Problem:** TokenPill hanya display, tidak clickable. User tidak bisa switch token  
**Solution:** Ganti `TokenPill` dengan `TokenSelector` (clickable) + `TokenPicker` dropdown modal yang show balance per token  
**Prevention:** DeFi swap UI selalu butuh token selector - jangan hardcode token pair

---

## React / Next.js

### P-017: react/no-unescaped-entities - raw `"` di JSX
**Konteks:** docs/page.tsx (terjadi 2x di file yang sama!)  
**Problem:** Raw double-quote `"` di dalam JSX text node menyebabkan ESLint error dan build failure  
**Solution:** Escape dengan `&quot;`:
```tsx
// Wrong:
<p>LP token: "Bulldex LP"</p>
// Correct:
<p>LP token: &quot;Bulldex LP&quot;</p>
```
**Prevention:** Jangan pernah pakai raw `"` di dalam JSX text. Gunakan `&quot;` atau simpan string di variable JS

---

### P-018: Next.js stale .next cache - "Cannot find module './1682.js'"
**Konteks:** Local dev server  
**Problem:** Stale webpack chunks setelah dependency update atau code change besar  
**Solution:**
```bash
rm -rf .next && npm run dev
```
**Prevention:** Selalu clear `.next` folder setelah install package baru atau upgrade Next.js

---

### P-019: npm run dev error - "Cannot read package.json"
**Konteks:** Terminal di root folder  
**Problem:** Menjalankan `npm run dev` di root `bulldex-finance/` bukan di `frontend/`  
**Solution:** `cd frontend && npm run dev`  
**Prevention:** Project ini monorepo - `package.json` ada di `frontend/`, bukan root

---

## Vercel / CI/CD

### P-020: Vercel 404 setelah successful build
**Konteks:** First Vercel deployment  
**Problem:** Next.js ada di `frontend/` subfolder, tapi Vercel deploy dari root  
**Solution:** Set **Root Directory = `frontend`** di Vercel Project Settings > General  
**Prevention:** Selalu set Root Directory di Vercel kalau Next.js bukan di root repo

---

### P-021: GitHub Actions Foundry test gagal - vm.prank nightly
**Konteks:** CI pipeline  
**Problem:** Foundry nightly di GitHub Actions lebih strict dari local  
**Solution:** Hapus `vm.prank` dari `setUp()` - lihat P-005  
**Prevention:** Test locally dengan Foundry nightly (`foundryup --version nightly`) sebelum push

---

### P-022: Vercel build error - Commit old vs latest
**Konteks:** Vercel triggered dari old commit  
**Problem:** Vercel masih build dari commit lama karena triggered oleh event sebelumnya  
**Solution:** Push empty commit untuk trigger redeploy dari HEAD:
```bash
git commit --allow-empty -m "ci: trigger redeploy"
git push origin main
```
**Prevention:** Check Vercel dashboard untuk confirm commit SHA yang sedang di-deploy

---

## Web3 / Blockchain

### P-023: ETH tidak bisa di-swap langsung di AMM Pool
**Konteks:** Menambah ETH/WETH pool  
**Problem:** Pool.sol menggunakan `IERC20.transferFrom` - tidak support ETH native  
**Solution (Opsi A - WETH):**
1. Deploy `WETH.sol` (WETH9-style)
2. Create `BDX/WETH` pool via PoolFactory
3. Frontend: auto-wrap ETH → WETH sebelum swap (`WETH.deposit{value}()`)
4. Display sebagai "ETH" di UI tapi pakai WETH di kontrak
**Solution (Opsi B - simpler):** MockToken("WETH") untuk testnet  
**Chosen:** Opsi A - lebih realistis untuk portfolio  
**Prevention:** Selalu design AMM dengan WETH dari awal kalau mau support ETH

---

### P-024: Pool.removeLiquidity tidak butuh LP approval
**Konteks:** useRemoveLiquidity hook  
**Problem:** Hook mencoba baca LP `allowance` tapi fungsi tidak ada di POOL_ABI  
**Root cause:** `Pool.removeLiquidity` memanggil `_burn(msg.sender)` langsung - tidak pakai `transferFrom` sehingga tidak butuh approval  
**Solution:** Hapus allowance read, langsung call `removeLiquidity`  
**Prevention:** Baca contract code dulu sebelum assume butuh approval

---

### P-025: BDX/WETH pool seed gagal - "OutOfFunds"
**Konteks:** DeployWETHPool.s.sol  
**Problem:** Script seed 0.5 ETH tapi deployer balance setelah gas hanya ~0.28 ETH  
**Solution:** Kurangi seed amount ke 0.1 ETH. Gunakan sisa untuk gas  
**Prevention:** Selalu check `deployer.balance` sebelum seed. Formula: `seed_amount + estimated_gas_cost < balance`

---

## Design / CSS

### P-026: Tailwind class tidak di-apply - "too green" feeling
**Konteks:** Phase 1-4 design upgrade  
**Problem:** `base-bg: #0C0F0C` menggunakan green-tinted black, semua surface terlihat olive. Brand color vs semantic color tidak dibedakan  
**Solution:** Split menjadi dua token:
- `brand: #C6F135` (lime) - untuk CTA, active state
- `green: #4ADE80` (emerald) - semantic positive (price up, success)
Ubah semua `base-*` ke neutral tanpa green tint  
**Prevention:** DeFi UI: green = signal color (5% surface area), BUKAN background fill

---

### P-027: Dot grid tidak visible di dark background
**Konteks:** Background texture implementation  
**Problem:** Opacity `0.05` terlalu rendah di background `#0A0A0B`  
**Solution:** Naikkan opacity ke `0.08`, ukuran dari `24px` ke `22px`:
```css
background-image: radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px);
background-size: 22px 22px;
```
**Prevention:** Test dot grid di semua screen brightness settings. `0.05` terlalu subtle

---

### P-028: Lucide `Github` tidak ada - import error
**Konteks:** docs/page.tsx  
**Problem:** `lucide-react` tidak export `Github` (kapital G) - nama yang benar tidak ada  
**Solution:** Buat inline SVG `GithubIcon` component sendiri  
**Prevention:** Cek available exports: `node -e "const l = require('lucide-react'); console.log(Object.keys(l).filter(k => k.includes('git')))"`

---

## Pool / AMM Math

### P-029: Price impact test failing - expected < 10 bps got 30 bps
**Konteks:** test_PriceImpact_SmallSwapIsLow  
**Problem:** 0.3% fee sendiri menambah ~30 bps baseline impact bahkan untuk swap kecil  
**Solution:** Adjust threshold ke `< 50 bps` yang mencerminkan realita  
**Prevention:** Fee 0.3% = 30 bps baseline. Impact threshold harus > 30 bps untuk small swaps

---

### P-030: test_RemoveLiquidity_ReturnsTokens failing - MINIMUM_LIQUIDITY rounding
**Konteks:** Pool.t.sol  
**Problem:** `MINIMUM_LIQUIDITY` (1000 wei) yang locked on first mint menyebabkan proportional return tidak exact  
**Solution:** Gunakan `assertApproxEqRel` dengan 1% tolerance:
```solidity
assertApproxEqRel(out0, expected0, 0.01e18);
```
**Prevention:** Pool dengan MINIMUM_LIQUIDITY selalu punya slight rounding - jangan expect exact equality

---

## Ringkasan Quick Reference

| Kategori | Jumlah Problems |
|----------|----------------|
| Solidity/Foundry | 11 (P-001 s/d P-011) |
| TypeScript/Frontend | 5 (P-012 s/d P-016) |
| React/Next.js | 3 (P-017 s/d P-019) |
| Vercel/CI/CD | 3 (P-020 s/d P-022) |
| Web3/Blockchain | 3 (P-023 s/d P-025) |
| Design/CSS | 3 (P-026 s/d P-028) |
| Pool/AMM Math | 2 (P-029 s/d P-030) |
| **Total** | **30 problems solved** |

---

*Last updated: Aug 2026 — selalu update saat ada problem baru*
