
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AttendanceForm } from '../components/AttendanceForm';
import { AttendanceDashboard } from '../components/AttendanceDashboard';
import { AttendanceRecord } from '../types/attendance';
import { ClipboardCheck, BarChart3, Users, Building } from 'lucide-react';

const Index = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  const handleFormSubmit = (record: AttendanceRecord) => {
    setAttendanceRecords(prev => [...prev, record]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <ClipboardCheck className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Sistem Presensi Digital
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Platform presensi modern untuk pegawai internal dan tamu eksternal dengan interface yang mudah digunakan
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 border border-white/20 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Total Presensi</h3>
                <p className="text-2xl font-bold text-blue-600">{attendanceRecords.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 border border-white/20 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Pegawai Internal</h3>
                <p className="text-2xl font-bold text-green-600">
                  {attendanceRecords.filter(r => r.tipe_user === 'internal').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 border border-white/20 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Tamu Eksternal</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {attendanceRecords.filter(r => r.tipe_user === 'eksternal').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="form" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="form" className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              Form Presensi
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="mt-6">
            <AttendanceForm onSubmit={handleFormSubmit} />
          </TabsContent>

          <TabsContent value="dashboard" className="mt-6">
            <AttendanceDashboard records={attendanceRecords} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
