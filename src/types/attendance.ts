export interface Activity {
  id: string;
  nama_kegiatan: string;
  tipe_kegiatan: 'Luring' | 'Daring';
}

export interface AttendanceRecord {
  id: string;
  tipe_user: 'internal' | 'eksternal';
  nip?: string;
  nama: string;
  unit_kerja?: string;
  instansi?: string;
  nomor_kontak?: string;
  email?: string; // Ditambahkan
  orang_dituju?: string;
  tujuan?: string;
  kegiatan: string;
  waktu_presensi: Date;
  tanda_tangan?: string;
}

export interface Employee {
  nip: string;
  nama: string;
  unit_kerja: string;
  instansi?: string;
  nomor_kontak?: string;
}
