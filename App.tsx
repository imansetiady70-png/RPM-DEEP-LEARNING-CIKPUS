
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
    semester: 'Ganjil',
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
    setRpmResult(null);
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
      const content = outputRef.current.innerHTML;
      const type = "text/html";
      const blob = new Blob([content], { type });
      const data = [new ClipboardItem({ [type]: blob })];
      
      await navigator.clipboard.write(data);
      alert("Berhasil menyalin konten! Silakan tempel (Ctrl+V) di Google Dokumen yang akan terbuka.");
      window.open("https://docs.new", "_blank");
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Gagal menyalin otomatis. Harap pilih dan salin manual tabelnya.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-20 p-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-200">
              <i className="fas fa-layer-group text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-gray-900">Generator RPM</h1>
              <p className="text-xs text-gray-500 font-medium">Perencanaan Pembelajaran Mendalam</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8">
        {/* Intro */}
        <section className="mb-8 no-print">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl p-8 text-white shadow-xl overflow-hidden relative">
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2">Buat Modul RPM dalam Sekejap</h2>
              <p className="text-indigo-100 max-w-2xl">
                Alat bantu cerdas bertenaga AI untuk membantu Bapak/Ibu Guru menyusun perencanaan pembelajaran mendalam yang terstruktur, bermakna, dan sesuai standar Kurikulum Merdeka.
              </p>
            </div>
            <i className="fas fa-brain absolute right-[-20px] bottom-[-20px] text-9xl text-white opacity-10 rotate-12"></i>
          </div>
        </section>

        {/* Form Section */}
        <section className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-10 border border-gray-200 no-print">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-800">
            <i className="fas fa-keyboard text-indigo-500"></i> Informasi Pembelajaran
          </h2>
          
          <form onSubmit={handleGenerate} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Identitas Satuan Pendidikan */}
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider">Identitas & Legalitas</h3>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Satuan Pendidikan *</label>
                  <input required name="schoolName" value={formData.schoolName} onChange={handleInputChange} className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 border p-2.5 transition-all" placeholder="Misal: SMP Negeri 1 Jakarta" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Kepala Sekolah *</label>
                    <input required name="principalName" value={formData.principalName} onChange={handleInputChange} className="w-full rounded-lg border-gray-300 border p-2.5" placeholder="Nama Lengkap" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">NIP Kepala Sekolah *</label>
                    <input required name="principalNip" value={formData.principalNip} onChange={handleInputChange} className="w-full rounded-lg border-gray-300 border p-2.5" placeholder="NIP/NIPPK" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Guru Pengampu *</label>
                    <input required name="teacherName" value={formData.teacherName} onChange={handleInputChange} className="w-full rounded-lg border-gray-300 border p-2.5" placeholder="Nama Lengkap" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">NIP Guru *</label>
                    <input required name="teacherNip" value={formData.teacherNip} onChange={handleInputChange} className="w-full rounded-lg border-gray-300 border p-2.5" placeholder="NIP/NIPPK" />
                  </div>
                </div>
              </div>

              {/* Kurikulum */}
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider">Detail Materi</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Jenjang *</label>
                    <select name="level" value={formData.level} onChange={handleLevelChange} className="w-full rounded-lg border border-gray-300 p-2.5">
                      <option value="SD">SD</option>
                      <option value="SMP">SMP</option>
                      <option value="SMA">SMA</option>
                      <option value="SMK">SMK</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Kelas *</label>
                    <input required name="grade" value={formData.grade} onChange={handleInputChange} className="w-full rounded-lg border border-gray-300 p-2.5" placeholder="Misal: 10 TKJ" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Semester *</label>
                    <select name="semester" value={formData.semester} onChange={handleInputChange} className="w-full rounded-lg border border-gray-300 p-2.5">
                      <option value="Ganjil">Ganjil</option>
                      <option value="Genap">Genap</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Durasi per Sesi *</label>
                    <input required name="duration" value={formData.duration} onChange={handleInputChange} className="w-full rounded-lg border border-gray-300 p-2.5" placeholder="2 JP @45 Menit" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Mata Pelajaran *</label>
                  <input required name="subject" value={formData.subject} onChange={handleInputChange} className="w-full rounded-lg border border-gray-300 p-2.5" placeholder="Matematika / Informatika / dll" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Materi Utama *</label>
                  <input required name="material" value={formData.material} onChange={handleInputChange} className="w-full rounded-lg border border-gray-300 p-2.5" placeholder="Judul Materi / Bab" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Jumlah Pertemuan *</label>
                  <input type="number" min="1" max="10" required name="meetingCount" value={formData.meetingCount} onChange={handleMeetingCountChange} className="w-full rounded-lg border border-gray-300 p-2.5" />
                </div>
              </div>
            </div>

            {/* Academic Content Full Width */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Capaian Pembelajaran (CP) *</label>
                <textarea required name="cp" value={formData.cp} onChange={handleInputChange} rows={3} className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all" placeholder="Salin CP dari kurikulum..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tujuan Pembelajaran (TP) *</label>
                <textarea required name="tp" value={formData.tp} onChange={handleInputChange} rows={3} className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all" placeholder="Tentukan poin-poin TP yang ingin dicapai..." />
              </div>
            </div>

            {/* Pedagogical Design */}
            <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
              <h3 className="text-sm font-bold text-indigo-700 mb-4 uppercase tracking-wider"><i className="fas fa-project-diagram mr-2"></i> Strategi Pengajaran per Pertemuan</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {formData.meetingConfigs.map((config, index) => (
                  <div key={index} className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                    <label className="block text-[10px] font-black text-indigo-400 uppercase mb-1">Sesi Ke-{index + 1}</label>
                    <select 
                      value={config.practice}
                      onChange={(e) => {
                        const newConfigs = [...formData.meetingConfigs];
                        newConfigs[index].practice = e.target.value as PedagogicalPractice;
                        setFormData(prev => ({ ...prev, meetingConfigs: newConfigs }));
                      }}
                      className="w-full text-sm font-medium rounded-lg border-gray-300 p-2 bg-gray-50 focus:bg-white transition-all"
                    >
                      {PEDAGOGICAL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Dimensions */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Dimensi Profil Pelajar *</label>
              <div className="flex flex-wrap gap-2">
                {GRADUATE_DIMENSIONS.map(dim => (
                  <button
                    key={dim}
                    type="button"
                    onClick={() => toggleDimension(dim)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                      formData.dimensions.includes(dim)
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md scale-105'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50'
                    }`}
                  >
                    {formData.dimensions.includes(dim) && <i className="fas fa-check-circle mr-2"></i>}
                    {dim}
                  </button>
                ))}
              </div>
              {formData.dimensions.length === 0 && <p className="text-rose-500 text-xs mt-2 font-medium"><i className="fas fa-exclamation-triangle mr-1"></i> Pilih minimal satu dimensi kelulusan.</p>}
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading || formData.dimensions.length === 0}
                className={`w-full py-4 rounded-2xl text-white font-black text-xl flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-[0.98] ${
                  isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-br from-indigo-600 to-blue-600 hover:shadow-indigo-200'
                }`}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner animate-spin"></i>
                    Memproses Data...
                  </>
                ) : (
                  <>
                    <i className="fas fa-wand-magic-sparkles"></i>
                    Buat Perencanaan RPM
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Output Section */}
        {rpmResult && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 mb-10">
              <div className="bg-gray-900 text-white p-5 flex flex-col md:flex-row justify-between items-center gap-4 no-print border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <span className="bg-green-500 w-3 h-3 rounded-full animate-pulse"></span>
                  <h2 className="text-lg font-bold tracking-wide">DOKUMEN RPM BERHASIL DISUSUN</h2>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => window.print()}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
                  >
                    <i className="fas fa-print"></i>
                    Cetak PDF
                  </button>
                  <button 
                    onClick={copyAndOpenGoogleDocs}
                    className="bg-indigo-500 hover:bg-indigo-400 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
                  >
                    <i className="fab fa-google-drive"></i>
                    Ekspor ke Docs
                  </button>
                </div>
              </div>

              <div ref={outputRef} className="p-10 md:p-16 bg-white overflow-x-auto">
                <div className="max-w-[800px] mx-auto">
                  <div className="text-center mb-10 border-b-2 border-double border-black pb-4">
                    <h1 className="text-2xl font-bold uppercase mb-1">Perencanaan Pembelajaran Mendalam (RPM)</h1>
                    <p className="font-bold text-xl uppercase tracking-widest">{formData.schoolName}</p>
                  </div>

                  <table className="w-full table-rpm border-collapse border border-black text-[13px] leading-relaxed">
                    <tbody>
                      {/* IDENTITAS */}
                      <tr>
                        <td colSpan={2} className="bg-gray-100 font-bold border border-black px-4 py-2 uppercase tracking-tight">1. IDENTITAS</td>
                      </tr>
                      <tr>
                        <td className="w-[30%] border border-black p-3 font-semibold">Nama Satuan Pendidikan</td>
                        <td className="border border-black p-3">{formData.schoolName}</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-3 font-semibold">Mata Pelajaran</td>
                        <td className="border border-black p-3">{formData.subject}</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-3 font-semibold">Kelas / Semester</td>
                        <td className="border border-black p-3">{formData.grade} / {formData.semester}</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-3 font-semibold">Durasi / Pertemuan</td>
                        <td className="border border-black p-3 font-medium">{formData.duration} ({formData.meetingCount} Pertemuan)</td>
                      </tr>

                      {/* IDENTIFIKASI */}
                      <tr>
                        <td colSpan={2} className="bg-gray-100 font-bold border border-black px-4 py-2 uppercase tracking-tight">2. IDENTIFIKASI</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-3 font-semibold">Siswa</td>
                        <td className="border border-black p-3">{rpmResult.identifikasi.siswa}</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-3 font-semibold">Materi Pelajaran</td>
                        <td className="border border-black p-3">{formData.material}</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-3 font-semibold">Capaian Dimensi Lulusan</td>
                        <td className="border border-black p-3">{formData.dimensions.join(', ')}</td>
                      </tr>

                      {/* DESAIN PEMBELAJARAN */}
                      <tr>
                        <td colSpan={2} className="bg-gray-100 font-bold border border-black px-4 py-2 uppercase tracking-tight">3. DESAIN PEMBELAJARAN</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-3 font-semibold">Capaian Pembelajaran (CP)</td>
                        <td className="border border-black p-3 whitespace-pre-wrap">{formData.cp}</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-3 font-semibold">Lintas Disiplin Ilmu</td>
                        <td className="border border-black p-3">{rpmResult.identifikasi.lintasDisiplin}</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-3 font-semibold">Tujuan Pembelajaran (TP)</td>
                        <td className="border border-black p-3 whitespace-pre-wrap">{formData.tp}</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-3 font-semibold">Topik Pembelajaran</td>
                        <td className="border border-black p-3">{rpmResult.identifikasi.topik}</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-3 font-semibold">Praktik Pedagogis</td>
                        <td className="border border-black p-3">
                          <ol className="list-decimal pl-5">
                            {formData.meetingConfigs.map((m, i) => (
                              <li key={i} className="mb-1"><span className="font-bold">Pertemuan {i+1}:</span> {m.practice}</li>
                            ))}
                          </ol>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black p-3 font-semibold">Kemitraan Pembelajaran</td>
                        <td className="border border-black p-3">{rpmResult.identifikasi.kemitraan}</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-3 font-semibold">Lingkungan Pembelajaran</td>
                        <td className="border border-black p-3">{rpmResult.identifikasi.lingkungan}</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-3 font-semibold">Pemanfaatan Teknologi Digital</td>
                        <td className="border border-black p-3">{rpmResult.identifikasi.pemanfaatanDigital}</td>
                      </tr>

                      {/* PENGALAMAN BELAJAR */}
                      <tr>
                        <td colSpan={2} className="bg-gray-100 font-bold border border-black px-4 py-2 uppercase tracking-tight">4. PENGALAMAN BELAJAR</td>
                      </tr>
                      {rpmResult.pengalamanBelajar.pertemuan.map((meet, idx) => (
                        <React.Fragment key={idx}>
                          <tr className="bg-indigo-50/30">
                            <td className="border border-black p-2 font-bold italic text-center">Pertemuan {idx + 1}</td>
                            <td className="border border-black p-2 font-bold uppercase text-indigo-900">{formData.meetingConfigs[idx].practice}</td>
                          </tr>
                          <tr>
                            <td className="border border-black p-3 font-semibold italic">Memahami (Kegiatan Awal)</td>
                            <td className="border border-black p-3">{meet.memahami}</td>
                          </tr>
                          <tr>
                            <td className="border border-black p-3 font-semibold italic">Mengaplikasi (Kegiatan Inti)</td>
                            <td className="border border-black p-3">{meet.mengaplikasi}</td>
                          </tr>
                          <tr>
                            <td className="border border-black p-3 font-semibold italic">Refleksi (Kegiatan Penutup)</td>
                            <td className="border border-black p-3">{meet.refleksi}</td>
                          </tr>
                        </React.Fragment>
                      ))}

                      {/* ASESMEN */}
                      <tr>
                        <td colSpan={2} className="bg-gray-100 font-bold border border-black px-4 py-2 uppercase tracking-tight">5. ASESMEN PEMBELAJARAN</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-3 font-semibold">Asesmen Awal (Diagnostik)</td>
                        <td className="border border-black p-3">{rpmResult.asesmen.awal}</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-3 font-semibold">Asesmen Proses (Formatif)</td>
                        <td className="border border-black p-3">{rpmResult.asesmen.proses}</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-3 font-semibold">Asesmen Akhir (Sumatif)</td>
                        <td className="border border-black p-3">{rpmResult.asesmen.akhir}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="mt-20 grid grid-cols-2 text-center text-sm">
                    <div className="space-y-24">
                      <div>
                        <p>Mengetahui,</p>
                        <p className="font-bold">Kepala {formData.schoolName}</p>
                      </div>
                      <div>
                        <p className="font-bold underline uppercase">{formData.principalName}</p>
                        <p>NIP. {formData.principalNip}</p>
                      </div>
                    </div>
                    <div className="space-y-24">
                      <div>
                        <p>Cikarang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p className="font-bold">Guru Mata Pelajaran</p>
                      </div>
                      <div>
                        <p className="font-bold underline uppercase">{formData.teacherName}</p>
                        <p>NIP. {formData.teacherNip}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="bg-white border-t p-8 text-center text-gray-400 no-print">
        <p className="text-sm">© {new Date().getFullYear()} Generator RPM Cerdas</p>
        <p className="text-xs mt-1">Dibuat untuk membantu kemajuan pendidikan Indonesia</p>
      </footer>
    </div>
  );
};

export default App;
