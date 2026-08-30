# Web3 Developer Roadmap — Hired by VC

**Goal:** Hired as Web3 / Smart Contract Developer at a VC-backed crypto company  
**Timeline:** 16–24 weeks  
**Stack:** Solidity + Foundry + Next.js + wagmi  
**By:** @wayphantomme

---

## Progress Tracker

| Phase | Topic | Status |
|-------|-------|--------|
| 0 | Solidity Fundamentals | ✅ Done |
| 1 | ERC20 Token | ✅ Done |
| 2 | AMM / DEX Swap | 🔄 In Progress |
| 3 | Liquidity Provision | ⬜ |
| 4 | Lending & Borrowing | ⬜ |
| 5 | Staking & Rewards | ⬜ |
| 6 | Yield Farming | ⬜ |
| 7 | Vesting | ⬜ |
| 8 | Flash Loans | ⬜ |
| 9 | Governance & DAO | ⬜ |
| 10 | NFT & ERC721 | ⬜ |
| 11 | Gas Optimization | ⬜ |
| 12 | Security & Auditing | ⬜ |
| 13 | Upgradeable Contracts | ⬜ |
| 14 | Cross-chain & Bridges | ⬜ |
| 15 | The Graph / Indexing | ⬜ |
| 16 | Build in Public + Apply | ⬜ |

---

## Phase 0 — Solidity Fundamentals ✅

Sudah dikuasai:
- Data types, functions, modifiers
- Mappings, arrays, structs
- Events, errors, require/revert
- Inheritance, interfaces, abstract contracts
- OpenZeppelin standards
- Foundry: forge build, forge test, forge script

---

## Phase 1 — ERC20 Token ✅

**Sudah dibangun:** `Token.sol` (BDX)

Konsep yang dikuasai:
- ERC20 standard (transfer, approve, allowance)
- ERC20Burnable — burn tokens
- ERC20Permit (EIP-2612) — gasless approvals via signature
- Ownable — access control
- Supply cap dengan custom errors
- Unit tests + fuzz tests dengan Foundry
- Deploy + verify on Sepolia

**Key learnings:**
```solidity
// Supply cap pattern
uint256 public constant MAX_SUPPLY = 1_000_000_000 ether;

function _mintChecked(address to, uint256 amount) internal {
    uint256 available = MAX_SUPPLY - totalSupply();
    if (amount > available) revert ExceedsMaxSupply(amount, available);
    _mint(to, amount);
}
```

---

## Phase 2 — AMM / DEX Swap 🔄

**Target contract:** `Pool.sol`

### Konsep yang perlu dipahami

**Constant Product Formula (Uniswap v2):**
```
x * y = k
```
- `x` = reserve token A
- `y` = reserve token B
- `k` = constant (tidak berubah setelah swap)

**Output calculation dengan fee 0.3%:**
```solidity
// amountIn after 0.3% fee
uint256 amountInWithFee = amountIn * 997;
uint256 amountOut = (amountInWithFee * reserveOut) / 
                   (reserveIn * 1000 + amountInWithFee);
```

**Slippage:**
- Price impact = selisih harga sebelum dan sesudah swap
- Semakin besar swap relatif terhadap pool, semakin besar slippage
- Frontend harus tampilkan dan user set max slippage (default 0.5%)

**Price manipulation prevention:**
- Jangan gunakan `balanceOf` sebagai reserve — bisa dimanipulasi
- Simpan reserves di storage: `reserve0`, `reserve1`
- Update reserves di akhir transaksi (Checks-Effects-Interactions)

### Apa yang dibangun
```
Pool.sol:
- swap(address tokenIn, uint256 amountIn, uint256 minAmountOut)
- addLiquidity(uint256 amount0, uint256 amount1)
- removeLiquidity(uint256 lpAmount)
- getAmountOut(uint256 amountIn, address tokenIn) view
- Events: Swap, AddLiquidity, RemoveLiquidity
```

### Resources
- Uniswap v2 Whitepaper: https://uniswap.org/whitepaper.pdf
- Uniswap v2 Core source: https://github.com/Uniswap/v2-core

---

## Phase 3 — Liquidity Provision & LP Tokens

### Konsep

**LP Token:**
- Bukti kepemilikan share di pool
- ERC20 yang di-mint saat add liquidity, di-burn saat remove
- Nilai LP token = proportional share dari pool reserves

