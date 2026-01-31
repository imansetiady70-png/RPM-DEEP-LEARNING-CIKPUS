
import React, { useState, useRef } from 'react';
import { FormData, GeneratedRPM, EducationLevel, GraduateDimension, PedagogicalPractice, MeetingConfig } from './types';
import { generateRPMContent } from './services/geminiService';

const GRADUATE_DIMENSIONS: GraduateDimension[] = [
  'Keimanan & Ketakwaan', 'Kewargaan', 'Penalaran Kritis', 'Kreativitas', 
  'Kolaborasi', 'Kemandirian', 'Kesehatan', 'Komunikasi'
];

const PEDAGOGICAL_OPTIONS: PedagogicalPractice[] = [
  'Inkuiri-Discovery Learning', 'PjBL', 'Problem Based Learning', 'Game Based Learning', 'Station Learning'
];

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    schoolName: '',
    teacherName: '',
    teacherNip: '',
    principalName: '',
    principalNip: '',
    level: 'SD',
    grade: '1',
    subject: '',
    cp: '',
    tp: '',
    material: '',
    meetingCount: 1,
    duration: '',
    meetingConfigs: [{ practice: 'Inkuiri-Discovery Learning' }],
    dimensions: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [rpmResult, setRpmResult] = useState<GeneratedRPM | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const level = e.target.value as EducationLevel;
    let defaultGrade = '1';
    if (level === 'SMP') defaultGrade = '7';
    if (level === 'SMA' || level === 'SMK') defaultGrade = '10';
    setFormData(prev => ({ ...prev, level, grade: defaultGrade }));
  };

  const handleMeetingCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value) || 1;
    const configs: MeetingConfig[] = Array.from({ length: count }, (_, i) => ({
      practice: formData.meetingConfigs[i]?.practice || 'Inkuiri-Discovery Learning'
    }));
    setFormData(prev => ({ ...prev, meetingCount: count, meetingConfigs: configs }));
  };

  const toggleDimension = (dim: GraduateDimension) => {
    setFormData(prev => ({
      ...prev,
      dimensions: prev.dimensions.includes(dim)
        ? prev.dimensions.filter(d => d !== dim)
        : [...prev.dimensions, dim]
    }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await generateRPMContent(formData);
      setRpmResult(result);
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error("Error generating RPM:", error);
      alert("Terjadi kesalahan saat membuat RPM. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyAndOpenGoogleDocs = async () => {
    if (!outputRef.current) return;
    
    try {
      // Create a rich text representation of the content
      const content = outputRef.current.innerHTML;
      const type = "text/html";
      const blob = new Blob([content], { type });
      const data = [new ClipboardItem({ [type]: blob })];
      
      await navigator.clipboard.write(data);
      alert("Berhasil menyalin konten! Silakan paste (Ctrl+V) di tab Google Dokumen yang akan terbuka.");
      window.open("https://docs.new", "_blank");
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Gagal menyalin otomatis. Harap salin manual tabelnya.");
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 p-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <i className="fas fa-file-invoice text-2xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Generator RPM</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 mt-6">
        {/* Form Section */}
        <section className="bg-white rounded-xl shadow-md p-6 mb-10 border border-gray-100 no-print">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-700">
            <i className="fas fa-edit text-blue-500"></i> Form Input RPM
          </h2>
          
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Identitas Satuan Pendidikan */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-600 border-b pb-1">Data Satuan & Pejabat</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama Satuan Pendidikan *</label>
                  <input required name="schoolName" value={formData.schoolName} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" placeholder="Contoh: SMKN 1 Cikarang Pusat" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama Kepala Sekolah *</label>
                  <input required name="principalName" value={formData.principalName} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">NIP Kepala Sekolah *</label>
                  <input required name="principalNip" value={formData.principalNip} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama Guru *</label>
                  <input required name="teacherName" value={formData.teacherName} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">NIP Guru *</label>
                  <input required name="teacherNip" value={formData.teacherNip} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                </div>
              </div>

              {/* Kurikulum */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-600 border-b pb-1">Detail Pembelajaran</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Jenjang *</label>
                    <select name="level" value={formData.level} onChange={handleLevelChange} className="mt-1 block w-full rounded-md border border-gray-300 p-2">
                      <option value="SD">SD</option>
                      <option value="SMP">SMP</option>
                      <option value="SMA">SMA</option>
                      <option value="SMK">SMK</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Kelas *</label>
                    <input required name="grade" value={formData.grade} onChange={handleInputChange} className="mt-1 block w-full rounded-md border border-gray-300 p-2" placeholder="Contoh: 10 TKJ" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mata Pelajaran *</label>
                  <input required name="subject" value={formData.subject} onChange={handleInputChange} className="mt-1 block w-full rounded-md border border-gray-300 p-2" placeholder="Informatika" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Materi Pelajaran *</label>
                  <input required name="material" value={formData.material} onChange={handleInputChange} className="mt-1 block w-full rounded-md border border-gray-300 p-2" placeholder="Cyber Security" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Jumlah Pertemuan *</label>
                    <input type="number" min="1" required name="meetingCount" value={formData.meetingCount} onChange={handleMeetingCountChange} className="mt-1 block w-full rounded-md border border-gray-300 p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Durasi Per Pertemuan *</label>
                    <input required name="duration" value={formData.duration} onChange={handleInputChange} className="mt-1 block w-full rounded-md border border-gray-300 p-2" placeholder="2 x 45 menit" />
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Capaian Pembelajaran (CP) *</label>
                <textarea required name="cp" value={formData.cp} onChange={handleInputChange} rows={3} className="mt-1 block w-full rounded-md border border-gray-300 p-2" placeholder="Masukkan deskripsi CP..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tujuan Pembelajaran (TP) *</label>
                <textarea required name="tp" value={formData.tp} onChange={handleInputChange} rows={3} className="mt-1 block w-full rounded-md border border-gray-300 p-2" placeholder="Masukkan poin-poin TP..." />
              </div>
            </div>

            {/* Dynamic Pedagogical Practices */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="font-semibold text-blue-800 mb-3"><i className="fas fa-chalkboard-teacher mr-2"></i> Praktik Pedagogis Tiap Pertemuan</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {formData.meetingConfigs.map((config, index) => (
                  <div key={index} className="bg-white p-3 rounded border border-blue-200">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pertemuan {index + 1}</label>
                    <select 
                      value={config.practice}
                      onChange={(e) => {
                        const newConfigs = [...formData.meetingConfigs];
                        newConfigs[index].practice = e.target.value as PedagogicalPractice;
                        setFormData(prev => ({ ...prev, meetingConfigs: newConfigs }));
                      }}
                      className="w-full text-sm rounded border-gray-300 p-1"
                    >
                      {PEDAGOGICAL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Graduate Dimensions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dimensi Lulusan (Pilih sesuai) *</label>
              <div className="flex flex-wrap gap-2">
                {GRADUATE_DIMENSIONS.map(dim => (
                  <button
                    key={dim}
                    type="button"
                    onClick={() => toggleDimension(dim)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      formData.dimensions.includes(dim)
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {dim}
                  </button>
                ))}
              </div>
              {formData.dimensions.length === 0 && <p className="text-red-500 text-xs mt-1">Pilih setidaknya satu dimensi.</p>}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading || formData.dimensions.length === 0}
                className={`w-full py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                }`}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-circle-notch animate-spin"></i>
                    Menyusun RPM dengan AI...
                  </>
                ) : (
                  <>
                    <i className="fas fa-magic"></i>
                    Generate RPM
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Output Section */}
        {rpmResult && (
          <section className="bg-white rounded-xl shadow-xl overflow-hidden mb-20">
            <div className="bg-gray-800 text-white p-4 flex justify-between items-center no-print">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <i className="fas fa-file-alt text-blue-400"></i> Hasil Perencanaan Pembelajaran Mendalam
              </h2>
              <button 
                onClick={copyAndOpenGoogleDocs}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all"
              >
                <i className="fab fa-google-drive"></i>
                Salin & Buka di Google Dokumen
              </button>
            </div>

            <div ref={outputRef} className="p-8 bg-white text-black" style={{ minHeight: '1000px' }}>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold uppercase underline">Perencanaan Pembelajaran Mendalam (RPM)</h1>
                <p className="font-semibold text-lg">{formData.schoolName}</p>
              </div>

              {/* Tabel RPM */}
              <table className="w-full table-rpm mb-12 border-collapse border border-black">
                <tbody>
                  {/* Bagian 1: Identitas */}
                  <tr className="bg-gray-100">
                    <td colSpan={2} className="font-bold">1. IDENTITAS</td>
                  </tr>
                  <tr>
                    <td className="w-1/3">Nama Satuan Pendidikan</td>
                    <td>{formData.schoolName}</td>
                  </tr>
                  <tr>
                    <td>Mata Pelajaran</td>
                    <td>{formData.subject}</td>
                  </tr>
                  <tr>
                    <td>Kelas/Semester</td>
                    <td>{formData.grade} / {parseInt(formData.grade) % 2 === 0 ? 'Genap' : 'Ganjil'}</td>
                  </tr>
                  <tr>
                    <td>Durasi Pertemuan</td>
                    <td>{formData.duration} (Total: {formData.meetingCount} Pertemuan)</td>
                  </tr>

                  {/* Bagian 2: Identifikasi */}
                  <tr className="bg-gray-100">
                    <td colSpan={2} className="font-bold">2. IDENTIFIKASI</td>
                  </tr>
                  <tr>
                    <td>Siswa</td>
                    <td>{rpmResult.identifikasi.siswa}</td>
                  </tr>
                  <tr>
                    <td>Materi Pelajaran</td>
                    <td>{formData.material}</td>
                  </tr>
                  <tr>
                    <td>Capaian Dimensi Lulusan</td>
                    <td>{formData.dimensions.join(', ')}</td>
                  </tr>

                  {/* Bagian 3: Desain Pembelajaran */}
                  <tr className="bg-gray-100">
                    <td colSpan={2} className="font-bold">3. DESAIN PEMBELAJARAN</td>
                  </tr>
                  <tr>
                    <td>Capaian Pembelajaran (CP)</td>
                    <td>{formData.cp}</td>
                  </tr>
                  <tr>
                    <td>Lintas Disiplin Ilmu</td>
                    <td>{rpmResult.identifikasi.lintasDisiplin}</td>
                  </tr>
                  <tr>
                    <td>Tujuan Pembelajaran (TP)</td>
                    <td>{formData.tp}</td>
                  </tr>
                  <tr>
                    <td>Topik Pembelajaran</td>
                    <td>{rpmResult.identifikasi.topik}</td>
                  </tr>
                  <tr>
                    <td>Praktik Pedagogis</td>
                    <td>
                      <ul className="list-disc pl-5">
                        {formData.meetingConfigs.map((m, i) => (
                          <li key={i}>Pertemuan {i+1}: {m.practice}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                  <tr>
                    <td>Kemitraan Pembelajaran</td>
                    <td>{rpmResult.identifikasi.kemitraan}</td>
                  </tr>
                  <tr>
                    <td>Lingkungan Pembelajaran</td>
                    <td>{rpmResult.identifikasi.lingkungan}</td>
                  </tr>
                  <tr>
                    <td>Pemanfaatan Digital</td>
                    <td>{rpmResult.identifikasi.pemanfaatanDigital}</td>
                  </tr>

                  {/* Bagian 4: Pengalaman Belajar */}
                  <tr className="bg-gray-100">
                    <td colSpan={2} className="font-bold">4. PENGALAMAN BELAJAR</td>
                  </tr>
                  {rpmResult.pengalamanBelajar.pertemuan.map((meet, idx) => (
                    <React.Fragment key={idx}>
                      <tr>
                        <td className="bg-gray-50 italic">Pertemuan {idx + 1}</td>
                        <td className="bg-gray-50 font-semibold">{formData.meetingConfigs[idx].practice}</td>
                      </tr>
                      <tr>
                        <td>Memahami (Kegiatan Awal)</td>
                        <td>{meet.memahami}</td>
                      </tr>
                      <tr>
                        <td>Mengaplikasi (Kegiatan Inti)</td>
                        <td>{meet.mengaplikasi}</td>
                      </tr>
                      <tr>
                        <td>Refleksi (Kegiatan Penutup)</td>
                        <td>{meet.refleksi}</td>
                      </tr>
                    </React.Fragment>
                  ))}

                  {/* Bagian 5: Asesmen Pembelajaran */}
                  <tr className="bg-gray-100">
                    <td colSpan={2} className="font-bold">5. ASESMEN PEMBELAJARAN</td>
                  </tr>
                  <tr>
                    <td>Asesmen Awal (Diagnostik)</td>
                    <td>{rpmResult.asesmen.awal}</td>
                  </tr>
                  <tr>
                    <td>Asesmen Proses (Formatif)</td>
                    <td>{rpmResult.asesmen.proses}</td>
                  </tr>
                  <tr>
                    <td>Asesmen Akhir (Sumatif)</td>
                    <td>{rpmResult.asesmen.akhir}</td>
                  </tr>
                </tbody>
              </table>

              {/* Signature Section */}
              <div className="grid grid-cols-2 mt-20 gap-x-20">
                <div className="text-left space-y-24">
                  <div>
                    <p>Mengetahui,</p>
                    <p>Kepala Sekolah</p>
                  </div>
                  <div>
                    <p className="font-bold underline uppercase">{formData.principalName}</p>
                    <p>NIP. {formData.principalNip}</p>
                  </div>
                </div>
                <div className="text-right space-y-24">
                  <div>
                    <p>Cikarang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p>Guru Mata Pelajaran</p>
                  </div>
                  <div>
                    <p className="font-bold underline uppercase">{formData.teacherName}</p>
                    <p>NIP. {formData.teacherNip}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 text-center text-xs text-gray-500 no-print">
        Modifikasi oleh Iman Nugrah Setiady - SMKN 1 Cikarang Pusat
      </footer>
    </div>
  );
};

export default App;
