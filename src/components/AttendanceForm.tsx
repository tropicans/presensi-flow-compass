import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, User, Users, Building, Phone, Target, Calendar, Signature, AlertCircle } from 'lucide-react';
import { AttendanceRecord } from '../types/attendance';
import { mockActivities } from '../data/mockData';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '../hooks/use-debounce';

interface AttendanceFormProps {
  onSubmit: (record: AttendanceRecord) => void;
}

export const AttendanceForm: React.FC<AttendanceFormProps> = ({ onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userType, setUserType] = useState<'internal' | 'eksternal' | null>(null);
  const [formData, setFormData] = useState<Partial<AttendanceRecord>>({});
  const [isEmployeeFound, setIsEmployeeFound] = useState(false);
  const { toast } = useToast();
  
  const [nipInput, setNipInput] = useState('');
  const debouncedNip = useDebounce(nipInput, 500);

  // --- STATE BARU UNTUK ERROR VALIDASI ---
  const [contactError, setContactError] = useState<string | null>(null);

  const totalSteps = userType === 'internal' ? 6 : 9;
  const progress = (currentStep / totalSteps) * 100;

  // --- FUNGSI BARU UNTUK VALIDASI DI FRONTEND ---
  const validateContact = (contact: string | undefined) => {
    // Jika nomor kontak kosong atau tidak ada, tidak ada error (opsional)
    if (!contact || contact.trim() === '') {
      setContactError(null);
      return true;
    }
    // Regex: harus diawali '08', diikuti 8 sampai 11 digit angka.
    const phoneRegex = /^08[0-9]{8,11}$/;
    if (!phoneRegex.test(contact)) {
      setContactError('Format nomor tidak valid (contoh: 081234567890).');
      return false;
    }
    setContactError(null); // Hapus error jika valid
    return true;
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleUserTypeSelect = (type: 'internal' | 'eksternal') => {
    setUserType(type);
    setFormData({ tipe_user: type });
    setIsEmployeeFound(false);
    setNipInput('');
    setContactError(null); // Reset error saat ganti user type
    handleNext();
  };
  
  useEffect(() => {
    const searchNip = async () => {
      if (debouncedNip.length < 3) {
        setIsEmployeeFound(false);
        setFormData(currentData => ({ ...currentData, nip: debouncedNip, nama: '', jabatan: '', nomor_kontak: '' }));
        return;
      }

      try {
        const response = await fetch(`http://localhost:3001/api/employees/${debouncedNip}`);
        
        if (response.ok) {
          const employee = await response.json();
          setFormData(currentData => ({
            ...currentData,
            nip: employee.nip,
            nama: employee.nama,
            jabatan: employee.jabatan,
            nomor_kontak: employee.nomor_kontak,
          }));
          // Validasi nomor kontak yang didapat dari DB
          validateContact(employee.nomor_kontak);
          setIsEmployeeFound(true);
          toast({ title: "Data ditemukan", description: `Selamat datang, ${employee.nama}!` });
        } else {
          setIsEmployeeFound(false);
          setFormData(currentData => ({ ...currentData, nip: debouncedNip, nama: '', jabatan: '', nomor_kontak: '' }));
        }
      } catch (error) {
        setIsEmployeeFound(false);
        console.error("Gagal mencari NIP:", error);
        toast({ title: "Error", description: "Tidak dapat terhubung ke server untuk verifikasi NIP.", variant: "destructive" });
      }
    };

    if (userType === 'internal') {
      searchNip();
    }
  }, [debouncedNip, userType, toast]);

  const handleSubmit = async () => {
    // Lakukan validasi sekali lagi sebelum submit
    if (!validateContact(formData.nomor_kontak)) {
        toast({ title: "Validasi Gagal", description: "Mohon perbaiki format nomor kontak sebelum submit.", variant: "destructive" });
        return;
    }

    const newRecordPayload = { ...formData, tipe_user: formData.tipe_user!, nama: formData.nama!, instansi: formData.instansi!, kegiatan: formData.kegiatan! };

    try {
      const response = await fetch('http://localhost:3001/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecordPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menyimpan data ke server');
      }

      const savedRecord = await response.json();
      onSubmit(savedRecord);
      toast({ title: "Presensi berhasil dicatat", description: "Terima kasih atas kehadiran Anda!" });

      setCurrentStep(1);
      setUserType(null);
      setFormData({});
      setIsEmployeeFound(false);
      setNipInput('');
      setContactError(null);

    } catch (error) {
      console.error('Error submitting form:', error);
      toast({ title: "Terjadi Kesalahan", description: error instanceof Error ? error.message : "Tidak dapat menyimpan data presensi.", variant: "destructive" });
    }
  };
  
  // Fungsi untuk menangani perubahan input nomor kontak
  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, nomor_kontak: value });
    validateContact(value);
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <div className="mb-6"><h2 className="text-2xl font-bold mb-2">Selamat Datang</h2><p className="text-muted-foreground">Silakan pilih jenis pengguna Anda</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={() => handleUserTypeSelect('internal')} className="h-24 flex flex-col gap-2 bg-blue-600 hover:bg-blue-700" size="lg"><User className="h-8 w-8" /><span className="text-lg">Pegawai Internal</span></Button>
              <Button onClick={() => handleUserTypeSelect('eksternal')} className="h-24 flex flex-col gap-2 bg-green-600 hover:bg-green-700" size="lg"><Users className="h-8 w-8" /><span className="text-lg">Pihak Eksternal</span></Button>
            </div>
          </div>
        );
      case 2:
        if (userType === 'internal') {
          return (
            <div className="space-y-4">
              <div className="text-center mb-6"><h2 className="text-xl font-bold">Input NIP</h2><p className="text-muted-foreground">Masukkan Nomor Induk Pegawai Anda</p></div>
              <div className="space-y-2"><Label htmlFor="nip">NIP</Label><Input id="nip" placeholder="Ketik NIP untuk mencari..." value={nipInput} onChange={(e) => setNipInput(e.target.value)} /></div>
            </div>
          );
        }
        return (
          <div className="space-y-4">
            <div className="text-center mb-6"><h2 className="text-xl font-bold">Data Pribadi</h2><p className="text-muted-foreground">Masukkan nama lengkap Anda</p></div>
            <div className="space-y-2"><Label htmlFor="nama">Nama Lengkap</Label><Input id="nama" placeholder="Masukkan nama lengkap" value={formData.nama || ''} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} /></div>
          </div>
        );
      case 3:
        if (userType === 'internal') {
          return (
            <div className="space-y-4">
              <div className="text-center mb-6"><h2 className="text-xl font-bold">Konfirmasi Data</h2><p className="text-muted-foreground">Periksa data Anda. Nomor kontak bisa diubah jika perlu.</p></div>
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="nama">Nama</Label><Input id="nama" value={formData.nama || ''} disabled={isEmployeeFound} onChange={(e) => setFormData({...formData, nama: e.target.value})} /></div>
                  <div className="space-y-2"><Label htmlFor="jabatan">Unit Kerja</Label><Input id="jabatan" value={formData.jabatan || ''} disabled={isEmployeeFound} onChange={(e) => setFormData({...formData, jabatan: e.target.value})} /></div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="nomor_kontak">Nomor Kontak</Label>
                    <Input id="nomor_kontak" placeholder="Masukkan nomor kontak" value={formData.nomor_kontak || ''} onChange={handleContactChange} />
                    {contactError && <p className="text-sm text-destructive mt-1 flex items-center gap-1"><AlertCircle size={14} /> {contactError}</p>}
                  </div>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-4">
            <div className="text-center mb-6"><h2 className="text-xl font-bold">Instansi</h2><p className="text-muted-foreground">Dari instansi/perusahaan mana?</p></div>
            <div className="space-y-2"><Label htmlFor="instansi"><Building className="inline h-4 w-4 mr-2" />Instansi/Perusahaan</Label><Input id="instansi" placeholder="Nama instansi atau perusahaan" value={formData.instansi || ''} onChange={(e) => setFormData({ ...formData, instansi: e.target.value })} /></div>
          </div>
        );
      case 4:
        if (userType === 'internal') {
          return (
            <div className="space-y-4">
              <div className="text-center mb-6"><h2 className="text-xl font-bold">Pilih Kegiatan</h2><p className="text-muted-foreground">Kegiatan apa yang akan Anda ikuti?</p></div>
              <div className="space-y-2"><Label htmlFor="kegiatan"><Calendar className="inline h-4 w-4 mr-2" />Kegiatan</Label><Select onValueChange={(value) => setFormData({ ...formData, kegiatan: value })}><SelectTrigger><SelectValue placeholder="Pilih kegiatan" /></SelectTrigger><SelectContent>{mockActivities.map((activity) => (<SelectItem key={activity.id} value={activity.nama_kegiatan}>{activity.nama_kegiatan}</SelectItem>))}</SelectContent></Select></div>
            </div>
          );
        }
        return (
          <div className="space-y-4">
            <div className="text-center mb-6"><h2 className="text-xl font-bold">Kontak</h2><p className="text-muted-foreground">Nomor yang bisa dihubungi</p></div>
            <div className="space-y-2">
              <Label htmlFor="kontak"><Phone className="inline h-4 w-4 mr-2" />Nomor Kontak (WhatsApp/Telepon)</Label>
              <Input id="kontak" placeholder="Contoh: 08123456789" value={formData.nomor_kontak || ''} onChange={handleContactChange} />
              {contactError && <p className="text-sm text-destructive mt-1 flex items-center gap-1"><AlertCircle size={14} /> {contactError}</p>}
            </div>
          </div>
        );
      case 5:
        if (userType === 'internal') {
          return (
            <div className="space-y-4">
              <div className="text-center mb-6"><h2 className="text-xl font-bold">Tanda Tangan</h2><p className="text-muted-foreground">Tanda tangan digital (opsional)</p></div>
              <div className="space-y-2"><Label htmlFor="signature"><Signature className="inline h-4 w-4 mr-2" />Tanda Tangan</Label><div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center"><Signature className="h-12 w-12 mx-auto mb-2 text-muted-foreground" /><p className="text-sm text-muted-foreground">Area tanda tangan digital</p><p className="text-xs text-muted-foreground mt-1">(Fitur akan dikembangkan)</p></div></div>
            </div>
          );
        }
        return (
          <div className="space-y-4">
            <div className="text-center mb-6"><h2 className="text-xl font-bold">Orang yang Dituju</h2><p className="text-muted-foreground">Siapa yang ingin Anda temui?</p></div>
            <div className="space-y-2"><Label htmlFor="orang_dituju"><Target className="inline h-4 w-4 mr-2" />Nama Orang yang Dituju</Label><Input id="orang_dituju" placeholder="Nama pegawai/pejabat yang dituju" value={formData.orang_dituju || ''} onChange={(e) => setFormData({ ...formData, orang_dituju: e.target.value })} /></div>
          </div>
        );
      case 6:
        if (userType === 'internal') {
          return (
            <div className="space-y-4">
              <div className="text-center mb-6"><CheckCircle className="h-16 w-16 mx-auto text-green-600 mb-4" /><h2 className="text-xl font-bold">Konfirmasi Presensi</h2><p className="text-muted-foreground">Periksa data presensi Anda</p></div>
              <div className="p-4 border rounded-lg bg-muted/50"><div className="grid grid-cols-1 gap-2"><div><strong>Nama:</strong> {formData.nama}</div><div><strong>NIP:</strong> {formData.nip}</div><div><strong>Unit Kerja:</strong> {formData.jabatan}</div><div><strong>Nomor Kontak:</strong> {formData.nomor_kontak || '-'}</div><div><strong>Kegiatan:</strong> {formData.kegiatan}</div></div></div>
            </div>
          );
        }
        return (
          <div className="space-y-4">
            <div className="text-center mb-6"><h2 className="text-xl font-bold">Tujuan Kedatangan</h2><p className="text-muted-foreground">Apa tujuan kunjungan Anda?</p></div>
            <div className="space-y-2"><Label htmlFor="tujuan">Tujuan Kedatangan</Label><Textarea id="tujuan" placeholder="Jelaskan secara singkat tujuan kedatangan Anda" value={formData.tujuan || ''} onChange={(e) => setFormData({ ...formData, tujuan: e.target.value })} rows={4} /></div>
          </div>
        );
      // ... sisa case tidak berubah
      default:
        return null;
    }
  };

  const isStepValid = () => {
    // Jika ada error format kontak, tombol lanjut selalu nonaktif
    if (contactError) {
      return false;
    }

    switch (currentStep) {
      case 1: return userType !== null;
      case 2:
        if (userType === 'internal') return !!isEmployeeFound;
        return !!formData.nama && formData.nama.length > 0;
      case 3:
        if (userType === 'internal') {
            // Nomor kontak boleh kosong, tapi jika diisi harus valid.
            // Karena pengecekan `contactError` sudah di atas, kita hanya perlu cek kondisi lain.
            return true;
        }
        return !!formData.instansi && formData.instansi.length > 0;
      case 4:
        if (userType === 'internal') return !!formData.kegiatan && formData.kegiatan.length > 0;
        // Untuk eksternal, nomor kontak wajib diisi.
        return !!formData.nomor_kontak && formData.nomor_kontak.length > 0;
      case 5:
        if (userType === 'internal') return true;
        return !!formData.orang_dituju && formData.orang_dituju.length > 0;
      case 6:
        if (userType === 'internal') return true;
        return !!formData.tujuan && formData.tujuan.length > 0;
      case 7: return !!formData.kegiatan && formData.kegiatan.length > 0;
      case 8: return true;
      case 9: return true;
      default: return false;
    }
  };

  const isLastStep = currentStep === totalSteps;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Sistem Presensi Digital</CardTitle>
        <div className="mt-4">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Langkah {currentStep} dari {totalSteps}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="min-h-[300px]">{renderStep()}</div>
        <div className="flex justify-between mt-8">
          <Button onClick={handleBack} disabled={currentStep === 1} variant="outline">Kembali</Button>
          <Button onClick={isLastStep ? handleSubmit : handleNext} disabled={!isStepValid()} className={isLastStep ? "bg-green-600 hover:bg-green-700" : ""}>
            {isLastStep ? 'Submit Presensi' : 'Lanjut'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
