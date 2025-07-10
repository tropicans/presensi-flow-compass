import React, { useState, useEffect } from 'react';
import { AttendanceDashboard } from '../components/AttendanceDashboard';
import { AttendanceRecord } from '../types/attendance';
import { ShieldCheck } from 'lucide-react';

const AdminPage = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/records');
        if (!response.ok) {
          throw new Error('Gagal mengambil data dari server');
        }
        const data = await response.json();
        setAttendanceRecords(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan tidak diketahui');
        console.error("Error fetching records:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecords();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Header Admin */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-slate-800 rounded-full">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-800">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Area khusus untuk administrasi dan pemantauan data presensi.
          </p>
        </div>

        {isLoading ? (
          <p className="text-center">Memuat data...</p>
        ) : error ? (
          <p className="text-center text-red-500">Error: {error}</p>
        ) : (
          <AttendanceDashboard records={attendanceRecords} />
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 border-t py-4 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Attenda Admin Panel
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AdminPage;
