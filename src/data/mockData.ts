
import { Activity, Employee } from '../types/attendance';

export const mockActivities: Activity[] = [
  { id: '1', nama_kegiatan: 'Rapat Koordinasi' },
  { id: '2', nama_kegiatan: 'Seminar Tamu' },
  { id: '3', nama_kegiatan: 'Kunjungan Dinas' },
  { id: '4', nama_kegiatan: 'Pelatihan Internal' },
];

export const mockEmployees: Employee[] = [
  { nip: '123456789', nama: 'Ahmad Wijaya', jabatan: 'Kepala Bagian', instansi: 'Dinas Komunikasi dan Informatika' },
  { nip: '987654321', nama: 'Siti Nurhaliza', jabatan: 'Staff Administrasi', instansi: 'Dinas Komunikasi dan Informatika' },
  { nip: '456789123', nama: 'Budi Santoso', jabatan: 'Programmer', instansi: 'Dinas Komunikasi dan Informatika' },
];
