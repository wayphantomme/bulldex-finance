# Token Vesting — Concept & Implementation

## Apa itu Vesting?

Vesting adalah mekanisme di mana token yang sudah dialokasikan **tidak bisa langsung diambil semua sekaligus**. Token "unlock" secara bertahap sesuai jadwal yang sudah disepakati di awal.

Analoginya seperti kontrak kerja: kamu dapat saham perusahaan tapi baru bisa jual setelah 1 tahun (cliff), lalu sisanya unlock dikit-dikit selama 3 tahun berikutnya.

---

## Kenapa Vesting Ada?

### Masalah tanpa vesting

Misalnya Bulldex launch token BDX, terus langsung kasih 150 juta BDX ke tim sekaligus.

Yang terjadi:
1. Tim punya 150M BDX di wallet
2. Harga BDX naik karena ada orang beli di pool
3. Tim **langsung jual semua** → harga BDX crash → investor rugi
4. Proyek mati

Ini namanya **rug pull** — dan ini yang bikin investor tidak percaya proyek baru.

### Solusi dengan vesting

Tim tetap dapat jatah 150M BDX, tapi **dikunci di smart contract**. Mereka baru bisa ambil setelah:
- 12 bulan pertama = 0 token bisa diambil (cliff)
- Bulan ke-13 sampai bulan ke-48 = token unlock linear setiap detik

Kalau tim kabur di bulan ke-6 → mereka tidak dapat apa-apa. Ini memberi **insentif untuk tetap membangun proyek**.

---

## Siapa yang dapat token vesting di Bulldex?

Dari tokenomics BDX (total supply 1 miliar):

| Pihak | Jumlah | Cliff | Durasi | Tujuan |
|---|---|---|---|---|
| Tim | 150M (15%) | 12 bulan | 36 bulan linear | Kompensasi pendiri + developer |
| Seed investors | 40M (4%) | 6 bulan | 18 bulan linear | Investor awal yang bantu modal awal |
| Ecosystem | 160M (16%) | 3 bulan | 24 bulan linear | Grant, partnership, developer rewards |
| Treasury | 250M (25%) | Tidak ada | DAO governance | Cadangan protokol, keputusan komunitas |
| Community | 400M (40%) | Tidak ada | Farming + staking | Reward pengguna aktif |

---

## Bagaimana cara "menghasilkan uang" dari token?

Pertanyaan bagus. Ada beberapa cara:

### 1. Seed round (jual token ke investor awal)
Sebelum launch, tim jual sebagian token ke investor dengan harga diskon.

```
Seed price BDX = $0.05
Seed allocation = 40M BDX
Total raised = 40M × $0.05 = $2,000,000
```

Investor dapat 40M BDX tapi kena vesting 6 bulan cliff + 18 bulan linear.
Artinya mereka tidak bisa langsung jual — butuh komitmen jangka panjang.

### 2. Token price appreciation
Kalau protokol berkembang (lebih banyak TVL, volume, user):
- Harga BDX naik di pool
- Tim dan investor yang menunggu vesting berakhir → jual di harga lebih tinggi

### 3. Protocol revenue (untuk tim/treasury)
Treasury mendapat revenue dari:
- 0.3% swap fee (sebagian bisa diarahkan ke treasury lewat governance)
- Lending interest (dari `reserveBalance`)
- Staking rewards yang tidak diklaim

Treasury BDX (250M) bisa dijual pelan-pelan oleh DAO untuk biaya operasional.

---

## Flow kerja vesting on-chain

```
1. DEPLOY
   Owner deploy TokenVesting.sol
   Owner transfer BDX ke contract (atau contract yang mint sendiri)

2. CREATE SCHEDULE
   Owner panggil createVestingSchedule(
     beneficiary = alamat penerima (tim/investor/ekosistem)
     startTime   = timestamp mulai vesting
     cliff       = berapa detik sebelum token pertama bisa diambil
     duration    = total durasi vesting dalam detik
     amount      = total BDX yang di-vest
   )

3. TIME PASSES
   BDX terkunci di contract
   Setiap detik, sebagian kecil token "vested" (sudah jadi hak penerima)
   Tapi masih di contract — belum bisa diambil sampai cliff lewat

4. AFTER CLIFF
   Penerima panggil release()
   Contract hitung berapa yang sudah vested tapi belum diambil
   Transfer ke wallet penerima

5. LINEAR UNLOCK
   Setelah cliff, setiap detik ada token baru yang bisa diambil
   Penerima bisa claim kapan saja, atau tunggu terkumpul banyak

6. REVOKE (emergency)
   Owner bisa panggil revoke(beneficiary)
   Token yang sudah vested tetap bisa diambil beneficiary
   Token yang belum vested dikembalikan ke owner/treasury
```

