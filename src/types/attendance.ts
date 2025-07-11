export interface Activity {
  id: string;
  nama_kegiatan: string;
}

export interface AttendanceRecord {
  id: string;
  tipe_user: 'internal' | 'eksternal';
  nip?: string;
  nama: string;
  unit_kerja?: string; // Diubah dari jabatan
  instansi?: string;
  nomor_kontak?: string;
  orang_dituju?: string;
  tujuan?: string;
  kegiatan: string;
  waktu_presensi: Date;
  tanda_tangan?: string;
}

export interface Employee {
  nip: string;
  nama: string;
  unit_kerja: string; // Diubah dari jabatan
  instansi?: string;
  nomor_kontak?: string;
}
