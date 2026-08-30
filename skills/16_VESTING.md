# Vesting — Feature Spec

**Status:** 🔴 Phase 3 (Weeks 9–12)
**Contract:** `contracts/src/Vesting.sol` (to be built)
**Frontend:** `frontend/src/app/dashboard/vesting/page.tsx`
**Hooks:** `useVesting`, `useVestingActions` (to be built)

---

## Apa itu Vesting?

Vesting adalah mekanisme di mana token yang sudah dialokasikan **tidak bisa langsung diambil semua sekaligus**. Token "unlock" secara bertahap sesuai jadwal yang sudah disepakati di awal.

Analoginya seperti kontrak kerja: kamu dapat saham perusahaan tapi baru bisa jual setelah 1 tahun (cliff), lalu sisanya unlock dikit-dikit selama 3 tahun berikutnya.

**Kenapa perlu?** Tanpa vesting, tim bisa langsung jual semua token → harga crash → investor rugi → proyek mati (rug pull). Vesting memastikan insentif tim selaras dengan kesuksesan jangka panjang proyek. Investor institusional tidak akan invest kalau tidak ada vesting.

**Referensi industri:** Uniswap (UNI — 4 tahun), Aave (3 tahun), Compound, Optimism — semua protokol besar pakai ini.

---

## What It Does

Token vesting adalah mekanisme **release schedule** untuk BDX token. Digunakan untuk mengontrol distribusi token kepada team, investor (seed round), advisor, dan airdrop penerima agar tidak semua token langsung beredar di pasar sekaligus — melindungi nilai token dan menyelaraskan insentif jangka panjang.

Ini bukan earning feature seperti Staking/Farming. Vesting adalah bagian dari **tokenomics dan treasury management**.

---

## Use Cases

| Penerima | Alokasi BDX | Vesting |
|---|---|---|
| Team | 15% (150M BDX) | 12 bulan cliff, 36 bulan linear |
| Seed investors | 4% (40M BDX) | 6 bulan cliff, 18 bulan linear |
| Ecosystem | 16% (160M BDX) | 3 bulan cliff, 24 bulan linear |
| Advisors | bagian dari Ecosystem | custom per advisor |
| Airdrop | per campaign | bisa langsung atau 3-6 bulan linear |

---

## Vesting Schedule Types

### Linear Vesting
Token unlock secara merata per detik/hari dari start sampai end.
```
releasable = totalAmount * (block.timestamp - startTime) / duration
```

### Cliff + Linear (paling umum di DeFi)
Tidak ada yang unlock sampai cliff period selesai. Setelah cliff, unlock linear untuk sisa periode.
```
// Contoh: 6 bulan cliff, 18 bulan total
if (block.timestamp < startTime + CLIFF_DURATION) return 0;

elapsed = block.timestamp - startTime
releasable = totalAmount * elapsed / TOTAL_DURATION
```

### Visualisasi
```
Cliff + Linear (6m cliff, 18m total):

0%        6m         18m
|---------|-----------|
  locked    linear unlock
     0%    →   100%
```

---

## Contoh Konkrit — Tim BDX

Tim dapat 150M BDX dengan 12 bulan cliff + 36 bulan linear:

```
Deploy:    Jan 2026
Cliff:     Jan 2027

Jan 2027:  0 BDX        ← belum lewat cliff
Mar 2027:  ~4.17M BDX   ← 1 bulan setelah cliff (150M / 36 bulan)
Jan 2030:  150M BDX     ← semua unlock penuh
```

Jika tim jual di Mar 2027 saat BDX = $0.20: `4.17M × $0.20 = $834,000`.
Kalau proyek gagal dan BDX = $0 → tim tidak dapat apa-apa. Inilah alignment of incentives.

---

## Math

### Releasable (Cliff + Linear)
```
if block.timestamp < start + cliff:
    releasable = 0
elif block.timestamp >= start + duration:
    releasable = totalAmount - released
else:
    vested = totalAmount * (block.timestamp - start) / duration
    releasable = vested - released
```

### Remaining
```
remaining = totalAmount - released
```

---

## Contract: Vesting.sol

