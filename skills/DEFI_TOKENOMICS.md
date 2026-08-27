# DeFi Tokenomics & Revenue Model

Panduan lengkap memahami bagaimana DeFi protocol bekerja secara ekonomi -
dari jenis token, revenue model, hingga cara protocol menghasilkan uang.

---

## 1. Jenis Token dalam DeFi

### Native Token
Token bawaan blockchain. Dipakai untuk gas fee.
- ETH (Ethereum)
- BNB (BSC)
- SOL (Solana)
- MATIC (Polygon)

Tidak bisa dibuat sendiri - sudah built-in di protocol layer.

### Protocol Token (ERC-20)
Token yang dibuat oleh sebuah protocol di atas blockchain.
Contoh: UNI (Uniswap), AAVE (Aave), CRV (Curve), BDX (Bulldex).

Tidak punya fungsi gas, tapi punya utility di dalam protocol.

### LP Token (Liquidity Provider Token)
Token yang didapat ketika kamu menyetor likuiditas ke pool.
Merepresentasikan share kamu di pool tersebut.
Contoh: UNI-V2, BDX-MUSDC-LP

### Stablecoin
Token yang nilainya di-peg ke fiat (biasanya $1).
Contoh: USDC, USDT, DAI

---

## 2. Klasifikasi BDX

BDX adalah **Governance + Utility Token** (Protocol Token ERC-20).

Bukan native token, bukan stablecoin, bukan LP token.

| Fungsi | Deskripsi |
|--------|-----------|
| Governance | Voting power untuk keputusan protocol |
| Staking | Stake BDX, earn protocol revenue share |
| Farming | Earn BDX sebagai reward LP |
| Fee Sharing | Holders dapat bagian dari protocol fee |

Nilainya tied ke **usage dan revenue dari Bulldex protocol**.

---

## 3. Revenue Model DeFi Protocol

### Swap Fee
Setiap transaksi swap dikenakan fee.

```
User swap 1000 USDC -> ETH
Fee 0.3% = 3 USDC
```

Fee ini dibagi antara:
- LP Providers (likuiditas yang disediakan)
- Protocol Treasury (via protocol fee switch)

### Protocol Fee Switch
Mekanisme di mana sebagian swap fee dialihkan ke protocol treasury.

```
Total fee: 0.30%
- 0.25% ke LP providers
- 0.05% ke protocol treasury  <- Protocol Fee
```

Di Uniswap v2 disebut persis "fee switch" - default off, aktifkan via governance.

**Bulldex saat ini:** fee switch belum aktif, semua 0.3% ke LP.
**Rencana:** aktifkan via governance di Week 11-12.

### Lending Spread
Model Aave/Compound. Profit dari selisih bunga:

```
Deposit APY:  5% (bayar ke depositor)
Borrow APY:   8% (charge ke borrower)
Spread:       3% -> protocol revenue
```

### Token Sale / Seed Round
Jual protocol token ke early investors dengan harga seed.

```
Seed price: $0.05 per BDX
Allocation: 20,000,000 BDX (2% supply)
Raise:      $1,000,000
FDV:        $50,000,000
```

Investor dapat token dengan vesting schedule.

---

## 4. Tokenomics BDX

| Parameter | Value |
|-----------|-------|
| Max Supply | 1,000,000,000 BDX |
| Circulating | 100,000,000 BDX (10%) |
| Seed Price | $0.05 per BDX |
| Seed Allocation | 20M BDX (2% supply) |
| Seed Raise | $1,000,000 |
| FDV | $50,000,000 |

### Distribution

| Allocation | % | Amount | Vesting |
|------------|---|--------|---------|
| Community | 40% | 400M | Farming + staking |
| Treasury | 25% | 250M | DAO-governed |
| Team | 15% | 150M | 12m cliff, 36m linear |
| Ecosystem | 16% | 160M | 3m cliff, 24m linear |
| Seed Round | 4% | 40M | 6m cliff, 18m linear |

---

## 5. Istilah Penting

| Istilah | Definisi |
|---------|----------|
| **Protocol Fee** | Bagian fee swap yang masuk ke treasury protocol |
| **Protocol Revenue** | Total pendapatan protocol per periode waktu |
| **Fee Switch** | Mekanisme on/off untuk aktifkan protocol fee |
| **Take Rate** | % dari total fee yang diambil protocol |
| **TVL** | Total Value Locked - total aset yang ada di protocol |
| **APY** | Annual Percentage Yield - return tahunan |
| **LP** | Liquidity Provider - orang yang menyetor likuiditas |
| **AMM** | Automated Market Maker - DEX tanpa order book |
| **DEX** | Decentralized Exchange |
| **Impermanent Loss** | Kerugian LP akibat perubahan harga token di pool |
| **Slippage** | Perbedaan harga yang diharapkan vs harga eksekusi |
| **Price Impact** | % perubahan harga akibat ukuran swap |
| **FDV** | Fully Diluted Valuation - market cap jika semua token beredar |

