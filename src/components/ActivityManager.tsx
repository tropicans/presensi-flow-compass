import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2, ListChecks, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import QRCode from 'qrcode.react';
import { API_BASE_URL } from '../config'; // <-- Tambahkan impor ini

interface Activity {
  id: number;
  nama_kegiatan: string;
  tipe_kegiatan: 'Luring' | 'Daring';
  status: 'Aktif' | 'Tidak Aktif';
  created_at: string;
}

export const ActivityManager: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<Partial<Activity>>({});
  
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [qrActivity, setQrActivity] = useState<Activity | null>(null);

  const { toast } = useToast();

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      // Ganti URL dengan konstanta
      const response = await fetch(`${API_BASE_URL}/api/activities`);
      if (!response.ok) throw new Error('Gagal mengambil data kegiatan');
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleSaveActivity = async () => {
    if (!currentActivity.nama_kegiatan || !currentActivity.tipe_kegiatan) {
        toast({ title: 'Validasi Gagal', description: 'Nama dan Tipe Kegiatan harus diisi.', variant: 'destructive' });
        return;
    }

    const method = currentActivity.id ? 'PUT' : 'POST';
    // Ganti URL dengan konstanta
    const url = currentActivity.id 
        ? `${API_BASE_URL}/api/activities/${currentActivity.id}` 
        : `${API_BASE_URL}/api/activities`;

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentActivity),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Gagal menyimpan kegiatan');
        }

        toast({ title: 'Sukses!', description: `Kegiatan berhasil ${currentActivity.id ? 'diperbarui' : 'dibuat'}.` });
        setIsFormDialogOpen(false);
        setCurrentActivity({});
        fetchActivities();
    } catch (error) {
        toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    }
  };

  const handleDeleteActivity = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus kegiatan ini?')) return;

    try {
        // Ganti URL dengan konstanta
        const response = await fetch(`${API_BASE_URL}/api/activities/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Gagal menghapus kegiatan');
        toast({ title: 'Sukses!', description: 'Kegiatan berhasil dihapus.' });
        fetchActivities();
    } catch (error) {
        toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    }
  };

  const openFormDialog = (activity: Partial<Activity> = {}) => {
    setCurrentActivity(activity.id ? activity : { tipe_kegiatan: 'Luring', status: 'Aktif' });
    setIsFormDialogOpen(true);
  };

  const openQrDialog = (activity: Activity) => {
    setQrActivity(activity);
    setIsQrDialogOpen(true);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                  <ListChecks className="h-6 w-6" />
                  <CardTitle>Manajemen Kegiatan</CardTitle>
              </div>
              <Button onClick={() => openFormDialog()}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Tambah Kegiatan
              </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Kegiatan</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal Dibuat</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center">Memuat...</TableCell></TableRow>
                ) : activities.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center">Belum ada kegiatan.</TableCell></TableRow>
                ) : (
                  activities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="font-medium">{activity.nama_kegiatan}</TableCell>
                      <TableCell>
                          <Badge variant={activity.tipe_kegiatan === 'Daring' ? 'secondary' : 'default'}>
                              {activity.tipe_kegiatan}
                          </Badge>
                      </TableCell>
                      <TableCell>
                          <Badge variant={activity.status === 'Aktif' ? 'default' : 'destructive'} className={activity.status === 'Aktif' ? 'bg-green-600' : ''}>
                              {activity.status}
                          </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(activity.created_at), 'dd MMMM yyyy')}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openQrDialog(activity)}>
                          <QrCode className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openFormDialog(activity)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteActivity(activity.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentActivity.id ? 'Edit Kegiatan' : 'Tambah Kegiatan Baru'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nama_kegiatan">Nama Kegiatan</Label>
              <Input id="nama_kegiatan" value={currentActivity.nama_kegiatan || ''} onChange={(e) => setCurrentActivity({ ...currentActivity, nama_kegiatan: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipe_kegiatan">Tipe Kegiatan</Label>
              <Select value={currentActivity.tipe_kegiatan} onValueChange={(value: 'Luring' | 'Daring') => setCurrentActivity({ ...currentActivity, tipe_kegiatan: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Luring">Luring</SelectItem>
                  <SelectItem value="Daring">Daring</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {currentActivity.id && (
                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={currentActivity.status} onValueChange={(value: 'Aktif' | 'Tidak Aktif') => setCurrentActivity({ ...currentActivity, status: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                        <SelectItem value="Aktif">Aktif</SelectItem>
                        <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button onClick={handleSaveActivity}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>QR Code untuk: {qrActivity?.nama_kegiatan}</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center p-6">
                {qrActivity && (
                    <QRCode
                        value={`${window.location.origin}?activityId=${qrActivity.id}`}
                        size={256}
                        level={"H"}
                        includeMargin={true}
                    />
                )}
            </div>
            <DialogFooter className="sm:justify-center">
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Tutup</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};