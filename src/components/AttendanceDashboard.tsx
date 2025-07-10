import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Download, Filter, Search, Users, UserCheck, Clock, BarChart3, Building } from 'lucide-react';
import { AttendanceRecord } from '../types/attendance';
import { format } from 'date-fns';

interface AttendanceDashboardProps {
  records: AttendanceRecord[];
}

const getUniqueActivities = (records: AttendanceRecord[]) => {
  const allActivities = records.map(record => record.kegiatan);
  return [...new Set(allActivities)];
};

export const AttendanceDashboard: React.FC<AttendanceDashboardProps> = ({ records }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<string>('all');
  const [selectedUserType, setSelectedUserType] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  const uniqueActivities = useMemo(() => getUniqueActivities(records), [records]);

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const recordDate = new Date(record.waktu_presensi);
      const matchesSearch =
        record.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.nip && record.nip.includes(searchTerm)) ||
        (record.instansi && record.instansi.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesActivity = selectedActivity === 'all' || record.kegiatan === selectedActivity;
      const matchesUserType = selectedUserType === 'all' || record.tipe_user === selectedUserType;
      
      const matchesDate = !dateFilter || format(recordDate, 'yyyy-MM-dd') === dateFilter;

      return matchesSearch && matchesActivity && matchesUserType && matchesDate;
    });
  }, [records, searchTerm, selectedActivity, selectedUserType, dateFilter]);

  const exportToCSV = () => {
    const headers = ['Nama', 'NIP', 'Unit Kerja/Instansi', 'Kegiatan', 'Tipe User', 'Waktu Presensi'];
    const csvContent = [
      headers.join(','),
      ...filteredRecords.map(record => [
        `"${record.nama}"`,
        `"${record.nip || ''}"`,
        `"${record.instansi || ''}"`,
        `"${record.kegiatan}"`,
        `"${record.tipe_user}"`,
        `"${format(new Date(record.waktu_presensi), 'dd/MM/yyyy HH:mm')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `presensi-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = useMemo(() => {
    const totalAttendance = records.length;
    const internalCount = records.filter(r => r.tipe_user === 'internal').length;
    const externalCount = records.filter(r => r.tipe_user === 'eksternal').length;
    const todayCount = records.filter(r => 
      format(new Date(r.waktu_presensi), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    ).length;

    return { totalAttendance, internalCount, externalCount, todayCount };
  }, [records]);

  const activityStats = useMemo(() => {
    const statsMap = new Map<string, number>();
    records.forEach(record => {
      statsMap.set(record.kegiatan, (statsMap.get(record.kegiatan) || 0) + 1);
    });
    return Array.from(statsMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [records]);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Total Presensi</p><p className="text-2xl font-bold">{stats.totalAttendance}</p></div><Users className="h-8 w-8 text-blue-600" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Hari Ini</p><p className="text-2xl font-bold">{stats.todayCount}</p></div><Clock className="h-8 w-8 text-green-600" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Internal</p><p className="text-2xl font-bold">{stats.internalCount}</p></div><Building className="h-8 w-8 text-purple-600" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Eksternal</p><p className="text-2xl font-bold">{stats.externalCount}</p></div><Users className="h-8 w-8 text-orange-600" /></div></CardContent></Card>
      </div>

      {/* Activity Statistics */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Statistik Kegiatan</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {activityStats.map((stat, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="text-sm font-medium text-muted-foreground truncate" title={stat.name}>{stat.name}</div>
                <div className="text-2xl font-bold mt-1">{stat.count}</div>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${stats.totalAttendance > 0 ? (stat.count / records.length) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters and Table */}
      <Card>
        <CardHeader><CardTitle className="flex items-center justify-between"><div className="flex items-center gap-2"><Filter className="h-5 w-5" />Data Presensi</div><Button onClick={exportToCSV} variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export CSV</Button></CardTitle></CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="search"><Search className="inline h-4 w-4 mr-1" />Cari</Label>
              {/* PERUBAHAN 1: Placeholder diubah */}
              <Input id="search" placeholder="Nama, NIP, atau Unit Kerja/Instansi" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="space-y-2"><Label htmlFor="activity">Kegiatan</Label><Select value={selectedActivity} onValueChange={setSelectedActivity}><SelectTrigger><SelectValue placeholder="Semua kegiatan" /></SelectTrigger><SelectContent><SelectItem value="all">Semua Kegiatan</SelectItem>{uniqueActivities.map((activity) => (<SelectItem key={activity} value={activity}>{activity}</SelectItem>))}</SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="usertype">Tipe User</Label><Select value={selectedUserType} onValueChange={setSelectedUserType}><SelectTrigger><SelectValue placeholder="Semua tipe" /></SelectTrigger><SelectContent><SelectItem value="all">Semua Tipe</SelectItem><SelectItem value="internal">Internal</SelectItem><SelectItem value="eksternal">Eksternal</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="date"><Calendar className="inline h-4 w-4 mr-1" />Tanggal</Label><Input id="date" type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} /></div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-x-auto"><Table><TableHeader><TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>NIP</TableHead>
            {/* PERUBAHAN 2: Header tabel diubah */}
            <TableHead>Unit Kerja/Instansi</TableHead>
            <TableHead>Kegiatan</TableHead>
            <TableHead>Tipe</TableHead>
            <TableHead>Waktu</TableHead>
          </TableRow></TableHeader><TableBody>{filteredRecords.length === 0 ? (<TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Tidak ada data presensi ditemukan</TableCell></TableRow>) : (filteredRecords.map((record) => (<TableRow key={record.id}><TableCell className="font-medium">{record.nama}</TableCell><TableCell>{record.nip || '-'}</TableCell><TableCell>{record.instansi}</TableCell><TableCell>{record.kegiatan}</TableCell><TableCell><Badge variant={record.tipe_user === 'internal' ? 'default' : 'secondary'}>{record.tipe_user === 'internal' ? 'Internal' : 'Eksternal'}</Badge></TableCell><TableCell>{format(new Date(record.waktu_presensi), 'dd/MM/yyyy HH:mm')}</TableCell></TableRow>)))}</TableBody></Table></div>
          <div className="mt-4 text-sm text-muted-foreground">Menampilkan {filteredRecords.length} dari {records.length} total presensi</div>
        </CardContent>
      </Card>
    </div>
  );
};