**LP Token calculation:**
```solidity
// First liquidity provider
lpAmount = sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY;

// Subsequent providers
lpAmount = min(
    (amount0 * totalSupply) / reserve0,
    (amount1 * totalSupply) / reserve1
);
```

**Impermanent Loss:**
- Kerugian sementara saat harga token berubah vs hodl
- IL = 2√p / (1+p) - 1, di mana p = price ratio change
- Penting dijelaskan ke user di UI

**Minimum Liquidity:**
- 1000 wei LP token pertama di-burn ke address(0)
- Mencegah price manipulation pada pool kosong

### Apa yang dibangun
```
LPToken.sol — ERC20 yang di-mint/burn oleh Pool
Pool.sol update — addLiquidity + removeLiquidity logic
```

---

## Phase 4 — Lending & Borrowing

### Konsep

**Collateralized Borrowing:**
- Deposit collateral → borrow up to X% of collateral value
- Collateralization Ratio (CR) = collateral value / debt value
- Health Factor = (collateral * LTV) / debt

**Health Factor:**
```solidity
// Health factor < 1.0 = liquidatable
healthFactor = (collateralValue * LTV_PERCENT) / (borrowedValue * 100);
// LTV = Loan to Value, e.g. 80% means borrow up to 80% of collateral
```

**Liquidation:**
- Ketika HF < 1.0, siapapun bisa liquidate posisi
- Liquidator repay sebagian/seluruh debt
- Dapat collateral + liquidation bonus (misal 5%)

**Interest Rate:**
```solidity
// Simple interest (linear)
interest = principal * rate * timeElapsed / SECONDS_PER_YEAR;

// Compound interest (per block)
interest = principal * (1 + ratePerBlock)^blocksElapsed;
```

**Price Oracle:**
- Butuh harga real-time untuk calculate collateral value
- Chainlink Price Feeds adalah standar industri
- Jangan gunakan DEX spot price — mudah dimanipulasi (flash loan)

### Apa yang dibangun
```
Lending.sol:
- deposit(address token, uint256 amount)
- withdraw(address token, uint256 amount)
- borrow(address token, uint256 amount)
- repay(address token, uint256 amount)
- liquidate(address borrower, address token)
- getHealthFactor(address user) view
```

### Resources
- Aave v2 Protocol: https://docs.aave.com/
- Compound Finance: https://compound.finance/docs

---

## Phase 5 — Staking & Rewards

### Konsep

**Simple Staking:**
- Lock token → earn reward over time
- Reward per second = totalRewardPerPeriod / totalPeriod

**Reward calculation (per-user):**
```solidity
// Accumulated reward per token (global)
rewardPerTokenStored += rewardRate * timeElapsed / totalStaked;

// User's earned rewards
earned = userStaked * (rewardPerTokenStored - userRewardPerTokenPaid) 
         + rewards[user];
```

**Lockup Period:**
- Beberapa protokol punya minimum staking period
- Unstake sebelum waktunya = penalty atau tidak bisa

**APY Calculation:**
```
APY = (rewardPerBlock * blocksPerYear / totalStaked) * 100
```

### Apa yang dibangun
```
Staking.sol:
- stake(uint256 amount)
- unstake(uint256 amount)
- claimRewards()
- getRewards(address user) view
- getAPY() view
```

---

## Phase 6 — Yield Farming (MasterChef)

### Konsep

**MasterChef Pattern (Sushiswap/Pancakeswap):**
- Multiple pools dengan allocation points
- Reward per pool = (poolAllocPoints / totalAllocPoints) * totalRewardPerBlock

**Pool Weight:**
```solidity
struct PoolInfo {
    IERC20 lpToken;
    uint256 allocPoint;      // weight relatif terhadap total
    uint256 lastRewardBlock;
    uint256 accRewardPerShare;
}

// Pool's share of total rewards
poolShare = pool.allocPoint / totalAllocPoint;
rewardPerBlock = totalRewardPerBlock * poolShare;
```

**Deposit Fee:**
- Beberapa protokol ambil fee saat deposit LP token
- Fee masuk ke treasury/dev wallet

### Apa yang dibangun
```
MasterChef.sol:
- add(uint256 allocPoint, IERC20 lpToken)  // owner only
- deposit(uint256 pid, uint256 amount)
- withdraw(uint256 pid, uint256 amount)
- harvest(uint256 pid)
- pendingReward(uint256 pid, address user) view
```

---

## Phase 7 — Vesting

### Konsep

**Vesting = token release schedule**  
Digunakan untuk: team tokens, investor allocation, advisor tokens