---

## 6. Revenue Flywheel

```
User pakai protocol
  -> Volume transaksi tinggi
  -> Swap fee terkumpul
  -> LP dapat return bagus
  -> Lebih banyak likuiditas masuk
  -> Slippage makin kecil
  -> Lebih banyak user tertarik
  -> Protocol fee (0.05%) masuk treasury
  -> Treasury fund development + buyback
  -> BDX naik karena demand
  -> Ecosystem tumbuh
```

---

## 7. Metrik yang Dilihat VC

| Metrik | Deskripsi | Target Awal |
|--------|-----------|-------------|
| TVL | Total aset di protocol | $1M+ |
| Daily Volume | Volume swap per hari | $100k+ |
| Protocol Revenue | Fee masuk treasury per hari | $50+ |
| Annualized Revenue | Revenue x 365 | $18k+ |
| P/S Ratio | FDV / annualized revenue | <100x |
| Unique Users | Wallet unik yang pernah transaksi | 1000+ |
| Holders | Jumlah wallet pegang BDX | 500+ |

---

## 8. Seed Round Comparison

| Protocol | Seed Raise | FDV | Stage |
|----------|-----------|-----|-------|
| Uniswap | $1.8M | $8M | Pre-product |
| Aave | $16M | - | Pre-launch |
| dYdX | $10M | $50M | Early |
| Typical DeFi | $500k-$5M | $10M-50M | Testnet-ready |
| **Bulldex** | **$1M target** | **$50M** | **Testnet** |

---

## 9. Roadmap Monetisasi

### Phase 1 - Testnet (Sekarang)
- Deploy di Sepolia dengan MockToken
- Belum ada real money

### Phase 2 - Mainnet Launch
- Deploy ke Ethereum mainnet
- Pair BDX dengan real USDC/ETH
- Protocol fee switch aktif (0.05%)

### Phase 3 - Token Listing
- List di DEX aggregator (1inch, Paraswap)
- Daftar di CoinGecko / CoinMarketCap
- Liquidity mining campaign

### Phase 4 - Seed Round
- Pitching ke VC/angel investor
- Jual 40M BDX di $0.05 = $1M raise
- Dana untuk audit + mainnet infra

### Phase 5 - Sustainable Revenue
- Fee switch + lending spread aktif
- Treasury accumulate revenue
- Buyback & burn (opsional, via governance)

---

## 10. Formula Penting

### AMM Constant Product
```
x * y = k
```

### Output Amount dengan Fee 0.3%
```
amountOut = (amountIn * 997 * reserveOut)
          / (reserveIn * 1000 + amountIn * 997)
```

### LP Token Mint (pertama kali)
```
lpMinted = sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY
```

### LP Token Mint (selanjutnya)
```
lpMinted = min(
  amount0 * totalLP / reserve0,
  amount1 * totalLP / reserve1
)
```

### Health Factor (Lending - Phase 2)
```
healthFactor = (collateralValue * LTV) / borrowedValue
// Liquidate jika healthFactor < 1.0
```

### Price Impact (basis points)
```
midPrice = amountIn * reserveOut / reserveIn
impact   = (midPrice - amountOut) / midPrice * 10000
```


---

## 11. WETH Pool (Aug 2026)

### Kenapa Perlu WETH
Pool.sol pakai `IERC20.transferFrom` - tidak bisa menerima native ETH langsung.
Solusi: deploy WETH9-style wrapper, create BDX/WETH pool.

### BDX/WETH Pool
```
Address:       0x3cA1cE14fd2fE5A449F67CFA63F342acfB8860e4
Initial seed:  1,000,000 BDX + 0.1 WETH
Initial price: 1 WETH = 10,000,000 BDX
```

### Frontend Flow ETH -> BDX
```
1. WETH.deposit{value: amountIn}()     // wrap ETH
2. WETH.approve(pool, MAX)             // approve
3. Pool.swap(WETH, amount, minOut, user) // swap
```

User melihat "ETH" di UI tapi di-backend pakai WETH contract.

