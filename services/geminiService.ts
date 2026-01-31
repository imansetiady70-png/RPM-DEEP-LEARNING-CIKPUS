
import { GoogleGenAI, Type } from "@google/genai";
import { FormData, GeneratedRPM } from "../types";

export const generateRPMContent = async (formData: FormData): Promise<GeneratedRPM> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Bertindaklah sebagai pakar kurikulum "Deep Learning" (Pembelajaran Mendalam) Indonesia. 
    Buatkan konten Perencanaan Pembelajaran Mendalam (RPM) berdasarkan data berikut.
    
    ATURAN BAHASA MUTLAK: 
    - Gunakan istilah "Murid" untuk merujuk pada subjek didik.
    - DILARANG KERAS menggunakan istilah "Siswa" atau "Peserta Didik".
    - Ubah semua kata "Siswa" atau "Peserta Didik" yang diinput user menjadi "Murid".
    
    DATA INPUT:
    - Satuan Pendidikan: ${formData.schoolName}
    - Jenjang: ${formData.level} - Kelas: ${formData.grade}
    - Mata Pelajaran: ${formData.subject}
    - Materi Utama: ${formData.material}
    - Capaian Pembelajaran (CP): ${formData.cp}
    - Dimensi Profil Lulusan: ${formData.dimensions.join(', ')}
    - Praktik Pedagogis: ${formData.meetingConfigs.map((m, i) => `Sesi ${i+1}: ${m.practice}`).join('; ')}

    INSTRUKSI TUJUAN PEMBELAJARAN (TP):
    - Hasilkan Tujuan Pembelajaran (TP) yang diturunkan dari CP di atas menggunakan **Taksonomi SOLO** (Structure of Observed Learning Outcome).
    - Pastikan TP mencakup level Relational (menghubungkan konsep) dan Extended Abstract (generalisasi ke situasi baru) untuk mendukung Pembelajaran Mendalam.
    - Cantumkan kode level SOLO di setiap poin TP (misal: [Relational], [Extended Abstract]).

    STRUKTUR OUTPUT (IDENTIFIKASI):
    1. Identifikasi Murid: Deskripsi Profil Umum, Kesiapan Belajar, Minat, dan Gaya Belajar spesifik untuk Murid ${formData.level} kelas ${formData.grade}.
    2. Identifikasi Materi: Deskripsi Jenis Pengetahuan, Relevansi, Tingkat Kesulitan, dan Integrasi Nilai materi "${formData.material}".
    3. Lintas Disiplin Ilmu: Mata pelajaran kolaboratif.
    4. Kemitraan & Lingkungan: Pihak luar dan pengaturan ruang.
    5. Pemanfaatan Digital: Tools spesifik (Canva, Quizizz, dll).

    STRUKTUR OUTPUT (PENGALAMAN BELAJAR):
    - Komponen: Memahami (Awal), Mengaplikasi (Inti), Refleksi (Penutup).
    - Fokus pada "Deep Learning": Berkesadaran, Bermakna, Menggembirakan.

    Hasilkan output dalam format JSON sesuai schema.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          identifikasi: {
            type: Type.OBJECT,
            properties: {
              murid: {
                type: Type.OBJECT,
                properties: {
                  profilUmum: { type: Type.STRING },
                  kesiapanBelajar: { type: Type.STRING },
                  minat: { type: Type.STRING },
                  gayaBelajar: { type: Type.STRING },
                },
                required: ["profilUmum", "kesiapanBelajar", "minat", "gayaBelajar"]
              },
              materi: {
                type: Type.OBJECT,
                properties: {
                  jenisPengetahuan: { type: Type.STRING },
                  relevansi: { type: Type.STRING },
                  tingkatKesulitan: { type: Type.STRING },
                  integrasiNilai: { type: Type.STRING },
                },
                required: ["jenisPengetahuan", "relevansi", "tingkatKesulitan", "integrasiNilai"]
              },
              lintasDisiplin: { type: Type.STRING },
              kemitraan: { type: Type.STRING },
              lingkungan: { type: Type.STRING },
              pemanfaatanDigital: { type: Type.STRING },
              topik: { type: Type.STRING },
              tujuanPembelajaranSolo: { type: Type.STRING, description: "TP berdasarkan Taksonomi SOLO" }
            },
            required: ["murid", "materi", "lintasDisiplin", "kemitraan", "lingkungan", "pemanfaatanDigital", "topik", "tujuanPembelajaranSolo"]
          },
          pengalamanBelajar: {
            type: Type.OBJECT,
            properties: {
              pertemuan: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    memahami: { type: Type.STRING },
                    mengaplikasi: { type: Type.STRING },
                    refleksi: { type: Type.STRING }
                  },
                  required: ["memahami", "mengaplikasi", "refleksi"]
                }
              }
            },
            required: ["pertemuan"]
          },
          asesmen: {
            type: Type.OBJECT,
            properties: {
              awal: { type: Type.STRING },
              proses: { type: Type.STRING },
              akhir: { type: Type.STRING }
            },
            required: ["awal", "proses", "akhir"]
          }
        },
        required: ["identifikasi", "pengalamanBelajar", "asesmen"]
      }
    }
  });

  return JSON.parse(response.text || '{}') as GeneratedRPM;
};