**Linear Vesting:**
```solidity
// Token unlock linear over time
releasable = totalAmount * (block.timestamp - startTime) / duration;
```

**Cliff Vesting:**
- Tidak ada yang unlock sampai cliff period selesai
- Setelah cliff, langsung unlock sebagian + sisanya linear

```solidity
// Contoh: 1 tahun cliff, 3 tahun total vesting
if (block.timestamp < startTime + CLIFF) return 0;
releasable = totalAmount * (block.timestamp - startTime) / TOTAL_DURATION;
```

**Vesting Schedule Types:**
| Type | Description |
|------|-------------|
| Linear | Unlock rata setiap detik/bulan |
| Cliff + Linear | Lock dulu, lalu linear |
| Milestone | Unlock berdasarkan event tertentu |
| Graded | Persentase berbeda tiap periode |

### Apa yang dibangun
```
Vesting.sol:
- createVesting(address beneficiary, uint256 amount, uint256 start, uint256 cliff, uint256 duration)
- release(address beneficiary)
- revoke(address beneficiary)  // owner only, untuk team tokens
- releasable(address beneficiary) view
```

### Resources
- OpenZeppelin VestingWallet: https://docs.openzeppelin.com/contracts/4.x/api/finance

---

## Phase 8 — Flash Loans

### Konsep

**Flash Loan = pinjam tanpa collateral, HARUS dikembalikan dalam 1 transaksi**

```
1. User request flash loan (misal 1000 ETH)
2. Contract kirim 1000 ETH ke user contract
3. User contract execute arbitrage/liquidation/dll
4. User contract kembalikan 1000 ETH + fee
5. Jika tidak dikembalikan → seluruh transaksi revert
```

**Flash Loan Fee:**
- Aave: 0.09% per flash loan
- Uniswap v3: 0.05% per flash swap

**Use Cases:**
- Arbitrage antar DEX
- Collateral swap (ganti collateral tanpa close posisi)
- Self-liquidation
- One-transaction leverage

**Security concern:**
- Jangan gunakan spot price dari DEX sebagai oracle
- Flash loan bisa manipulasi harga dalam 1 block
- Gunakan TWAP (Time Weighted Average Price) atau Chainlink

### Apa yang dibangun
```
FlashLoan.sol:
- flashLoan(address receiver, address token, uint256 amount, bytes calldata data)
- Interface: IFlashLoanReceiver — executeOperation(...)
```

---

## Phase 9 — Governance & DAO

### Konsep

**On-chain Governance:**
- Token holder vote untuk perubahan protokol
- Voting power = jumlah governance token yang dipegang/delegated

**Governor Pattern (OpenZeppelin Governor):**
```
1. Propose — buat proposal (butuh minimum token)
2. Voting Delay — tunggu sebelum voting dimulai
3. Voting Period — periode voting aktif
4. Timelock — delay eksekusi setelah proposal pass
5. Execute — jalankan perubahan
```

**Proposal States:**
```
Pending → Active → Succeeded/Defeated → Queued → Executed/Cancelled
```

**Quorum:**
- Minimum votes yang dibutuhkan agar proposal valid
- Biasanya 4% dari total supply

**Delegation:**
- Token holder bisa delegate voting power ke orang lain
- Memungkinkan passive holders tetap berkontribusi

### Apa yang dibangun
```
Governance.sol (extends OZ Governor):
- propose(targets, values, calldatas, description)
- castVote(proposalId, support)
- execute(proposalId)
- delegate(address delegatee)
```

---

## Phase 10 — NFT & ERC721

### Konsep

**ERC721 Standard:**
- Setiap token memiliki unique `tokenId`
- `tokenURI(uint256 tokenId)` → metadata JSON (stored on IPFS)

**Metadata format:**
```json
{
  "name": "Bulldex Bull #1",
  "description": "Genesis Bulldex NFT",
  "image": "ipfs://QmXxx.../1.png",
  "attributes": [
    { "trait_type": "Rarity", "value": "Legendary" },
    { "trait_type": "Power", "value": 95 }
  ]
}
```

**ERC721A (Gas Optimized):**
- Batch minting jauh lebih murah dari ERC721 standar
- Digunakan Azuki, BAYC, dan mayoritas PFP projects

**Royalties (ERC2981):**
```solidity
function royaltyInfo(uint256 tokenId, uint256 salePrice)
    returns (address receiver, uint256 royaltyAmount)
```

**NFT sebagai Collateral:**
- Floor price oracle dari Chainlink NFT Floor Price
- LTV lebih rendah dari ERC20 karena illiquid