### Dua Pool Aktif
| Pool | Address | Tokens |
|------|---------|--------|
| BDX/MUSDC | 0xfac1b95... | BDX + MUSDC |
| BDX/WETH  | 0x3cA1cE1... | BDX + WETH (ETH) |

Pool routing otomatis via `getPoolAddress(tokenA, tokenB)` di contracts.ts.


---

## 12. Bagaimana Harga Bergerak di AMM

### Konsep Dasar: x * y = k

Harga di AMM **bukan ditentukan oleh order book** seperti CEX — tapi oleh **rasio antara dua token di pool**.

```
Pool BDX/WETH:
  x = BDX reserve = 1,000,000
  y = WETH reserve = 0.1
  k = x * y = 100,000

Spot price BDX = y / x = 0.1 / 1,000,000 = 0.0000001 WETH per BDX
```

### Apa yang Menyebabkan Harga Naik?

**Harga BDX naik ketika:**

1. **User membeli BDX (swap WETH → BDX)**
   ```
   User masukkan 0.01 WETH
   Pool: BDX berkurang, WETH bertambah
   x berkurang → y/x naik → harga BDX naik
   ```

2. **Liquidity dicabut tidak proporsional**
   Jarang terjadi, tapi removal dengan ratio berbeda bisa shift price

3. **Large buy orders (whale)**
   Semakin besar swap relative ke pool size, semakin besar price impact

### Apa yang Menyebabkan Harga Turun?

**Harga BDX turun ketika:**

1. **User menjual BDX (swap BDX → WETH)**
   ```
   User masukkan 100,000 BDX
   Pool: BDX bertambah, WETH berkurang
   x naik → y/x turun → harga BDX turun
   ```

2. **Sell pressure besar** — lebih banyak yang jual daripada beli

### Contoh Konkret

```
Initial pool: 1,000,000 BDX + 0.1 WETH
k = 100,000

User A swap: 0.001 WETH → BDX
amountOut = (0.001 * 997 * 1,000,000) / (0.1 * 1000 + 0.001 * 997)
          ≈ 9,070 BDX

New state:
  BDX = 1,000,000 - 9,070 = 990,930
  WETH = 0.1 + 0.001 = 0.101

New price = 0.101 / 990,930 = 0.0000001019 WETH/BDX
Price increase: +1.9%  ← naik karena ada yang beli
```

### Price Impact vs Slippage

| Term | Definisi |
|------|----------|
| **Spot price** | Harga saat ini dari rasio reserve |
| **Price impact** | % perubahan harga akibat satu swap |
| **Slippage** | Perbedaan harga expected vs actual execution |
| **Mid price** | Harga tanpa fee: y/x |

Semakin kecil pool (TVL rendah) → semakin besar price impact untuk swap yang sama.

### Kenapa Harga BDX di Pool ≠ $0.05 Seed Price?

Harga seed (`$0.05`) adalah **target valuasi** dari token economics, bukan harga pool.

Harga pool ditentukan oleh **berapa token di-seed**:
```
Seeded: 1,000,000 BDX + 0.1 WETH
ETH price = $2,500 → 0.1 WETH = $250

BDX market cap implied = $250 × 2 = $500 (TVL)
BDX price = $500 / 1,000,000 BDX = $0.0005 per BDX (bukan $0.05)
```

Untuk mencapai harga $0.05, butuh:
```
Pool seed: 1,000,000 BDX + 20 WETH ($50,000)
→ BDX price = $100,000 / 2 / 1,000,000 = $0.05
```

Atau kurangi BDX yang di-seed:
```
Pool seed: 20,000 BDX + 0.1 WETH ($250)
→ BDX price = $500 / 2 / 20,000 = $0.0125
```

### Apa Itu "Fair Price"?

Di testnet, harga AMM tidak mencerminkan fundamental. Di mainnet, arbitrageurs akan:
1. Lihat BDX dijual murah di Bulldex
2. Beli BDX di Bulldex, jual di exchange lain
3. Proses ini menyeimbangkan harga antar platform (arbitrage)

Tanpa arbitrageurs, harga pool bisa sangat berbeda dari "market price".

### Cara Baca Chainlink Price Feed

```solidity
// Chainlink ETH/USD Sepolia: 0x694AA1769357215DE4FAC081bf1f309aDC325306
(, int256 answer, , , ) = priceFeed.latestRoundData();
uint256 ethPriceUSD = uint256(answer) / 1e8; // 8 decimals
```

Chainlink aggregator mengambil harga dari puluhan sumber (exchanges, market makers),
mengambil median, dan update on-chain setiap X% deviation atau Y jam.
