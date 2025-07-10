require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const port = process.env.PORT || 3001;

// Fungsi untuk tes koneksi DB
async function testDbConnection() {
  try {
    await db.query('SELECT NOW()');
    console.log('✅ Koneksi database berhasil.');
  } catch (error) {
    console.error('❌ KONEKSI DATABASE GAGAL:', error.stack);
    process.exit(1);
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// ... (route GET /api/records tidak berubah) ...
app.get('/api/records', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM attendance_records ORDER BY waktu_presensi DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error executing query', err.stack);
    res.status(500).send('Server Error');
  }
});


// API Endpoint untuk menyimpan data presensi baru
app.post('/api/records', async (req, res) => {
  console.log('Menerima permintaan POST /api/records dengan body:', req.body);
  
  // Sekarang hanya menggunakan nomor_kontak
  const {
    tipe_user,
    nip,
    nama,
    jabatan,
    instansi,
    nomor_kontak,
    orang_dituju,
    tujuan,
    kegiatan,
    tanda_tangan,
  } = req.body;

  try {
    // Langkah 1: Masukkan ke attendance_records
    const newRecord = await db.query(
      `INSERT INTO attendance_records (
        tipe_user, nip, nama, jabatan, instansi, nomor_kontak, orang_dituju, tujuan, kegiatan, tanda_tangan, waktu_presensi
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      RETURNING *`,
      [
        tipe_user,
        nip,
        nama,
        jabatan,
        instansi,
        nomor_kontak,
        orang_dituju,
        tujuan,
        kegiatan,
        tanda_tangan,
      ]
    );

    // Langkah 2: Jika user internal, update tabel employees
    if (tipe_user === 'internal' && nip && nomor_kontak) {
      console.log(`Kondisi UPDATE terpenuhi untuk NIP: ${nip}. Mencoba memperbarui nomor_kontak...`);
      // Perintah UPDATE sekarang menggunakan nomor_kontak
      await db.query(
        'UPDATE employees SET nomor_kontak = $1 WHERE nip = $2',
        [nomor_kontak, nip]
      );
      console.log(`Nomor kontak untuk NIP ${nip} telah berhasil diperbarui.`);
    }

    res.status(201).json(newRecord.rows[0]);
  } catch (err) {
    console.error('Error executing insert/update query', err.stack);
    res.status(500).send('Server Error');
  }
});

// API Endpoint untuk mencari pegawai berdasarkan NIP dari tabel master
app.get('/api/employees/:nip', async (req, res) => {
    const { nip } = req.params;
    try {
      // Query sekarang mengambil nomor_kontak
      const { rows } = await db.query(
        'SELECT nip, full_name, unit_kerja, nomor_kontak FROM employees WHERE TRIM(nip) = $1',
        [nip]
      );
  
      if (rows.length > 0) {
        const employeeData = {
            nip: rows[0].nip,
            nama: rows[0].full_name,
            jabatan: rows[0].unit_kerja,
            instansi: rows[0].unit_kerja,
            nomor_kontak: rows[0].nomor_kontak, // Menggunakan nomor_kontak
        };
        res.json(employeeData);
      } else {
        res.status(404).json({ message: 'Pegawai tidak ditemukan' });
      }
    } catch (err) {
      console.error('Error executing employee query', err.stack);
      res.status(500).send('Server Error');
    }
});

// Jalankan tes koneksi, lalu start server
testDbConnection().then(() => {
    app.listen(port, () => {
        console.log(`Server berjalan di http://localhost:${port}`);
    });
});