### Apa yang dibangun
```
BulldexNFT.sol (ERC721A + ERC2981):
- mint(uint256 quantity)
- tokenURI(uint256 tokenId)
- setBaseURI(string uri)  // owner only
- royaltyInfo(...)
```

---

## Phase 11 — Gas Optimization ⚡

### Ini yang membedakan junior vs senior Solidity dev

**Teknik utama:**

#### 1. Storage vs Memory vs Calldata
```solidity
// Mahal: baca storage berkali-kali
function bad() external {
    for (uint i = 0; i < users.length; i++) { // storage read tiap iterasi
        total += balances[users[i]];
    }
}

// Murah: cache ke memory dulu
function good() external {
    uint256 len = users.length; // cache length
    uint256 _total = 0;         // local var
    for (uint i = 0; i < len; i++) {
        _total += balances[users[i]];
    }
    total = _total; // 1x storage write
}
```

#### 2. Packing Storage Slots
```solidity
// 3 storage slots (mahal)
uint256 a;  // slot 0
uint128 b;  // slot 1
uint128 c;  // slot 2

// 2 storage slots (murah) — b dan c packed
uint256 a;  // slot 0
uint128 b;  // slot 1 (packed)
uint128 c;  // slot 1 (packed)
```

#### 3. Custom Errors vs require strings
```solidity
// Mahal: string disimpan di bytecode
require(amount > 0, "Amount must be greater than zero");

// Murah: error signature = 4 bytes
error AmountZero();
if (amount == 0) revert AmountZero();
```

#### 4. Unchecked Math
```solidity
// Solidity 0.8+ auto-check overflow (gas cost)
for (uint i = 0; i < length; i++) { ... }

// Unchecked = no overflow check = cheaper
for (uint i = 0; i < length;) {
    // logic
    unchecked { ++i; } // cheaper than i++
}
```

#### 5. immutable vs constant
```solidity
uint256 public constant FIXED_VALUE = 100;    // compile-time, free
address public immutable OWNER;               // set once in constructor, cheap
address public owner;                         // storage, expensive
```

#### 6. Minimal Proxy (EIP-1167)
- Clone pattern — deploy contract baru yang delegatecall ke implementation
- 10x lebih murah untuk factory patterns

#### 7. Gas Report dengan Foundry
```bash
forge test --gas-report
forge snapshot  # track gas changes over time
```

**Target gas costs:**
| Operation | Target |
|-----------|--------|
| ERC20 transfer | < 50k |
| Swap | < 150k |
| Add Liquidity | < 130k |
| Borrow | < 160k |
| Mint NFT | < 100k |

---

## Phase 12 — Security & Auditing

### Top vulnerabilities yang harus dikuasai

#### 1. Reentrancy
```solidity
// VULNERABLE
function withdraw(uint256 amount) external {
    require(balance[msg.sender] >= amount);
    (bool ok,) = msg.sender.call{value: amount}(""); // attacker re-enters here
    balance[msg.sender] -= amount; // state update setelah transfer = BUG
}

// SAFE — Checks-Effects-Interactions
function withdraw(uint256 amount) external {
    require(balance[msg.sender] >= amount); // Check
    balance[msg.sender] -= amount;          // Effect
    (bool ok,) = msg.sender.call{value: amount}(""); // Interaction
}
```

#### 2. Integer Overflow/Underflow
- Solidity 0.8+ auto-revert on overflow
- Tapi `unchecked` blocks perlu diperhatikan

#### 3. Price Oracle Manipulation
- Jangan gunakan `token.balanceOf(pool)` sebagai price
- Gunakan Chainlink atau TWAP

#### 4. Access Control
- Selalu gunakan `onlyOwner` atau role-based (OZ AccessControl)
- Hati-hati `tx.origin` vs `msg.sender`

#### 5. Flash Loan Attacks
- Jangan update state berdasarkan balance yang bisa dimanipulasi

#### 6. Front-running
- Gunakan commit-reveal scheme untuk sensitive operations
- Slippage protection pada swaps

#### 7. Denial of Service
- Hindari loop yang iterates unbounded array
- Pull over push pattern untuk pembayaran

### Tools
```bash
# Static analysis
slither contracts/src/

# Symbolic execution
mythril analyze contracts/src/Token.sol

# Fuzzing
forge test --fuzz-runs 10000
```

