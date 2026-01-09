
import React, { useState, useRef } from 'react';
import { parseSınavzaReport, generateDetailedAnalysis } from './services/geminiService';
import { Student, ClassAverages, AnalysisResult } from './types';
import { StudentChart } from './components/StudentChart';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  ClipboardCheck, 
  MessageCircle, 
  Search, 
  FileText, 
  ChevronRight, 
  UserCircle, 
  GraduationCap, 
  Loader2,
  Share2,
  LayoutDashboard,
  Upload,
  FileUp,
  X,
  TrendingUp,
  Sparkles,
  PlusCircle,
  Activity,
  Zap,
  Compass,
  Lightbulb,
  Target,
  CheckCircle2,
  Download,
  Timer,
  FlagTriangleRight,
  Eye,
  Mail,
  PenTool,
  FileDown
} from 'lucide-react';

const SınavzaLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 200" className={className} fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
    {/* Head/Top Loop */}
    <path d="M100 50 C 85 30, 115 30, 100 50" />
    
    {/* Wings - Left & Right */}
    <path d="M100 50 C 40 30, 10 90, 60 100 C 85 105, 100 85, 100 85" />
    <path d="M100 50 C 160 30, 190 90, 140 100 C 115 105, 100 85, 100 85" />
    
    {/* Body */}
    <path d="M75 110 C 75 140, 100 170, 100 170 C 100 170, 125 140, 125 110" />
    
    {/* Stripes */}
    <path d="M82 130 L 118 130" />
    <path d="M90 150 L 110 150" />
  </svg>
);

