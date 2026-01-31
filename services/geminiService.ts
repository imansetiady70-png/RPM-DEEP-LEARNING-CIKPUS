
import { GoogleGenAI, Type } from "@google/genai";
import { FormData, GeneratedRPM } from "../types";

export const generateRPMContent = async (formData: FormData): Promise<GeneratedRPM> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Bertindaklah sebagai konsultan pendidikan ahli Kurikulum Merdeka di Indonesia. 
    Buatkan konten Perencanaan Pembelajaran Mendalam (RPM) berdasarkan data berikut:
    
    - Satuan Pendidikan: ${formData.schoolName}
    - Jenjang: ${formData.level} - Kelas: ${formData.grade}
    - Mata Pelajaran: ${formData.subject}
    - Materi: ${formData.material}
    - Capaian Pembelajaran (CP): ${formData.cp}
    - Tujuan Pembelajaran (TP): ${formData.tp}
    - Dimensi Lulusan: ${formData.dimensions.join(', ')}
    - Jumlah Pertemuan: ${formData.meetingCount}
    - Praktik Pedagogis per Pertemuan: ${formData.meetingConfigs.map((m, i) => `Pertemuan ${i+1}: ${m.practice}`).join('; ')}

    Persyaratan Khusus:
    1. Identifikasi Siswa: Deskripsikan profil siswa yang relevan dengan jenjang dan materi secara otomatis.
    2. Lintas Disiplin Ilmu: Tentukan mata pelajaran lain yang berkaitan.
    3. Kemitraan: Tentukan pihak luar atau sumber belajar yang sesuai.
    4. Lingkungan: Tentukan pengaturan kelas atau lokasi belajar.
    5. Digital: Berikan referensi tools online yang konkret (seperti Canva, Quizizz, Padlet, dll).
    6. Pengalaman Belajar: Harus sesuai dengan sintaks praktik pedagogis yang dipilih untuk setiap pertemuan.
       - Memahami: Kegiatan awal (Berkesadaran, Bermakna, Menggembirakan).
       - Mengaplikasi: Kegiatan inti mengikuti sintaks model pembelajaran (Berkesadaran, Bermakna, Menggembirakan).
       - Refleksi: Kegiatan penutup (Berkesadaran, Bermakna, Menggembirakan).
    7. Asesmen: Detailkan asesmen awal, proses, dan akhir secara otomatis.

    Berikan output dalam format JSON murni sesuai schema.
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
              siswa: { type: Type.STRING },
              lintasDisiplin: { type: Type.STRING },
              kemitraan: { type: Type.STRING },
              lingkungan: { type: Type.STRING },
              pemanfaatanDigital: { type: Type.STRING },
              topik: { type: Type.STRING },
            },
            required: ["siswa", "lintasDisiplin", "kemitraan", "lingkungan", "pemanfaatanDigital", "topik"]
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
