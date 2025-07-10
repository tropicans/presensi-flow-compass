import React, { useState } from 'react';
import { AttendanceForm } from '../components/AttendanceForm';
import { AttendanceRecord } from '../types/attendance';
import { ClipboardCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  // State ini mungkin tidak lagi diperlukan di sini, tapi kita biarkan untuk saat ini
  // jika ada logika yang bergantung padanya di masa depan.
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const { toast } = useToast();

  // Fungsi ini akan dipanggil setelah form berhasil mengirim data
  const handleFormSubmit = (newRecord: AttendanceRecord) => {
    // Di versi ini, kita hanya menampilkan notifikasi.
    // Data akan otomatis muncul di halaman admin saat di-refresh.
    setAttendanceRecords(prev => [newRecord, ...prev]);
    
    // Toast dipindahkan ke dalam form, jadi baris ini bisa dihapus jika duplikat.
    // Namun, kita biarkan untuk memastikan ada feedback.
    toast({
      title: "Sukses!",
      description: "Data presensi Anda telah berhasil direkam.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <ClipboardCheck className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Attenda
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            One Tap to Be Counted - Platform presensi modern untuk pegawai internal dan tamu eksternal
          </p>
        </div>

        {/* Form Presensi Langsung */}
        <div className="mt-6">
          <AttendanceForm onSubmit={handleFormSubmit} />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-white/20 py-4 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            dibuat-buat oleh Yudhi 2025
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
