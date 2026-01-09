
export interface ExamResult {
  no: number;
  name: string;
  date: string;
  totalNet: number;
  // Optional subject breakdowns for history
  turkish?: number;
  math?: number;
  science?: number;
  history?: number;
  religion?: number;
  english?: number;
}

export interface Student {
  rank: number;
  no: number;
  name: string;
  examCount: number;
  turkish: number;
  history: number;
  religion: number;
  english: number;
  math: number;
  science: number;
  
  // Explicit success percentages from report (optional)
  turkishPercent?: number;
  historyPercent?: number;
  religionPercent?: number;
  englishPercent?: number;
  mathPercent?: number;
  sciencePercent?: number;

  verbalTotal: number;
  numericalTotal: number;
  lgsScore: number;
  examHistory: ExamResult[];
}

export interface ClassAverages {
  turkish: number;
  history: number;
  religion: number;
  english: number;
  math: number;
  science: number;
  verbalTotal: number;
  numericalTotal: number;
  lgsScore: number;
}

export interface AnalysisResult {
  studentFeedback: string;
  concreteSuggestions: string[];
  whatsappMessage: string;
  studentLetter: string;
  attentionScore: number;
  attentionAnalysis: string;
  strategicGuidance: string;
}