---

## Contoh konkrit untuk tim BDX

Tim dapat 150M BDX dengan vesting 12 bulan cliff + 36 bulan linear.

```
Deploy:    Jan 2026
Cliff:     Jan 2027  (12 bulan kemudian)

Jan 2027:  0 BDX bisa diambil  ← cliff belum lewat
Feb 2027:  0 BDX bisa diambil  ← cliff pas di Jan 2027
Mar 2027:  ~4.17M BDX bisa diambil  ← 1 bulan setelah cliff
            (150M / 36 bulan = 4.17M per bulan)

Jan 2030:  semua 150M BDX sudah unlock penuh
```

Kalau tim mau jual di Mar 2027 saat harga BDX = $0.20:
```
4.17M × $0.20 = $834,000 bisa direalisasikan
```

Tapi ini hanya kalau harga BDX naik ke $0.20. Kalau proyek gagal dan BDX = $0 → tim tidak dapat apa-apa.
Itulah kenapa vesting menyelaraskan insentif tim dengan kesuksesan proyek.

---

## Formula vesting

### Jumlah yang sudah vested (setelah cliff):

```
elapsed       = min(now, startTime + cliff + duration) - (startTime + cliff)
vestedAmount  = totalAmount × elapsed / duration
```

### Jumlah yang bisa diambil sekarang:

```
releasable = vestedAmount - alreadyReleased
```

### Sebelum cliff:

```
if (now < startTime + cliff):
    vestedAmount = 0
    releasable = 0
```

---

## Vesting vs Staking — bedanya

| | Vesting | Staking |
|---|---|---|
| Siapa yang lock | Owner/protokol mengunci untuk penerima | User memilih lock sendiri |
| Tujuan | Distribusi token bertahap | Earn rewards dari protokol |
| Bisa unlock paksa? | Tidak (harus tunggu cliff) | Bisa emergency withdraw (forfeit rewards) |
| Siapa yang untung | Penerima vesting (tim, investor) | Siapapun yang stake BDX |
| Revenue? | Tidak langsung — token price appreciation | Ya — dapat BDX rewards tiap detik |

---

## Contoh protokol yang pakai vesting

- **Uniswap** — UNI tim/investor kena 4 tahun vesting
- **Aave** — AAVE team allocation kena 3 tahun
- **Compound** — COMP distribusi bertahap lewat governance
- **Optimism** — OP kena vesting multi-tahun untuk core contributors

Semua protokol besar pakai ini. Investor institusional **tidak akan invest** kalau tidak ada vesting — itu sinyal bahwa tim tidak serius jangka panjang.

---

## Yang perlu dibangun untuk Bulldex

### Smart Contract: `TokenVesting.sol`

```solidity
createVestingSchedule(address beneficiary, uint256 start, uint256 cliff, uint256 duration, uint256 amount)
release(address beneficiary)          // penerima klaim token yang sudah vested
revoke(address beneficiary)           // owner batalkan sisa yang belum vested
computeReleasableAmount(address)      // view: berapa yang bisa diklaim sekarang
getVestingSchedule(address)           // view: info lengkap jadwal
getVestedAmount(address, uint256 t)   // view: berapa yang sudah vested pada waktu t
```

### Frontend: `dashboard/vesting/page.tsx`

Dua mode tampilan:
1. **User view** — kalau wallet terhubung dan punya vesting schedule: progress bar, jumlah yang bisa diklaim, tombol Claim
2. **Public view** — kalau tidak punya jadwal: tampilkan tokenomics distribution chart (team/seed/ecosystem/treasury/community)

### Data yang ditampilkan per jadwal:

```
Beneficiary:    0xABC...
Total:          150,000,000 BDX
Vested so far:  12,500,000 BDX (8.3%)
Claimed:        8,000,000 BDX
Claimable now:  4,500,000 BDX  ← tombol Claim
Cliff ends:     Jan 15, 2027
Fully vested:   Jan 15, 2030
```

---

## ENV yang dibutuhkan

```
NEXT_PUBLIC_VESTING_ADDRESS=<deployed address>
```