### Security checklist sebelum deploy
- [ ] Reentrancy tidak ada
- [ ] Access control semua fungsi sensitif
- [ ] No tx.origin untuk auth
- [ ] Oracle manipulation proof
- [ ] Integer overflow checked
- [ ] Events semua state changes
- [ ] Emergency pause mechanism

---

## Phase 13 — Upgradeable Contracts

### Konsep

**Kenapa upgradeable:**
- Fix bugs post-deploy
- Add features
- Tapi: mengurangi trustlessness — tradeoff

**Proxy Patterns:**

| Pattern | Description | Use Case |
|---------|-------------|----------|
| Transparent Proxy | Admin vs user calls | OZ standard |
| UUPS | Upgrade logic di implementation | Gas efficient |
| Beacon Proxy | Multiple proxies, 1 implementation | Factory |
| Diamond (EIP-2535) | Multiple implementation facets | Complex protocols |

**UUPS Pattern:**
```solidity
// Implementation contract
contract TokenV1 is Initializable, ERC20Upgradeable, UUPSUpgradeable {
    function initialize(address owner) public initializer {
        __ERC20_init("Token", "TKN");
        __UUPSUpgradeable_init();
    }
    
    function _authorizeUpgrade(address) internal override onlyOwner {}
}

// Deploy
ERC1967Proxy proxy = new ERC1967Proxy(
    address(implementation),
    abi.encodeCall(TokenV1.initialize, (owner))
);
```

**Storage Collision:**
- Jangan ubah urutan storage variable saat upgrade
- Gunakan storage gaps: `uint256[50] private __gap;`

---

## Phase 14 — Cross-chain & Bridges

### Konsep

**Bridge Types:**
| Type | Example | Trust Model |
|------|---------|-------------|
| Lock & Mint | Most bridges | Trusted relayer |
| Liquidity Network | Hop, Across | Liquidity providers |
| Native | Optimism bridge | Trustless (slow) |
| Message Passing | LayerZero, Wormhole | Oracle/relayer |

**LayerZero (Most popular):**
```solidity
// Send message cross-chain
function sendMessage(uint16 dstChainId, bytes calldata payload) external {
    lzEndpoint.send{value: fee}(
        dstChainId,
        abi.encodePacked(remoteContract),
        payload,
        payable(msg.sender),
        address(0),
        bytes("")
    );
}

// Receive message
function lzReceive(uint16 srcChainId, bytes calldata srcAddress, uint64 nonce, bytes calldata payload) external {
    // process cross-chain message
}
```

**OFT (Omnichain Fungible Token):**
- Token yang bisa transfer cross-chain via LayerZero
- Tidak perlu wrapped token

---

## Phase 15 — The Graph / Indexing

### Konsep

**Masalah:**
- Blockchain tidak efisien untuk query historical data
- `eth_getLogs` lambat untuk production

**Solusi — The Graph:**
- Index events dari contract ke GraphQL endpoint
- Query data seperti database

**Subgraph:**
```typescript
// schema.graphql
type Swap @entity {
  id: ID!
  user: Bytes!
  tokenIn: Bytes!
  amountIn: BigInt!
  amountOut: BigInt!
  timestamp: BigInt!
}

// mapping.ts
export function handleSwap(event: SwapEvent): void {
  let swap = new Swap(event.transaction.hash.toHex());
  swap.user = event.params.user;
  swap.amountIn = event.params.amountIn;
  swap.timestamp = event.block.timestamp;
  swap.save();
}
```

**Query:**
```graphql
query GetUserSwaps($user: String!) {
  swaps(where: { user: $user }, orderBy: timestamp, orderDirection: desc) {
    id
    amountIn
    amountOut
    timestamp
  }
}
```

---

## Phase 16 — Build in Public + Apply

### Portfolio yang perlu di-showcase

**GitHub:**
- Bulldex Finance — full DeFi protocol
- Minimal 500+ lines Solidity
- 95%+ test coverage
- Gas report documented

**Twitter/X — Build in Public:**
Weekly update format:
```
Week X: [what was built]
✅ [contract] deployed + verified
✅ [tests] passing
✅ [feature] working

Gas: [swap/operation cost]
Coverage: [X]%

[Demo video/screenshot]
[Etherscan link]
[Vercel link]
```

**Job Boards:**
- https://web3.career
- https://crypto.jobs
- https://bankless.pallet.com
- https://gitcoin.co/jobs
- https://jobs.lever.co (filter crypto companies)
- Twitter DM ke founders langsung

