require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const port = process.env.PORT || 3001;

// --- FUNGSI VALIDASI ---
const validatePhoneNumber = (phone) => {
  if (!phone) return true;
  const phoneRegex = /^08[0-9]{8,11}$/;
  return phoneRegex.test(phone);
};

// --- FUNGSI TES KONEKSI DB (YANG HILANG) ---
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

// --- API ENDPOINTS UNTUK KEGIATAN (ACTIVITIES) ---

// GET: Mendapatkan semua kegiatan (untuk halaman admin)
app.get('/api/activities', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM activities ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching activities', err.stack);
    res.status(500).send('Server Error');
  }
});

// GET: Mendapatkan hanya kegiatan yang berstatus 'Aktif' (untuk form presensi)
app.get('/api/activities/active', async (req, res) => {
    try {
      const { rows } = await db.query("SELECT * FROM activities WHERE status = 'Aktif' ORDER BY nama_kegiatan ASC");
      res.json(rows);
    } catch (err) {
      console.error('Error fetching active activities', err.stack);
      res.status(500).send('Server Error');
    }
});

// POST: Membuat kegiatan baru
app.post('/api/activities', async (req, res) => {
    const { nama_kegiatan, tipe_kegiatan } = req.body;
    if (!nama_kegiatan || !tipe_kegiatan) {
        return res.status(400).json({ message: 'Nama dan Tipe Kegiatan harus diisi.' });
    }
    try {
        const newActivity = await db.query(
            'INSERT INTO activities (nama_kegiatan, tipe_kegiatan, status) VALUES ($1, $2, $3) RETURNING *',
            [nama_kegiatan, tipe_kegiatan, 'Aktif']
        );
        res.status(201).json(newActivity.rows[0]);
    } catch (err) {
        console.error('Error creating activity', err.stack);
        res.status(500).send('Server Error');
    }
});

// PUT: Mengubah kegiatan (termasuk status)
app.put('/api/activities/:id', async (req, res) => {
    const { id } = req.params;
    const { nama_kegiatan, tipe_kegiatan, status } = req.body;
    if (!nama_kegiatan || !tipe_kegiatan || !status) {
        return res.status(400).json({ message: 'Semua field harus diisi.' });
    }
    try {
        const updatedActivity = await db.query(
            'UPDATE activities SET nama_kegiatan = $1, tipe_kegiatan = $2, status = $3 WHERE id = $4 RETURNING *',
            [nama_kegiatan, tipe_kegiatan, status, id]
        );
        if (updatedActivity.rows.length === 0) {
            return res.status(404).json({ message: 'Kegiatan tidak ditemukan.' });
        }
        res.json(updatedActivity.rows[0]);
    } catch (err) {
        console.error('Error updating activity', err.stack);
        res.status(500).send('Server Error');
    }
});

// DELETE: Menghapus kegiatan
app.delete('/api/activities/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deleteOp = await db.query('DELETE FROM activities WHERE id = $1 RETURNING *', [id]);
        if (deleteOp.rowCount === 0) {
            return res.status(404).json({ message: 'Kegiatan tidak ditemukan.' });
        }
        res.status(200).json({ message: 'Kegiatan berhasil dihapus.' });
    } catch (err) {
        console.error('Error deleting activity', err.stack);
        res.status(500).send('Server Error');
    }
});


// --- API ENDPOINTS UNTUK PRESENSI & PEGAWAI (TIDAK BERUBAH) ---

app.get('/api/records', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM attendance_records ORDER BY waktu_presensi DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error executing query', err.stack);
    res.status(500).send('Server Error');
  }
});

app.post('/api/records', async (req, res) => {
  const {
    tipe_user, nip, nama, jabatan, instansi, nomor_kontak, orang_dituju, tujuan, kegiatan, tanda_tangan,
  } = req.body;

  if (!validatePhoneNumber(nomor_kontak)) {
    return res.status(400).json({ message: 'Format Nomor Kontak tidak valid.' });
  }

  try {
    const newRecord = await db.query(
      `INSERT INTO attendance_records (
        tipe_user, nip, nama, jabatan, instansi, nomor_kontak, orang_dituju, tujuan, kegiatan, tanda_tangan, waktu_presensi
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      RETURNING *`,
      [
        tipe_user, nip, nama, jabatan, tipe_user === 'internal' ? jabatan : instansi, nomor_kontak, orang_dituju, tujuan, kegiatan, tanda_tangan,
      ]
    );

    if (tipe_user === 'internal' && nip && nomor_kontak) {
      await db.query('UPDATE employees SET nomor_kontak = $1 WHERE nip = $2', [nomor_kontak, nip]);
    }

    res.status(201).json(newRecord.rows[0]);
  } catch (err) {
    console.error('Error executing insert/update query', err.stack);
    res.status(500).send('Server Error');
  }
});

app.get('/api/employees/:nip', async (req, res) => {
    const { nip } = req.params;
    try {
      const { rows } = await db.query('SELECT nip, full_name, unit_kerja, nomor_kontak FROM employees WHERE TRIM(nip) = $1', [nip]);
      if (rows.length > 0) {
        const employeeData = {
            nip: rows[0].nip,
            nama: rows[0].full_name,
            jabatan: rows[0].unit_kerja,
            nomor_kontak: rows[0].nomor_kontak,
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
