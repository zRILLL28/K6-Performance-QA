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
   git clone https://github.com/<username>/k6-performance-qa.git
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

## 📄 Lisensi

MIT
