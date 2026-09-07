# K6 Performance QA

Project performance testing menggunakan [k6](https://k6.io/) — mencakup skenario **smoke**, **load**, **stress**, **spike**, dan **soak** test, lengkap dengan struktur konfigurasi environment dan integrasi CI/CD via GitHub Actions.

## 📁 Struktur Project

```
k6-performance-qa/
├── scripts/
│   ├── smoke-test.js     # Verifikasi cepat dengan load minimal
│   ├── load-test.js      # Simulasi traffic normal/harian
│   ├── stress-test.js    # Mencari breaking point sistem
│   ├── spike-test.js     # Simulasi lonjakan traffic mendadak
│   └── soak-test.js      # Uji stabilitas jangka panjang
├── config/
│   └── environments.js   # Konfigurasi base URL per environment
├── utils/
│   └── helpers.js        # Fungsi helper: checks, headers, random data
├── results/               # Output hasil test (di-gitignore)
├── .github/workflows/
│   └── k6-tests.yml       # CI pipeline untuk menjalankan test otomatis
├── package.json
└── README.md
```

## 🎯 Jenis Test

| Test    | Tujuan                                                                 | Kapan dijalankan                  |
|---------|-------------------------------------------------------------------------|------------------------------------|
| Smoke   | Memastikan sistem berjalan normal dengan beban sangat kecil            | Setiap deploy / setiap push ke CI |
| Load    | Mengukur performa pada beban normal yang diharapkan                    | Sebelum rilis, regresi mingguan   |
| Stress  | Mencari batas kapasitas maksimum sistem                                | Sebelum event besar / capacity planning |
| Spike   | Menguji ketahanan terhadap lonjakan traffic mendadak                   | Sebelum flash sale / campaign     |
| Soak    | Mendeteksi memory leak & degradasi performa dalam durasi lama          | Sebelum rilis major, berkala      |

## 📖 Penjelasan Detail Setiap Jenis Test

### 1. Smoke Test

**Fungsi/Manfaat:**
Memastikan sistem bisa menangani request dasar tanpa error sebelum masuk ke test yang lebih berat. Ibarat "tes nyala mesin" sebelum jalan jauh.

**Tujuan:**
- Mendeteksi bug fatal atau kesalahan konfigurasi sedini mungkin (fail fast).
- Memvalidasi bahwa endpoint, environment, dan script test sudah benar sebelum menghabiskan waktu/resource untuk test yang lebih besar.
- Dijalankan otomatis setiap kali ada deploy/push ke CI sebagai gate awal.

**Kegunaan Output:**
- Jika smoke test **gagal** → langsung stop, jangan lanjut ke load/stress test. Ada masalah dasar (endpoint down, salah URL, error 500, dsb) yang harus diperbaiki dulu.
- Jika smoke test **lolos** → sistem dianggap sehat secara fungsional dan siap diuji dengan beban lebih besar.

---

### 2. Load Test

**Fungsi/Manfaat:**
Mengukur bagaimana performa sistem saat menerima jumlah user/traffic yang **realistis**, sesuai kondisi harian/normal.

**Tujuan:**
- Mengetahui response time, throughput, dan error rate pada kondisi operasional normal.
- Memvalidasi apakah sistem memenuhi SLA (misalnya "95% request harus di bawah 800ms").
- Mendeteksi bottleneck yang muncul sebelum terlihat oleh user asli di production.

**Kegunaan Output:**
- Dipakai sebagai **baseline performa** — dibandingkan dari waktu ke waktu untuk melihat apakah ada regresi performa setelah perubahan kode.
- Jadi dasar keputusan "apakah sistem siap rilis?" berdasarkan threshold yang ditentukan (response time, error rate).
- Membantu tim menentukan kebutuhan resource (server, database, dsb) untuk kondisi operasional normal.

---

### 3. Stress Test

**Fungsi/Manfaat:**
Mencari **batas maksimum kapasitas** sistem dengan menaikkan beban terus-menerus melewati kondisi normal, sampai sistem mulai gagal atau melambat drastis.

**Tujuan:**
- Mengetahui titik jenuh (breaking point) sistem — berapa banyak user yang bisa ditangani sebelum sistem crash/error tinggi.
- Melihat bagaimana sistem berperilaku saat overload: apakah error meningkat bertahap (graceful degradation) atau langsung down total.
- Menguji kemampuan **recovery** sistem setelah beban diturunkan kembali ke normal.

**Kegunaan Output:**
- Dipakai untuk **capacity planning** — menentukan kapan perlu scaling (menambah server, load balancer, dsb).
- Menjadi acuan untuk menetapkan rate limiting atau auto-scaling threshold di infrastruktur.
- Membantu tim infrastruktur/SRE menyiapkan mitigasi sebelum sistem benar-benar overload di production.

---

### 4. Spike Test

**Fungsi/Manfaat:**
Menguji reaksi sistem terhadap **lonjakan traffic yang sangat mendadak** (bukan bertahap seperti stress test), misalnya saat flash sale, campaign viral, atau breaking news.

**Tujuan:**
- Memastikan sistem tidak langsung down saat traffic melonjak tiba-tiba dalam hitungan detik/menit.
- Mengukur seberapa cepat sistem bisa pulih (recover) setelah lonjakan traffic mereda.
- Menguji efektivitas mekanisme auto-scaling atau caching saat menghadapi beban tak terduga.

**Kegunaan Output:**
- Dipakai untuk mempersiapkan sistem menghadapi event bisnis tertentu (flash sale, launching produk, promo besar).
- Menjadi bukti/justifikasi untuk menyiapkan auto-scaling, CDN, atau caching layer tambahan sebelum event besar berlangsung.
- Menunjukkan apakah user akan mengalami downtime/error saat traffic naik drastis dalam waktu singkat.

---

### 5. Soak Test (Endurance Test)

**Fungsi/Manfaat:**
Menguji stabilitas sistem saat menerima beban moderat namun berjalan dalam **durasi yang lama** (berjam-jam), untuk menemukan masalah yang hanya muncul seiring waktu.

**Tujuan:**
- Mendeteksi **memory leak**, koneksi database yang tidak ditutup dengan benar, atau resource yang perlahan habis.
- Melihat apakah ada degradasi performa (response time makin lambat) seiring berjalannya waktu.
- Memvalidasi kestabilan sistem untuk operasional jangka panjang (misalnya server yang harus hidup 24/7).

**Kegunaan Output:**
- Dipakai untuk memastikan sistem **tidak butuh restart** dalam periode waktu tertentu karena resource habis.
- Menjadi dasar untuk menentukan jadwal maintenance/restart preventif jika memang ditemukan kebocoran resource.
- Memberi keyakinan bahwa sistem stabil untuk dijalankan di production dalam jangka waktu lama, bukan hanya kuat sesaat.

---

### Ringkasan Perbandingan

| Test    | Fokus Utama                     | Menjawab Pertanyaan                                              |
|---------|----------------------------------|--------------------------------------------------------------------|
| Smoke   | Validasi dasar                  | "Apakah sistem berjalan sama sekali?"                              |
| Load    | Performa kondisi normal         | "Seberapa baik sistem menangani traffic harian?"                  |
| Stress  | Batas kapasitas                 | "Seberapa jauh sistem bisa didorong sebelum gagal?"                |
| Spike   | Lonjakan mendadak                | "Apakah sistem tahan saat traffic naik drastis dalam sekejap?"    |
| Soak    | Stabilitas jangka panjang        | "Apakah sistem tetap stabil jika berjalan lama tanpa henti?"      |

## 🚀 Prasyarat

1. Install k6:
   - **macOS**: `brew install k6`
   - **Windows**: `choco install k6` atau `winget install k6 --source winget`
   - **Linux (Debian/Ubuntu)**:
     ```bash
     sudo gpg -k
     sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
     echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
     sudo apt-get update
     sudo apt-get install k6
     ```
   - **Docker**: `docker pull grafana/k6`

2. Clone repository ini:
   ```bash
   git clone https://github.com/zRILLL28/k6-performance-qa.git
   cd k6-performance-qa
   ```

## ▶️ Cara Menjalankan Test

Jalankan langsung dengan k6:

```bash
# Smoke test (default: local)
k6 run scripts/smoke-test.js

# Load test dengan environment staging
k6 run -e ENV=staging scripts/load-test.js

# Stress test
k6 run scripts/stress-test.js

# Spike test
k6 run scripts/spike-test.js

# Soak test (durasi lama, jalankan saat perlu saja)
k6 run scripts/soak-test.js
```

Atau menggunakan npm scripts (shortcut yang sudah didefinisikan di `package.json`):

```bash
npm run test:smoke
npm run test:load
npm run test:stress
npm run test:spike
npm run test:soak

# dengan target environment staging
npm run test:smoke:staging
npm run test:load:staging
```

Menjalankan via Docker (tanpa install k6 lokal):

```bash
docker run --rm -i -v "$(pwd)":/scripts grafana/k6 run /scripts/scripts/smoke-test.js
```

## ⚙️ Konfigurasi Environment

Base URL untuk tiap environment diatur di `config/environments.js`. Tambahkan/ubah environment sesuai kebutuhan, lalu pilih environment saat run test dengan flag `-e ENV=<nama_environment>`:

```bash
k6 run -e ENV=production scripts/load-test.js
```

## 📊 Melihat & Menyimpan Hasil Test

Simpan hasil test dalam format JSON untuk dianalisis lebih lanjut:

```bash
k6 run --out json=results/result.json scripts/load-test.js
```

Untuk visualisasi real-time, k6 juga bisa diintegrasikan dengan **Grafana Cloud k6** atau **InfluxDB + Grafana**:

```bash
k6 run --out influxdb=http://localhost:8086/k6 scripts/load-test.js
```

## ✅ Thresholds (Kriteria Keberhasilan)

Setiap script sudah memiliki `thresholds` bawaan, misalnya:

```js
thresholds: {
  http_req_failed: ['rate<0.01'],     // error rate di bawah 1%
  http_req_duration: ['p(95)<800'],   // 95% request selesai di bawah 800ms
}
```

Jika threshold tidak terpenuhi, k6 akan mengembalikan **exit code non-zero**, sehingga otomatis membuat CI pipeline gagal — cocok dijadikan gate kualitas performa sebelum deploy.

## 🔄 Integrasi CI/CD (GitHub Actions)

Workflow di `.github/workflows/k6-tests.yml` akan otomatis berjalan saat:
- Push atau pull request ke branch `main`
- Dijalankan manual via tab **Actions → Run workflow** (bisa memilih environment dan jenis test)

## 🧩 Menambahkan Skenario Test Baru

1. Buat file baru di folder `scripts/`, misalnya `checkout-flow-test.js`.
2. Import helper dari `utils/helpers.js` dan konfigurasi dari `config/environments.js`.
3. Tambahkan `options` (stages/thresholds) sesuai kebutuhan skenario.
4. (Opsional) tambahkan shortcut baru di `package.json`.