### Template DM ke Founder/Recruiter
```
Hey [Name],

Building Bulldex Finance — a full DeFi protocol with 
AMM swap, lending, staking, and yield farming.

Week [X] progress:
- [X] Solidity contracts deployed on Sepolia
- [X] tests passing, 95%+ coverage
- Frontend live: [vercel link]

Looking for [role] opportunities. 
Would love to chat if you're hiring.

GitHub: github.com/wayphantomme/bulldex-finance
```

---

## Konsep Tambahan yang Perlu Dipelajari

### EIPs yang penting
| EIP | Name | Relevance |
|-----|------|-----------|
| EIP-20 | ERC20 | Token standard |
| EIP-721 | ERC721 | NFT standard |
| EIP-1155 | ERC1155 | Multi-token |
| EIP-2612 | Permit | Gasless approval |
| EIP-712 | Typed signing | Signature standard |
| EIP-4626 | Tokenized Vault | DeFi yield standard |
| EIP-1967 | Proxy Storage | Upgradeable |
| EIP-2535 | Diamond | Multi-facet proxy |

### DeFi Concepts
- TWAP (Time Weighted Average Price)
- MEV (Maximal Extractable Value)
- Sandwich attacks
- JIT Liquidity
- Concentrated Liquidity (Uniswap v3)
- veTokenomics (vote-escrowed)
- Bribes / Gauge voting (Curve/Convex model)

### Wallet & Signing
- EIP-191 (Personal sign)
- EIP-712 (Typed data sign)
- EIP-4337 (Account Abstraction)
- Safe (Gnosis) multisig
- WalletConnect protocol

---

## Resources

### Documentation
- Solidity: https://docs.soliditylang.org/
- Foundry: https://book.getfoundry.sh/
- OpenZeppelin: https://docs.openzeppelin.com/
- wagmi: https://wagmi.sh/
- viem: https://viem.sh/

### Learn by Reading Code
- Uniswap v2: https://github.com/Uniswap/v2-core
- Uniswap v3: https://github.com/Uniswap/v3-core
- Aave v3: https://github.com/aave/aave-v3-core
- Compound v2: https://github.com/compound-finance/compound-protocol
- Sushiswap MasterChef: https://github.com/sushiswap/sushiswap

### Security
- SWC Registry: https://swcregistry.io/
- Rekt.news (hack post-mortems): https://rekt.news/
- Secureum: https://secureum.xyz/
- Damn Vulnerable DeFi: https://www.damnvulnerabledefi.xyz/

### Competitive Practice
- Ethernaut (OpenZeppelin): https://ethernaut.openzeppelin.com/
- Capture the Ether: https://capturetheether.com/
- CodeHawks (audit contests): https://www.codehawks.com/
- Sherlock: https://www.sherlock.xyz/

---

**Last Updated:** 2026-08-24  
**Author:** @wayphantomme  

**"Ship code. Build in public. Get hired."**


---

## Progress Log (Bulldex Finance)

### Completed (Aug 2026)
- [x] ERC-20 token dengan permit, burn, supply cap (Token.sol)
- [x] AMM x*y=k dengan LP tokens (Pool.sol) - 40 tests
- [x] Pool factory dengan bidirectional lookup (PoolFactory.sol)
- [x] WETH wrapper contract (WETH.sol) - ETH/BDX pool
- [x] Testnet deployment + liquidity seeding (Sepolia)
- [x] Full Next.js 14 frontend dengan wagmi v2
- [x] Liquidity UI - add/remove LP dengan pool share display
- [x] Faucet page - MUSDC claim 1000/day dengan cooldown
- [x] Multi-token swap dengan ETH auto-wrap
- [x] Multi-pool routing (BDX/MUSDC + BDX/WETH)
- [x] Jupiter-style design - neutral base, lime brand, dot grid, Lucide icons
- [x] /docs page - nekosinga-style dengan search, TOC, GitHub link
- [x] 73 tests passing, CI/CD via GitHub Actions, Vercel deploy

### In Progress
- [ ] Lending & Borrowing (Lending.sol, health factor, liquidation)

### Key Technical Skills Demonstrated
- Solidity contract architecture - inheritance, custom errors, events
- Foundry testing - unit, fuzz, invariant, vm.prank
- wagmi v2 multicall pattern for efficient RPC usage
- State machine pattern untuk multi-step Web3 transactions
- Token wrapping flow (ETH -> WETH -> Pool)
- Dynamic pool routing based on token pair
- DeFi math: x*y=k, sqrt LP mint, proportional LP burn, price impact