const App: React.FC = () => {
  const [ocrInput, setOcrInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ data: string; mimeType: string; name: string } | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [averages, setAverages] = useState<ClassAverages | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [inputMode, setInputMode] = useState<'pdf' | 'text'>('pdf');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const letterTemplateRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = (reader.result as string).split(',')[1];
      setSelectedFile({
        data: base64Data,
        mimeType: file.type,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const handleParse = async () => {
    setLoading(true);
    try {
      let result;
      if (inputMode === 'pdf' && selectedFile) {
        result = await parseSınavzaReport({ data: selectedFile.data, mimeType: selectedFile.mimeType });
      } else if (inputMode === 'text' && ocrInput.trim()) {
        result = await parseSınavzaReport(ocrInput);
      } else {
        alert("Lütfen bir dosya seçin veya metin girin.");
        setLoading(false);
        return;
      }
      setStudents(result.students);
      setAverages(result.averages);
    } catch (error) {
      console.error("Parsing failed", error);
      alert("Rapor ayrıştırılamadı. Lütfen 'Sınavza Birleştirilmiş Karne' formatında bir dosya yüklediğinizden emin olun.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeStudent = async (student: Student) => {
    if (!averages) return;
    setSelectedStudent(student);
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const result = await generateDetailedAnalysis(student, averages);
      setAnalysis(result);
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setStudents([]);
    setAverages(null);
    setSelectedStudent(null);
    setAnalysis(null);
    setSelectedFile(null);
    setOcrInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadImage = async () => {
    if (!reportRef.current || !selectedStudent) return;
    
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        windowWidth: element.scrollWidth,
        width: element.scrollWidth,
        scrollY: -window.scrollY,
        onclone: (clonedDoc) => {
          const reportContainer = clonedDoc.querySelector('#report-container');
          if (reportContainer) {
             reportContainer.classList.remove('bg-slate-50');
             reportContainer.classList.add('bg-white');
          }
          const strategyCard = clonedDoc.querySelector('#strategy-card');
          if (strategyCard) {
            strategyCard.classList.remove('bg-slate-900', 'text-white', 'border-slate-800', 'shadow-2xl');
            strategyCard.classList.add('bg-white', 'text-slate-900', 'border-2', 'border-slate-900', 'shadow-none');
            const compassIcon = strategyCard.querySelector('.compass-bg');
            if (compassIcon) compassIcon.classList.add('hidden');
          }
          const strategyBoxes = clonedDoc.querySelectorAll('.strategy-box');
          strategyBoxes.forEach(box => {
             box.classList.remove('bg-white/5', 'backdrop-blur-sm', 'border-white/5', 'hover:bg-white/10');
             box.classList.add('bg-white', 'border-2', 'border-slate-300', 'mb-2');
          });
          const strategyHeaders = clonedDoc.querySelectorAll('.strategy-header');
          strategyHeaders.forEach(header => {
             header.classList.replace('text-blue-300', 'text-blue-800');
             header.classList.replace('text-amber-300', 'text-amber-700');
             header.classList.replace('text-emerald-300', 'text-emerald-800');
             header.classList.replace('text-purple-300', 'text-purple-800');
             header.classList.replace('text-red-300', 'text-red-700');
             header.classList.replace('text-white', 'text-slate-900');
          });
          const strategyTexts = clonedDoc.querySelectorAll('.strategy-text');
          strategyTexts.forEach(text => {
             text.classList.replace('text-white', 'text-slate-900');
             text.classList.replace('text-slate-300', 'text-slate-900');
             text.classList.remove('border-l-4', 'border-white/20');
             text.classList.add('border-l-4', 'border-slate-800');
          });
          const attentionCard = clonedDoc.querySelector('#attention-card');
          if (attentionCard) {
            attentionCard.classList.remove('shadow-xl', 'border-slate-200');
            attentionCard.classList.add('shadow-none', 'border-2', 'border-slate-900');
          }
          const headerCard = clonedDoc.querySelector('#header-card');
          if (headerCard) {
             headerCard.classList.remove('shadow-2xl', 'border-slate-200', 'bg-white');
             headerCard.classList.add('shadow-none', 'border-b-2', 'border-slate-900', 'bg-white', 'rounded-none');
          }
          // Remove letter card from screenshot to keep it clean, as it's for download
          const letterCard = clonedDoc.querySelector('#letter-card');
          if (letterCard) {
            letterCard.remove();
          }
        }
      });
      const link = document.createElement('a');
      link.download = `${selectedStudent.name}-Gelisim-Raporu.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Screenshot failed:', error);
      alert('Görsel oluşturulurken bir hata oluştu.');
    }
  };

  const handleDownloadPDF = async () => {
    if (!letterTemplateRef.current || !selectedStudent) return;

    try {
      const element = letterTemplateRef.current;
      // Ensure element is visible during capture (even if off-screen)
      element.style.display = 'block';
      
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });

      element.style.display = 'none';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${selectedStudent.name}-Motivasyon-Mektubu.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('PDF oluşturulurken bir hata oluştu.');
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Kopyalandı!");
  };

  const openWhatsApp = (studentName: string, message: string) => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const getAttentionColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500 bg-emerald-50 border-emerald-100';
    if (score >= 60) return 'text-yellow-500 bg-yellow-50 border-yellow-100';
    return 'text-red-500 bg-red-50 border-red-100';
  };

  const renderStyledGuidance = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    return (
      <div className="space-y-6">
        {lines.map((line, index) => {
          const boldMatch = line.match(/\*\*(.*?)\*\*/);
          if (boldMatch) {
            const cleanLine = line.replace(/\*\*/g, '').replace(/[:]/g, '');
            let icon = <FlagTriangleRight size={18} />;
            let colorClass = "text-blue-300 border-blue-500";
            let bgGradient = "from-blue-500/10";
            
            if (cleanLine.toLowerCase().includes("zaman") || cleanLine.toLowerCase().includes("süre")) {
              icon = <Timer size={18} />;
              colorClass = "text-amber-300 border-amber-500";
              bgGradient = "from-amber-500/10";
            } else if (cleanLine.toLowerCase().includes("dikkat") || cleanLine.toLowerCase().includes("hata") || cleanLine.toLowerCase().includes("önleme")) {
              icon = <Eye size={18} />;
              colorClass = "text-red-300 border-red-500";
              bgGradient = "from-red-500/10";
            } else if (cleanLine.toLowerCase().includes("strateji") || cleanLine.toLowerCase().includes("başlangıç")) {
              icon = <Compass size={18} />;
              colorClass = "text-emerald-300 border-emerald-500";
              bgGradient = "from-emerald-500/10";
            } else if (cleanLine.toLowerCase().includes("turlama") || cleanLine.toLowerCase().includes("hamle")) {
              icon = <Activity size={18} />;
              colorClass = "text-purple-300 border-purple-500";
              bgGradient = "from-purple-500/10";
            }
            return (
              <div key={index} className={`strategy-box mt-4 first:mt-0 p-3 bg-gradient-to-r ${bgGradient} to-transparent border-l-4 ${colorClass.split(' ')[1]} rounded-r-xl`}>
                <h4 className={`strategy-header ${colorClass.split(' ')[0]} font-black text-sm md:text-base flex items-center gap-3 drop-shadow-md`}>
                  {icon}
                  {cleanLine}
                </h4>
              </div>
            );
          } else {
            return (
              <p key={index} className="strategy-text text-slate-300 leading-relaxed font-medium text-xs md:text-sm pl-4 border-l border-white/10 ml-[2px] italic">
                {line}
              </p>
            );
          }
        })}
      </div>
    );
  };

  // Helper function to calculate General Average Net from History
  const getGeneralTotalNet = () => {
    if (!selectedStudent) return '0.00';
    
    // Check if examHistory exists and has length
    if (selectedStudent.examHistory && selectedStudent.examHistory.length > 0) {
      const totalNets = selectedStudent.examHistory.reduce((sum, exam) => sum + (exam.totalNet || 0), 0);
      return (totalNets / selectedStudent.examHistory.length).toFixed(2);
    }
    
    // Fallback to current total if no history
    return (selectedStudent.verbalTotal + selectedStudent.numericalTotal).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h1 className="font-bold text-xl text-slate-800 hidden sm:block">Sınavza Rehberlik Asistanı</h1>
            <h1 className="font-bold text-xl text-slate-800 sm:hidden">Rehberlik</h1>
          </div>
          <div className="flex items-center gap-3">
            {selectedStudent && analysis && (
               <button onClick={handleDownloadImage} className="bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-2 px-4 py-2 rounded-full transition-all text-xs font-black uppercase tracking-widest shadow-lg">
                 <Download className="w-4 h-4" />
                 <span className="hidden sm:inline">Rapor Kartı İndir</span>
               </button>
            )}
            {students.length > 0 && (
              <button onClick={handleReset} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50 text-sm font-bold">
                <PlusCircle size={18} />
                <span className="hidden sm:inline">Yeni Rapor</span>
              </button>
            )}
            {selectedStudent && (
               <button onClick={() => setSelectedStudent(null)} className="text-sm font-black text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-4 py-2 rounded-full transition-all">
                 <LayoutDashboard className="w-4 h-4" />
                 Listeye Dön
               </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hidden PDF Template */}
      {analysis && selectedStudent && (
        <div 
          ref={letterTemplateRef} 
          style={{ 
            width: '210mm', 
            minHeight: '297mm', 
            padding: '25mm',
            backgroundColor: 'white',
            display: 'none', // Hidden by default, shown briefly for capture
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: -1000
          }}
          className="font-serif-pro relative"
        >
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] pointer-events-none">
             <SınavzaLogo className="w-[500px] h-[500px] text-[#C19D46]" />
          </div>

          <div className="relative z-10 h-full flex flex-col">
            <h1 className="text-center font-black text-2xl tracking-widest uppercase mb-12 border-b-2 border-slate-900 pb-4">
              ÖĞRENCİ MOTİVASYON MEKTUBU
            </h1>
            
            <div className="text-lg leading-loose text-justify space-y-6 text-slate-800 font-medium italic">
               {analysis.studentLetter.split('\n').map((para, i) => (
                 para.trim() && <p key={i} className="indent-8">{para.trim()}</p>
               ))}
            </div>

            <div className="mt-auto pt-16">
              <p className="font-bold text-xl text-slate-800 font-handwriting">Rehber Öğretmenin</p>
            </div>
          </div>
          
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 rounded-bl-full -mr-16 -mt-16 z-0"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-50 rounded-tr-full -ml-16 -mb-16 z-0"></div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!students.length ? (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="flex border-b border-slate-100">
                <button onClick={() => setInputMode('pdf')} className={`flex-1 py-5 text-sm font-black flex items-center justify-center gap-2 transition-all uppercase tracking-widest ${inputMode === 'pdf' ? 'text-blue-600 bg-white border-b-4 border-blue-600' : 'text-slate-400 bg-slate-50 hover:bg-slate-100'}`}>
                  <FileUp size={18} /> PDF Yükle
                </button>
                <button onClick={() => setInputMode('text')} className={`flex-1 py-5 text-sm font-black flex items-center justify-center gap-2 transition-all uppercase tracking-widest ${inputMode === 'text' ? 'text-blue-600 bg-white border-b-4 border-blue-600' : 'text-slate-400 bg-slate-50 hover:bg-slate-100'}`}>
                  <FileText size={18} /> Metin Yapıştır
                </button>
              </div>
              <div className="p-10">
                {inputMode === 'pdf' ? (
                  <div className="space-y-4">
                    <div onClick={() => fileInputRef.current?.click()} className={`border-4 border-dashed rounded-3xl p-14 flex flex-col items-center justify-center cursor-pointer transition-all ${selectedFile ? 'border-emerald-300 bg-emerald-50' : 'border-slate-100 hover:border-blue-400 hover:bg-blue-50'}`}>
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf,image/*" className="hidden" />
                      {selectedFile ? (
                        <>
                          <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 shadow-lg shadow-emerald-100">
                            <FileText size={40} />
                          </div>
                          <p className="font-black text-emerald-900 text-lg">{selectedFile.name}</p>
                          <button onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if(fileInputRef.current) fileInputRef.current.value = ''; }} className="mt-3 px-4 py-1.5 bg-emerald-200 text-emerald-800 rounded-full text-xs font-black uppercase tracking-widest">Kaldır</button>
                        </>
                      ) : (
                        <>
                          <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 shadow-lg shadow-blue-100">
                            <Upload size={40} />
                          </div>
                          <p className="font-black text-slate-700 text-xl text-center">Dosyayı Buraya Sürükleyin</p>
                          <p className="text-slate-400 text-sm mt-2 text-center font-medium">Sınavza Birleştirilmiş Karne PDF'i veya ekran görüntüsü</p>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <textarea value={ocrInput} onChange={(e) => setOcrInput(e.target.value)} placeholder="Örneğin: ZEYNEP BERRA BOZDUMAN 4 18,000 8,670..." className="w-full h-64 p-6 rounded-3xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none bg-slate-50 font-mono text-sm leading-relaxed" />
                )}
                <button onClick={handleParse} disabled={loading || (inputMode === 'pdf' ? !selectedFile : !ocrInput)} className="w-full mt-10 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-black text-lg py-6 rounded-3xl flex items-center justify-center gap-3 transition-all shadow-2xl shadow-blue-200 active:scale-95 uppercase tracking-[0.2em]">
                  {loading ? <><Loader2 className="w-6 h-6 animate-spin" /> Analiz Yapılıyor...</> : <><ClipboardCheck className="w-6 h-6" /> Raporu Ayrıştır</>}
                </button>
              </div>
            </div>
          </div>
        ) : !selectedStudent ? (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Öğrenci Analizleri</h2>
                <p className="text-slate-500 font-medium mt-1">Sınavza raporu temelinde net analizi ve rehberlik görüşleri.</p>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input type="text" placeholder="Öğrenci ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-12 pr-6 py-4 border border-slate-200 rounded-2xl w-full md:w-96 focus:ring-4 focus:ring-blue-100 outline-none shadow-sm font-semibold transition-all" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredStudents.map((student, idx) => (
                <div key={idx} onClick={() => handleAnalyzeStudent(student)} className="bg-white p-8 rounded-[2rem] border border-slate-200 hover:border-blue-500 cursor-pointer transition-all hover:shadow-2xl group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-16 -mt-16 transition-all group-hover:scale-150 opacity-20" />
                  <div className="flex items-start justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-200">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 group-hover:text-blue-600 transition-colors text-lg leading-tight">{student.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                           <TrendingUp className="w-3 h-3 text-emerald-500" />
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Analizi Hazır</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center mb-6">
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sıralama</div>
                      <div className="text-lg font-black text-slate-800">#{student.rank}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ort. Net</div>
                      <div className="text-lg font-black text-blue-600">{(student.verbalTotal + student.numericalTotal).toFixed(1)}</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Detaylı Analiz</span>
                    <ChevronRight className="w-6 h-6 text-blue-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div ref={reportRef} id="report-container" className="space-y-10 p-4 rounded-[3rem] bg-slate-50">
              <div id="header-card" className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-10 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50 rounded-full -mr-40 -mt-40 opacity-30" />
                <div className="flex items-center gap-8 relative z-10">
                  <div className="w-28 h-28 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-white text-5xl font-black shadow-3xl shadow-blue-300">{selectedStudent.name[0]}</div>
                  <div>
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{selectedStudent.name}</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-5">
                      <span className="px-5 py-2 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase tracking-[0.2em]">8. SINIF LGS</span>
                      <span className="px-5 py-2 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-[0.2em]">{selectedStudent.examHistory.length} SINAV VERİSİ</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-6 relative z-10">
                  <div className="px-10 py-6 bg-slate-50 rounded-[2rem] border border-slate-100 text-center shadow-inner">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Genel Toplam Net</div>
                    <div className="text-4xl font-black text-slate-800">{getGeneralTotalNet()}</div>
                  </div>
                  <div className="px-10 py-6 bg-blue-600 rounded-[2rem] text-center shadow-xl shadow-blue-200">
                    <div className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em] mb-2">Son Net</div>
                    <div className="text-4xl font-black text-white">{selectedStudent.examHistory[selectedStudent.examHistory.length-1]?.totalNet || '-'}</div>
                  </div>
                </div>
              </div>

              {averages && <StudentChart student={selectedStudent} averages={averages} />}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                 {analysis && (
                   <div className="h-full">
                      <div id="attention-card" className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-xl relative overflow-hidden group h-full">
                         <div className="flex flex-col items-center gap-8 text-center">
                            <h3 className="text-xl font-black text-slate-900 mb-2 flex items-center justify-center gap-3">
                               <Activity className="text-blue-600" /> Dikkat & Odak Analizi
                            </h3>
                            <div className={`relative w-32 h-32 flex items-center justify-center rounded-full border-8 ${getAttentionColor(analysis.attentionScore).split(' ')[2]} shadow-2xl bg-white flex-shrink-0`}>
                               <Zap className={`w-12 h-12 ${getAttentionColor(analysis.attentionScore).split(' ')[0]} absolute z-10`} />
                               <div className={`absolute inset-0 rounded-full opacity-20 animate-pulse ${getAttentionColor(analysis.attentionScore).split(' ')[1]}`}></div>
                               <div className="absolute -bottom-3 bg-white px-4 py-1 rounded-full border border-slate-100 shadow-lg font-black text-xl text-slate-800 tracking-tighter">{analysis.attentionScore}</div>
                            </div>
                            <div className="flex-1 w-full">
                               <p className="text-slate-600 font-medium leading-relaxed mb-6">{analysis.attentionAnalysis}</p>
                               <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden shadow-inner">
                                  <div className={`h-full transition-all duration-1000 ease-out ${getAttentionColor(analysis.attentionScore).replace('text-', 'bg-').split(' ')[0]}`} style={{ width: `${analysis.attentionScore}%` }} />
                               </div>
                               <div className="flex justify-between mt-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  <span>Dikkatsiz</span><span>Normal</span><span>Odaklanmış</span>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                 )}

                 {analysis && (
                    <div className="h-full">
                       <div id="strategy-card" className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden text-white border border-slate-800 h-full flex flex-col">
                           <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none compass-bg"><Compass size={250} /></div>
                           <h3 className="text-xl font-black mb-6 flex items-center gap-4 relative z-10 text-center md:text-left">
                               <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-300 backdrop-blur-sm border border-blue-400/30"><Lightbulb size={24} /></div>
                               Stratejik Rehberlik & Taktikler
                           </h3>
                           <div className="relative z-10 flex-1">{renderStyledGuidance(analysis.strategicGuidance)}</div>
                           <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800 relative z-10">
                               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Kişiye Özel Analiz</span>
                               <Target size={18} className="text-yellow-400" />
                           </div>
                       </div>
                    </div>
                 )}
              </div>
            </div>

            {/* Student Motivation Letter Section (UPDATED FOR PDF DOWNLOAD) */}
            {analysis && (
              <div className="w-full">
                 <div id="letter-card" className="bg-yellow-50 rounded-[2.5rem] p-10 shadow-xl border border-yellow-100 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-8 bg-yellow-100/50"></div>
                    <div className="absolute bottom-0 right-0 p-8 opacity-5 text-yellow-900 transform rotate-12 pointer-events-none">
                      <Mail size={300} />
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                       <div className="flex-1 text-center md:text-left">
                          <h3 className="text-3xl font-serif-pro font-black text-slate-800 mb-4 flex items-center justify-center md:justify-start gap-3">
                             <Mail className="text-yellow-600" />
                             Öğrenci Motivasyon Mektubu
                          </h3>
                          <p className="text-slate-600 font-medium leading-relaxed mb-6 max-w-2xl">
                            Öğrencinize özel hazırlanmış, çalışma odasına asabileceği ve motivasyonunu artıracak kişisel mektubu PDF formatında indirebilirsiniz.
                          </p>
                          <div className="flex gap-4 justify-center md:justify-start">
                             <button onClick={handleDownloadPDF} className="flex items-center gap-3 px-8 py-4 bg-yellow-400 text-yellow-900 rounded-2xl font-black text-lg hover:bg-yellow-300 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                                <FileDown size={24} /> PDF MEKTUP İNDİR
                             </button>
                          </div>
                       </div>
                       <div className="w-full md:w-80 p-8 bg-white rounded-3xl border-2 border-dashed border-yellow-300 flex flex-col items-center justify-center text-center transform rotate-2 group-hover:rotate-0 transition-all duration-500 shadow-sm">
                          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 mb-6">
                             <PenTool size={40} />
                          </div>
                          <h4 className="font-bold text-lg text-slate-800 mb-2">Kişiye Özel Tasarım</h4>
                          <p className="text-xs text-slate-500">Filigranlı, imzalı ve özel fontlu çıktı.</p>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-4">
              <div className="space-y-8 h-full">
                <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-2xl overflow-hidden relative h-full flex flex-col">
                   <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><GraduationCap size={200} /></div>
                   <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-4">
                     <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-lg shadow-blue-50"><MessageCircle size={24} /></div> 
                     Rehber Öğretmen Görüşü
                   </h3>
                   {analyzing ? (
                     <div className="flex flex-col items-center justify-center flex-1 py-16 text-slate-400">
                       <div className="relative">
                         <Loader2 className="w-20 h-20 animate-spin text-blue-600" />
                         <div className="absolute inset-0 flex items-center justify-center"><GraduationCap size={24} className="text-blue-600" /></div>
                       </div>
                       <p className="mt-8 font-black text-slate-600 uppercase tracking-widest text-xs">Uzman Görüşü Hazırlanıyor...</p>
                     </div>
                   ) : analysis ? (
                     <div className="space-y-10 flex-1 flex flex-col">
                        <div className="bg-gradient-to-br from-blue-50 to-white border-l-8 border-blue-600 p-8 text-slate-800 leading-relaxed font-bold italic rounded-3xl shadow-sm text-lg">"{analysis.studentFeedback}"</div>
                        <div>
                          <h4 className="font-black text-slate-900 mb-6 text-[10px] uppercase tracking-[0.3em] flex items-center gap-3"><span className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></span> Konu Temelli Yol Haritası</h4>
                          <div className="grid gap-5">
                            {analysis.concreteSuggestions.map((s, i) => (
                              <div key={i} className="flex gap-5 items-center text-slate-700 bg-slate-50 p-6 rounded-3xl border border-slate-100 hover:border-blue-200 transition-all group hover:scale-[1.02]">
                                <span className="flex-shrink-0 w-12 h-12 bg-white shadow-xl border border-slate-100 rounded-2xl flex items-center justify-center text-xl font-black text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">{i+1}</span>
                                <span className="text-sm font-bold leading-snug">{s}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="pt-8 mt-auto"><button onClick={() => copyToClipboard(analysis.studentFeedback)} className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 uppercase tracking-widest"><Share2 className="w-5 h-5" /> Analizi Kopyala</button></div>
                     </div>
                   ) : null}
                </div>
              </div>
              <div className="space-y-8 h-full">
                <div className="bg-white rounded-[2.5rem] border border-emerald-100 p-10 shadow-2xl flex flex-col h-full">
                   <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-4">
                     <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-lg shadow-emerald-50"><MessageCircle size={24} /></div> Veli Bilgilendirme (WhatsApp)
                   </h3>
                   {analyzing ? (
                     <div className="flex flex-col items-center justify-center flex-1 py-16 text-slate-400">
                       <div className="relative">
                         <Loader2 className="w-20 h-20 animate-spin text-emerald-600" />
                         <div className="absolute inset-0 flex items-center justify-center"><MessageCircle size={24} className="text-emerald-600" /></div>
                       </div>
                       <p className="mt-8 font-black text-slate-600 uppercase tracking-widest text-xs">Veli Mesajı Hazırlanıyor...</p>
                     </div>
                   ) : analysis ? (
                     <div className="space-y-8 flex-1 flex flex-col">
                        <div className="flex-1 p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100 text-slate-800 text-sm whitespace-pre-wrap font-mono leading-relaxed max-h-[550px] overflow-y-auto custom-scrollbar shadow-inner">{analysis.whatsappMessage}</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-auto">
                          <button onClick={() => openWhatsApp(selectedStudent.name, analysis.whatsappMessage)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-3xl flex items-center justify-center gap-3 transition-all shadow-2xl shadow-emerald-100 active:scale-95 uppercase tracking-widest"><MessageCircle className="w-6 h-6" /> Gönder</button>
                          <button onClick={() => copyToClipboard(analysis.whatsappMessage)} className="bg-white border-4 border-emerald-600 text-emerald-600 font-black py-5 rounded-3xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"><ClipboardCheck className="w-6 h-6" /> Kopyala</button>
                        </div>
                     </div>
                   ) : null}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      {students.length > 0 && (
         <button onClick={handleReset} className="fixed bottom-10 right-10 p-5 bg-slate-900 text-white rounded-[1.5rem] shadow-3xl hover:bg-slate-800 transition-all flex items-center gap-4 border border-slate-700 active:scale-95 z-[60]">
           <X className="w-6 h-6" /><span className="font-black uppercase tracking-widest text-xs">Yeni Rapor</span>
         </button>
      )}
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 8px; } .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; border-radius: 20px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #10b981; border-radius: 20px; border: 2px solid #f8fafc; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #059669; }`}</style>
    </div>
  );
};

export default App;
