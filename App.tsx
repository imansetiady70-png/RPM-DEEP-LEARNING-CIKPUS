
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

const GRADES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

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
  const [isExporting, setIsExporting] = useState(false);
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
    const count = Math.min(Math.max(parseInt(e.target.value) || 1, 1), 10);
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
        if (outputRef.current) {
          outputRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 600);
    } catch (error) {
      console.error("Error generating RPM:", error);
      alert("Terjadi kesalahan saat membuat RPM. Silakan periksa koneksi internet Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    if (outputRef.current) {
      window.print();
    } else {
      alert("Silakan buat dokumen RPM terlebih dahulu sebelum mencetak.");
    }
  };

  const copyAndOpenGoogleDocs = async () => {
    if (!outputRef.current) return;
    
    setIsExporting(true);
    const docsTab = window.open("https://docs.new", "_blank");
    
    try {
      const contentClone = outputRef.current.cloneNode(true) as HTMLElement;
      contentClone.querySelectorAll('table').forEach(table => {
        (table as HTMLElement).style.border = '2px solid #1e3a8a';
        (table as HTMLElement).style.borderCollapse = 'collapse';
        (table as HTMLElement).style.width = '100%';
        table.setAttribute('border', '1');
      });
      contentClone.querySelectorAll('td, th').forEach(cell => {
        (cell as HTMLElement).style.border = '1px solid #1e3a8a';
        (cell as HTMLElement).style.padding = '8px';
        (cell as HTMLElement).style.color = '#000000';
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; background: white; padding: 20px;">
          ${contentClone.innerHTML}
        </body>
        </html>
      `;

      let success = false;
      try {
        const type = "text/html";
        const blob = new Blob([htmlContent], { type });
        const textBlob = new Blob([outputRef.current.innerText], { type: "text/plain" });
        const data = [new ClipboardItem({ 
          [type]: blob, 
          "text/plain": textBlob 
        })];
        await navigator.clipboard.write(data);
        success = true;
      } catch (e) {
        const range = document.createRange();
        range.selectNode(outputRef.current);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(range);
        success = document.execCommand('copy');
        window.getSelection()?.removeAllRanges();
      }

      if (success) {
        alert("✅ RPM berhasil disalin!\n\nSilakan klik pada tab Google Docs yang baru saja dibuka dan tekan Ctrl+V.");
        if (docsTab) docsTab.focus();
      } else {
        throw new Error("Copy failed");
      }
    } catch (err) {
      alert("⚠️ Gagal menyalin secara otomatis. Silakan blok tabel secara manual, klik kanan > salin, lalu tempel di Google Docs.");
    } finally {
      setIsExporting(false);
    }
  };

  const inputClass = "w-full rounded-xl border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-500 border p-3.5 transition-all text-sm font-medium outline-none shadow-sm";
  const textareaClass = "w-full rounded-xl border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-500 border p-4 focus:ring-2 transition-all text-sm font-medium outline-none shadow-sm";

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900">
      <header className="bg-white border-b sticky top-0 z-40 p-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img 
              src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjT1mJ0j5l6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j/s1600/logo-smkn1-cikarang-pusat.png" 
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
              alt="Logo" 
              className="h-10 w-auto object-contain"
            />
            <div>
              <h1 className="text-lg font-black text-blue-900 leading-none">Generator RPM v3.1</h1>
              <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-1">Sistem Perencanaan Pembelajaran</p>
            </div>
          </div>
          <div className="no-print">
             <span className="text-[10px] bg-indigo-600 text-white px-3 py-1.5 rounded-full font-black shadow-md">SOLO TAXONOMY READY</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-10">
        <section className="mb-12 no-print">
          <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 rounded-[2.5rem] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
            <div className="relative z-10 w-full">
              <h2 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tighter leading-none mx-auto font-bookman">
                RPM MUDAH, MURID PANDAI<br/>SERTA GURU SEJAHTRA
              </h2>
              <p className="text-blue-100 text-lg md:text-xl font-medium opacity-90 max-w-4xl leading-relaxed mx-auto font-bookman">
                Transformasi perencanaan pembelajaran berfokus pada kedalaman makna, menggunakan AI untuk merancang strategi terbaik bagi Murid masa depan.
              </p>
            </div>
            <i className="fas fa-heart absolute -right-16 -bottom-16 text-[18rem] text-white opacity-10 rotate-12"></i>
          </div>
        </section>

        <section className="bg-white rounded-[2.5rem] shadow-xl p-8 md:p-14 mb-14 border border-slate-200 no-print">
          <h2 className="text-2xl font-black mb-12 flex items-center gap-5 text-blue-900 border-b pb-6">
            <span className="bg-blue-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"><i className="fas fa-file-invoice text-base"></i></span>
            Menu Buat Program RPM
          </h2>
          
          <form onSubmit={handleGenerate} className="space-y-14">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest flex items-center gap-3">
                  <span className="w-2.5 h-2.5 bg-blue-600 rounded-full shadow-sm"></span> Administrasi Pengajaran
                </h3>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nama Satuan Pendidikan *</label>
                  <input required name="schoolName" value={formData.schoolName} onChange={handleInputChange} className={inputClass} placeholder="Misal: SMKN 1 Cikarang Pusat" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Kepala Sekolah *</label>
                    <input required name="principalName" value={formData.principalName} onChange={handleInputChange} className={inputClass} placeholder="Nama Lengkap" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">NIP Kepala Sekolah *</label>
                    <input required name="principalNip" value={formData.principalNip} onChange={handleInputChange} className={inputClass} placeholder="NIP/NIPPK" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Guru Pengampu *</label>
                    <input required name="teacherName" value={formData.teacherName} onChange={handleInputChange} className={inputClass} placeholder="Nama Lengkap" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">NIP Guru *</label>
                    <input required name="teacherNip" value={formData.teacherNip} onChange={handleInputChange} className={inputClass} placeholder="NIP/NIPPK" />
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest flex items-center gap-3">
                  <span className="w-2.5 h-2.5 bg-blue-600 rounded-full shadow-sm"></span> Konfigurasi Program
                </h3>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Jenjang *</label>
                    <select name="level" value={formData.level} onChange={handleLevelChange} className={inputClass}>
                      <option value="SD">SD</option>
                      <option value="SMP">SMP</option>
                      <option value="SMA">SMA</option>
                      <option value="SMK">SMK</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Kelas *</label>
                    <select required name="grade" value={formData.grade} onChange={handleInputChange} className={inputClass}>
                      {GRADES.map(g => (
                        <option key={g} value={g}>Kelas {g}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Semester *</label>
                    <select name="semester" value={formData.semester} onChange={handleInputChange} className={inputClass}>
                      <option value="Ganjil">Ganjil</option>
                      <option value="Genap">Genap</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Mata Pelajaran *</label>
                    <input required name="subject" value={formData.subject} onChange={handleInputChange} className={inputClass} placeholder="Contoh: Matematika" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Materi Utama *</label>
                  <input required name="material" value={formData.material} onChange={handleInputChange} className={inputClass} placeholder="Judul Bab / Pokok Bahasan" />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Jumlah Pertemuan *</label>
                    <input type="number" min="1" max="10" required name="meetingCount" value={formData.meetingCount} onChange={handleMeetingCountChange} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Durasi (JP) *</label>
                    <input required name="duration" value={formData.duration} onChange={handleInputChange} className={inputClass} placeholder="2 JP @45 Menit" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Capaian Pembelajaran (CP) *</label>
                <textarea required name="cp" value={formData.cp} onChange={handleInputChange} rows={5} className={textareaClass} placeholder="Salin deskripsi CP kurikulum untuk diproses oleh AI menjadi Tujuan Pembelajaran Taksonomi SOLO..." />
                <p className="text-[11px] text-blue-500 mt-3 font-semibold italic flex items-center gap-2">
                  <i className="fas fa-info-circle"></i>
                  AI akan menyusun Tujuan Pembelajaran (TP) secara otomatis berdasarkan input CP menggunakan standar Taksonomi SOLO.
                </p>
              </div>
            </div>

            <div className="bg-slate-100/50 p-10 rounded-[2.5rem] border border-slate-200 shadow-inner">
              <h3 className="text-sm font-black text-indigo-700 mb-8 uppercase tracking-widest flex items-center gap-3">
                <i className="fas fa-layer-group"></i> Strategi Pedagogis Per Sesi
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {formData.meetingConfigs.map((config, index) => (
                  <div key={index} className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm transition-hover hover:border-blue-300">
                    <label className="block text-[10px] font-black text-indigo-400 uppercase mb-3 tracking-wider">Pertemuan Ke-{index + 1}</label>
                    <select 
                      value={config.practice}
                      onChange={(e) => {
                        const newConfigs = [...formData.meetingConfigs];
                        newConfigs[index].practice = e.target.value as PedagogicalPractice;
                        setFormData(prev => ({ ...prev, meetingConfigs: newConfigs }));
                      }}
                      className="w-full text-sm font-bold rounded-xl border-slate-200 p-3 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all outline-none"
                    >
                      {PEDAGOGICAL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-6">Dimensi Karakter Lulusan *</label>
              <div className="flex flex-wrap gap-4">
                {GRADUATE_DIMENSIONS.map(dim => (
                  <button
                    key={dim}
                    type="button"
                    onClick={() => toggleDimension(dim)}
                    className={`px-8 py-4 rounded-2xl text-[11px] font-black border transition-all duration-300 ${
                      formData.dimensions.includes(dim)
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200 scale-105'
                        : 'bg-white border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-600'
                    }`}
                  >
                    {formData.dimensions.includes(dim) && <i className="fas fa-check-double mr-2"></i>}
                    {dim}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <button
                type="submit"
                disabled={isLoading || formData.dimensions.length === 0}
                className={`w-full py-7 rounded-[2rem] text-white font-black text-2xl flex items-center justify-center gap-5 shadow-2xl transition-all active:scale-[0.98] ${
                  isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-blue-300'
                }`}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner animate-spin"></i>
                    SEDANG MENYUSUN RPM...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sparkles"></i>
                    HASILKAN RPM SEKARANG
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {rpmResult && (
          <section className="animate-in fade-in slide-in-from-bottom-12 duration-1000 print-container">
            <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-blue-900/10 mb-20">
              <div className="bg-slate-900 text-white p-10 flex flex-col md:flex-row justify-between items-center gap-8 no-print">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/40">
                    <i className="fas fa-file-check text-2xl"></i>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-widest uppercase leading-none">DOKUMEN RPM BERHASIL DISUSUN</h2>
                    <p className="text-sm text-slate-400 font-bold mt-2 uppercase opacity-80">Gunakan tombol di samping untuk menyimpan atau mencetak</p>
                  </div>
                </div>
                <div className="flex gap-5">
                  <button 
                    type="button"
                    onClick={handlePrint} 
                    className="bg-slate-800 hover:bg-slate-700 text-white px-10 py-5 rounded-[1.5rem] text-sm font-black flex items-center gap-4 border border-slate-700 transition-all active:scale-95 shadow-lg"
                  >
                    <i className="fas fa-file-pdf"></i> CETAK PDF
                  </button>
                  <button 
                    type="button"
                    onClick={copyAndOpenGoogleDocs} 
                    disabled={isExporting}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white px-10 py-5 rounded-[1.5rem] text-sm font-black flex items-center gap-4 shadow-2xl shadow-blue-600/40 transition-all active:scale-95"
                  >
                    {isExporting ? (
                      <><i className="fas fa-sync animate-spin"></i> MENYALIN...</>
                    ) : (
                      <><i className="fab fa-google-drive"></i> EKSPOR KE DOCS</>
                    )}
                  </button>
                </div>
              </div>

              <div ref={outputRef} id="printable-area" className="p-12 md:p-24 bg-white border-t border-slate-100">
                <div className="max-w-[850px] mx-auto text-black">
                  <div className="text-center mb-16 border-b-8 border-double border-blue-900 pb-10">
                    <h1 className="text-3xl font-black uppercase mb-3 text-blue-900">Perencanaan Pembelajaran Mendalam (RPM)</h1>
                    <p className="font-extrabold text-2xl uppercase tracking-[0.25em] text-blue-800 leading-tight">{formData.schoolName}</p>
                  </div>

                  <table className="w-full table-rpm border-collapse border-2 border-blue-900 text-[15px] leading-relaxed mb-10 shadow-sm">
                    <tbody>
                      <tr>
                        <td colSpan={2} className="bg-blue-50 font-black border-2 border-blue-900 px-6 py-5 uppercase tracking-[0.2em] text-blue-900">1. IDENTITAS PROGRAM</td>
                      </tr>
                      <tr>
                        <td className="w-[35%] border-2 border-blue-900 p-5 font-bold text-blue-900">Satuan Pendidikan</td>
                        <td className="border-2 border-blue-900 p-5 font-medium">{formData.schoolName}</td>
                      </tr>
                      <tr>
                        <td className="border-2 border-blue-900 p-5 font-bold text-blue-900">Mata Pelajaran</td>
                        <td className="border-2 border-blue-900 p-5 font-medium">{formData.subject}</td>
                      </tr>
                      <tr>
                        <td className="border-2 border-blue-900 p-5 font-bold text-blue-900">Kelas / Semester</td>
                        <td className="border-2 border-blue-900 p-5 font-medium">Kelas {formData.grade} / {formData.semester}</td>
                      </tr>
                      <tr>
                        <td className="border-2 border-blue-900 p-5 font-bold text-blue-900">Pertemuan / Durasi</td>
                        <td className="border-2 border-blue-900 p-5 font-medium">{formData.meetingCount} Sesi ({formData.duration})</td>
                      </tr>

                      <tr>
                        <td colSpan={2} className="bg-blue-50 font-black border-2 border-blue-900 px-6 py-5 uppercase tracking-[0.2em] text-blue-900">2. IDENTIFIKASI MURID & MATERI</td>
                      </tr>
                      
                      <tr className="bg-slate-50/30">
                        <td rowSpan={4} className="border-2 border-blue-900 p-5 font-black text-blue-900 align-middle">Profil Identifikasi Murid</td>
                        <td className="border-2 border-blue-900 p-5"><span className="font-bold text-blue-800 underline decoration-blue-200">Profil Umum:</span> {rpmResult.identifikasi.murid.profilUmum}</td>
                      </tr>
                      <tr className="bg-slate-50/30">
                        <td className="border-2 border-blue-900 p-5"><span className="font-bold text-blue-800 underline decoration-blue-200">Kesiapan Belajar:</span> {rpmResult.identifikasi.murid.kesiapanBelajar}</td>
                      </tr>
                      <tr className="bg-slate-50/30">
                        <td className="border-2 border-blue-900 p-5"><span className="font-bold text-blue-800 underline decoration-blue-200">Minat:</span> {rpmResult.identifikasi.murid.minat}</td>
                      </tr>
                      <tr className="bg-slate-50/30">
                        <td className="border-2 border-blue-900 p-5"><span className="font-bold text-blue-800 underline decoration-blue-200">Gaya Belajar:</span> {rpmResult.identifikasi.murid.gayaBelajar}</td>
                      </tr>

                      <tr>
                        <td rowSpan={4} className="border-2 border-blue-900 p-5 font-black text-blue-900 align-middle">Identifikasi Materi Pelajaran</td>
                        <td className="border-2 border-blue-900 p-5"><span className="font-bold text-blue-800 underline decoration-blue-200">Jenis Pengetahuan:</span> {rpmResult.identifikasi.materi.jenisPengetahuan}</td>
                      </tr>
                      <tr>
                        <td className="border-2 border-blue-900 p-5"><span className="font-bold text-blue-800 underline decoration-blue-200">Relevansi:</span> {rpmResult.identifikasi.materi.relevansi}</td>
                      </tr>
                      <tr>
                        <td className="border-2 border-blue-900 p-5"><span className="font-bold text-blue-800 underline decoration-blue-200">Tingkat Kesulitan:</span> {rpmResult.identifikasi.materi.tingkatKesulitan}</td>
                      </tr>
                      <tr>
                        <td className="border-2 border-blue-900 p-5"><span className="font-bold text-blue-800 underline decoration-blue-200">Integrasi Nilai:</span> {rpmResult.identifikasi.materi.integrasiNilai}</td>
                      </tr>

                      <tr>
                        <td className="border-2 border-blue-900 p-5 font-black text-blue-900">Dimensi Profil Lulusan</td>
                        <td className="border-2 border-blue-900 p-5 font-bold text-blue-800 bg-yellow-50/50 tracking-tight">{formData.dimensions.join(' • ')}</td>
                      </tr>

                      <tr>
                        <td colSpan={2} className="bg-blue-50 font-black border-2 border-blue-900 px-6 py-5 uppercase tracking-[0.2em] text-blue-900">3. DESAIN PEMBELAJARAN MENDALAM</td>
                      </tr>
                      <tr>
                        <td className="border-2 border-blue-900 p-5 font-bold text-blue-900">Capaian Pembelajaran (CP)</td>
                        <td className="border-2 border-blue-900 p-5 whitespace-pre-wrap">{formData.cp}</td>
                      </tr>
                      <tr>
                        <td className="border-2 border-blue-900 p-5 font-bold text-blue-900">Tujuan Pembelajaran (SOLO Taxonomy)</td>
                        <td className="border-2 border-blue-900 p-5 whitespace-pre-wrap font-medium text-blue-800">{rpmResult.identifikasi.tujuanPembelajaranSolo}</td>
                      </tr>
                      <tr>
                        <td className="border-2 border-blue-900 p-5 font-bold text-blue-900">Pemanfaatan Digital</td>
                        <td className="border-2 border-blue-900 p-5 font-bold text-indigo-700">{rpmResult.identifikasi.pemanfaatanDigital}</td>
                      </tr>
                      <tr>
                        <td className="border-2 border-blue-900 p-5 font-bold text-blue-900">Kemitraan & Lingkungan</td>
                        <td className="border-2 border-blue-900 p-5 font-medium">
                          <p><span className="font-bold">Kemitraan:</span> {rpmResult.identifikasi.kemitraan}</p>
                          <p className="mt-3"><span className="font-bold">Lingkungan Belajar:</span> {rpmResult.identifikasi.lingkungan}</p>
                        </td>
                      </tr>

                      <tr>
                        <td colSpan={2} className="bg-blue-50 font-black border-2 border-blue-900 px-6 py-5 uppercase tracking-[0.2em] text-blue-900">4. PENGALAMAN BELAJAR (DEEP LEARNING)</td>
                      </tr>
                      {rpmResult.pengalamanBelajar.pertemuan.map((meet, idx) => (
                        <React.Fragment key={idx}>
                          <tr className="bg-slate-100">
                            <td className="border-2 border-blue-900 p-5 font-black text-center text-blue-900 uppercase tracking-tighter">SESI KE-{idx + 1}</td>
                            <td className="border-2 border-blue-900 p-5 font-black uppercase text-blue-800">{formData.meetingConfigs[idx].practice}</td>
                          </tr>
                          <tr>
                            <td className="border-2 border-blue-900 p-5 font-bold text-blue-900 italic">Memahami (Kegiatan Awal)</td>
                            <td className="border-2 border-blue-900 p-5 font-medium">{meet.memahami}</td>
                          </tr>
                          <tr>
                            <td className="border-2 border-blue-900 p-5 font-bold text-blue-900 italic">Mengaplikasi (Kegiatan Inti)</td>
                            <td className="border-2 border-blue-900 p-5 font-medium">{meet.mengaplikasi}</td>
                          </tr>
                          <tr>
                            <td className="border-2 border-blue-900 p-5 font-bold text-blue-900 italic">Refleksi (Kegiatan Penutup)</td>
                            <td className="border-2 border-blue-900 p-5 font-medium">{meet.refleksi}</td>
                          </tr>
                        </React.Fragment>
                      ))}

                      <tr>
                        <td colSpan={2} className="bg-blue-50 font-black border-2 border-blue-900 px-6 py-5 uppercase tracking-[0.2em] text-blue-900">5. ASESMEN PEMBELAJARAN</td>
                      </tr>
                      <tr>
                        <td className="border-2 border-blue-900 p-5 font-bold text-blue-900">Diagnostik (Asesmen Awal)</td>
                        <td className="border-2 border-blue-900 p-5 font-medium">{rpmResult.asesmen.awal}</td>
                      </tr>
                      <tr>
                        <td className="border-2 border-blue-900 p-5 font-bold text-blue-900">Formatif (Asesmen Proses)</td>
                        <td className="border-2 border-blue-900 p-5 font-medium">{rpmResult.asesmen.proses}</td>
                      </tr>
                      <tr>
                        <td className="border-2 border-blue-900 p-5 font-bold text-blue-900">Sumatif (Asesmen Akhir)</td>
                        <td className="border-2 border-blue-900 p-5 font-medium">{rpmResult.asesmen.akhir}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="mt-24 grid grid-cols-2 text-center text-[15px]">
                    <div className="space-y-32">
                      <div>
                        <p>Mengetahui,</p>
                        <p className="font-bold">Kepala {formData.schoolName}</p>
                      </div>
                      <div>
                        <p className="font-bold underline uppercase decoration-1 underline-offset-4">{formData.principalName}</p>
                        <p>NIP. {formData.principalNip}</p>
                      </div>
                    </div>
                    <div className="space-y-32">
                      <div>
                        <p>Cikarang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p className="font-bold">Guru Mata Pelajaran</p>
                      </div>
                      <div>
                        <p className="font-bold underline uppercase decoration-1 underline-offset-4">{formData.teacherName}</p>
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

      <footer className="bg-white border-t p-12 text-center text-slate-500 no-print">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm font-bold text-slate-800 uppercase tracking-widest">
            Modifikasi By Iman Nugraha Setiady - SMKN 1 Cikarang Pusat
          </p>
          <div className="mt-6 flex justify-center gap-10 text-slate-300">
            <i className="fas fa-microchip text-xl hover:text-blue-500 transition-colors"></i>
            <i className="fas fa-brain text-xl hover:text-indigo-500 transition-colors"></i>
            <i className="fas fa-graduation-cap text-xl hover:text-blue-800 transition-colors"></i>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
