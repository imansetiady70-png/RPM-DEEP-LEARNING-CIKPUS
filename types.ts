
export type EducationLevel = 'SD' | 'SMP' | 'SMA' | 'SMK';

export type PedagogicalPractice = 
  | 'Inkuiri-Discovery Learning' 
  | 'PjBL' 
  | 'Problem Based Learning' 
  | 'Game Based Learning' 
  | 'Station Learning';

export type GraduateDimension = 
  | 'Keimanan & Ketakwaan'
  | 'Kewargaan'
  | 'Penalaran Kritis'
  | 'Kreativitas'
  | 'Kolaborasi'
  | 'Kemandirian'
  | 'Kesehatan'
  | 'Komunikasi';

export interface MeetingConfig {
  practice: PedagogicalPractice;
}

export interface FormData {
  schoolName: string;
  teacherName: string;
  teacherNip: string;
  principalName: string;
  principalNip: string;
  level: EducationLevel;
  grade: string;
  semester: 'Ganjil' | 'Genap';
  subject: string;
  cp: string;
  tp: string;
  material: string;
  meetingCount: number;
  duration: string;
  meetingConfigs: MeetingConfig[];
  dimensions: GraduateDimension[];
}

export interface GeneratedRPM {
  identifikasi: {
    murid: {
      profilUmum: string;
      kesiapanBelajar: string;
      minat: string;
      gayaBelajar: string;
    };
    materi: {
      jenisPengetahuan: string;
      relevansi: string;
      tingkatKesulitan: string;
      integrasiNilai: string;
    };
    lintasDisiplin: string;
    kemitraan: string;
    lingkungan: string;
    pemanfaatanDigital: string;
    topik: string;
    // Added tujuanPembelajaranSolo property to fix the property access error in App.tsx
    tujuanPembelajaranSolo: string;
  };
  pengalamanBelajar: {
    pertemuan: Array<{
      memahami: string;
      mengaplikasi: string;
      refleksi: string;
    }>;
  };
  asesmen: {
    awal: string;
    proses: string;
    akhir: string;
  };
}