### State Variables
```solidity
struct VestingSchedule {
    address beneficiary;      // penerima token
    uint256 totalAmount;      // total BDX yang di-vest
    uint256 released;         // sudah di-release
    uint256 startTime;        // unix timestamp awal vesting
    uint256 cliffDuration;    // detik sampai cliff selesai
    uint256 totalDuration;    // total detik vesting (termasuk cliff)
    bool revocable;           // bisa dicabut oleh owner atau tidak
    bool revoked;             // sudah dicabut
}

mapping(bytes32 => VestingSchedule) public vestingSchedules;
mapping(address => bytes32[]) public holderSchedules;  // semua schedule per holder
uint256 public vestingSchedulesCount;

IERC20 public immutable token;  // BDX token
```

### Key Functions

```solidity
// Owner: buat vesting schedule baru
function createVestingSchedule(
    address beneficiary,
    uint256 startTime,
    uint256 cliffDuration,    // detik (mis. 6 bulan = 180 * 86400)
    uint256 totalDuration,    // detik (mis. 18 bulan = 540 * 86400)
    uint256 totalAmount,
    bool revocable
) external onlyOwner returns (bytes32 scheduleId)

// Beneficiary: claim token yang sudah vested
function release(bytes32 scheduleId, uint256 amount) external nonReentrant

// Beneficiary: claim semua yang sudah releasable
function releaseAll(bytes32 scheduleId) external nonReentrant

// Owner: cabut schedule yang revocable (kembalikan sisa ke treasury)
function revoke(bytes32 scheduleId) external onlyOwner

// View: berapa yang bisa di-claim sekarang
function releasableAmount(bytes32 scheduleId) public view returns (uint256)

// View: berapa yang sudah di-vest (tapi belum tentu di-claim)
function vestedAmount(bytes32 scheduleId) public view returns (uint256)

// View: semua schedule milik beneficiary
function getSchedulesByHolder(address holder)
    external view returns (bytes32[] memory)

// View: data lengkap schedule
function getVestingSchedule(bytes32 scheduleId)
    external view returns (VestingSchedule memory)

// Helper: generate schedule ID
function computeScheduleId(address beneficiary, uint256 index)
    public pure returns (bytes32)
```

### Internal
```solidity
function _releasableAmount(VestingSchedule memory schedule)
    internal view returns (uint256)
{
    if (schedule.revoked) return 0;
    uint256 currentTime = block.timestamp;

    // Masih dalam cliff period
    if (currentTime < schedule.startTime + schedule.cliffDuration) {
        return 0;
    }

    // Sudah melewati total duration
    if (currentTime >= schedule.startTime + schedule.totalDuration) {
        return schedule.totalAmount - schedule.released;
    }

    // Linear unlock
    uint256 timeFromStart = currentTime - schedule.startTime;
    uint256 vested = schedule.totalAmount * timeFromStart / schedule.totalDuration;
    return vested - schedule.released;
}
```

### Events
```solidity
event VestingScheduleCreated(
    bytes32 indexed scheduleId,
    address indexed beneficiary,
    uint256 totalAmount,
    uint256 startTime,
    uint256 cliffDuration,
    uint256 totalDuration
)
event TokensReleased(bytes32 indexed scheduleId, address indexed beneficiary, uint256 amount)
event VestingRevoked(bytes32 indexed scheduleId, address indexed beneficiary, uint256 returnedAmount)
```

### Custom Errors
```solidity
error ZeroAddress()
error ZeroAmount()
error InvalidDuration()          // totalDuration < cliffDuration
error ScheduleNotFound()
error NotBeneficiary()           // caller bukan beneficiary
error NothingToRelease()         // releasableAmount = 0
error ScheduleRevoked()
error NotRevocable()             // schedule tidak bisa dicabut
error InsufficientTokenBalance() // kontrak tidak punya cukup BDX
```

### Security
- `nonReentrant` pada `release()` dan `releaseAll()`
- `scheduleId` = `keccak256(beneficiary, index)` — tidak bisa collision
- `released` tracking per schedule mencegah double-claim
- `revocable` flag set saat create — tidak bisa diubah setelah itu
- Cek `token.balanceOf(address(this))` sebelum create schedule baru (tidak boleh over-commit)

---

## Frontend: Vesting Hooks

### `useVesting(address)`
```typescript
export interface VestingScheduleDisplay {
  scheduleId: `0x${string}`;
  totalAmount: bigint;
  released: bigint;
  releasable: bigint;
  vested: bigint;
  remaining: bigint;
  startTime: number;          // unix timestamp
  cliffEnd: number;           // startTime + cliffDuration
  vestingEnd: number;         // startTime + totalDuration
  progressPct: number;        // released / totalAmount * 100
  isCliffPassed: boolean;
  isFullyVested: boolean;
  revocable: boolean;
  revoked: boolean;
  // Formatted
  totalAmountFormatted: string;
  releasableFormatted: string;
  cliffEndLabel: string;      // "Jun 2027" dst
  vestingEndLabel: string;
}

export interface UseVestingResult {
  schedules: VestingScheduleDisplay[];
  totalReleasable: bigint;
  isLoading: boolean;
}
```

### `useVestingActions(address)`
```typescript
type VestingStep =
  | 'idle'
  | 'releasing'
  | 'success'
  | 'error';

export interface UseVestingActionsResult {
  step: VestingStep;
  txHash: `0x${string}` | undefined;
  error: string | null;
  release: (scheduleId: `0x${string}`, amount: bigint) => Promise<void>;
  releaseAll: (scheduleId: `0x${string}`) => Promise<void>;
  reset: () => void;
}
```

---

## Frontend: UI

### Vesting Dashboard (beneficiary view)
- List semua schedule milik wallet yang terhubung
- Per schedule: progress bar (released / total), cliff indicator, next unlock date
- "Claim" button per schedule (disabled jika releasable = 0)
- "Claim All" button untuk claim semua releasable sekaligus

### Schedule Card
```
BDX Vesting — Team Allocation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total:      10,000,000 BDX
Released:    1,234,567 BDX  (12.3%)
Releasable:    456,789 BDX  ← claim available
Remaining:   8,765,433 BDX

[████████████░░░░░░░░░░░░░░░] 12.3%

Cliff ends:    Jan 2027
Fully vested:  Jan 2030

[Claim 456,789 BDX]
```

### Admin View (owner)
- Create vesting schedule form: beneficiary, amount, cliff, duration, revocable
- List semua schedule dengan status
- Revoke button (hanya untuk schedule revocable yang belum revoked)

---

## ENV Variables Needed
```
NEXT_PUBLIC_VESTING_ADDRESS=
```

---

## Deployment Notes

Sebelum deploy:
1. Mint BDX ke Vesting contract (`token.mint(vestingAddress, totalBudget)`)
2. Atau transfer dari treasury (`token.transfer(vestingAddress, totalBudget)`)
3. Pastikan `vestingBudget >= sum(semua totalAmount yang akan di-create)`

Urutan deploy yang aman:
```bash
# 1. Deploy Token.sol
# 2. Deploy Vesting.sol dengan token address
# 3. Transfer budget ke Vesting contract
# 4. createVestingSchedule() untuk setiap beneficiary
```

---

## Testing Plan

- `testCreateSchedule` — buat schedule, verifikasi state
- `testCliffNotPassed` — releasable = 0 saat masih dalam cliff
- `testPartialRelease` — release sebagian, verifikasi released tracking
- `testFullRelease` — setelah vesting end, semua bisa di-claim
- `testLinearVesting` — verify proportional release di tengah periode
- `testRevoke` — owner cabut, sisa token kembali ke owner
- `testNotRevocable` — revert jika coba revoke schedule non-revocable
- `testNotBeneficiary` — revert jika caller bukan beneficiary
- `testMultipleSchedules` — satu wallet bisa punya banyak schedule
- `testOverCommit` — revert jika create schedule tapi balance tidak cukup

---

## Perbedaan Vesting vs Staking vs Farming

| Aspek | Vesting | Staking | Farming |
|---|---|---|---|
| **Tujuan** | Distribusi team/investor token | User lock token untuk earn | LP stake untuk earn BDX |
| **User action** | Pasif (claim saja) | Aktif (stake, unstake, claim) | Aktif (deposit LP, harvest) |
| **Token source** | Pre-allocated (treasury/mint) | Protocol inflation / revenue | Protocol inflation |
| **Lock** | Enforced by schedule | Optional (lock period boost) | Tidak ada lock |
| **Contract** | Vesting.sol | Staking.sol | MasterChef.sol |
| **Relevan untuk** | Team, investor, advisor | BDX holders | LP providers |

---

*Last updated: Aug 2026*
