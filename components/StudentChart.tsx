
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Student, ClassAverages, ExamResult } from '../types';

interface Props {
  student: Student;
  averages: ClassAverages;
}

const CircularProgress = ({ value, color, size = 60, strokeWidth = 6 }: { value: number; color: string; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          className="text-slate-100"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span className={`absolute text-xs font-black ${color}`}>%{Math.round(value)}</span>
    </div>
  );
};

export const StudentChart: React.FC<Props> = ({ student, averages }) => {
  
  // Function to calculate average net from history or fallback to main student data
  const getAverageNet = (key: keyof ExamResult, fallback: number) => {
    // Filter exams that have this specific subject data
    const validExams = student.examHistory.filter(e => e[key] !== undefined && e[key] !== null);
    
    if (validExams.length > 0) {
      const sum = validExams.reduce((acc, curr) => acc + (curr[key] as number), 0);
      return sum / validExams.length;
    }
    
    // Fallback if no detailed history available
    return fallback;
  };

  // Calculate Total Net Average
  const getTotalNetAverage = () => {
    if (student.examHistory.length > 0) {
      const sum = student.examHistory.reduce((acc, curr) => acc + (curr.totalNet || 0), 0);
      return sum / student.examHistory.length;
    }
    return student.verbalTotal + student.numericalTotal;
  };

  const currentTotal = student.verbalTotal + student.numericalTotal;
  const historyTotal = getTotalNetAverage();

  // Updated Data Structure: Comparing Last Exam vs Student's Own Average
  const subjectData = [
    { subject: 'TOPLAM', 'Son Sınav': parseFloat(currentTotal.toFixed(2)), 'Genel Ort.': parseFloat(historyTotal.toFixed(2)) },
    { subject: 'Türkçe', 'Son Sınav': student.turkish, 'Genel Ort.': parseFloat(getAverageNet('turkish', student.turkish).toFixed(2)) },
    { subject: 'Matematik', 'Son Sınav': student.math, 'Genel Ort.': parseFloat(getAverageNet('math', student.math).toFixed(2)) },
    { subject: 'Fen', 'Son Sınav': student.science, 'Genel Ort.': parseFloat(getAverageNet('science', student.science).toFixed(2)) },
    { subject: 'İnkılap', 'Son Sınav': student.history, 'Genel Ort.': parseFloat(getAverageNet('history', student.history).toFixed(2)) },
    { subject: 'Din', 'Son Sınav': student.religion, 'Genel Ort.': parseFloat(getAverageNet('religion', student.religion).toFixed(2)) },
    { subject: 'İngilizce', 'Son Sınav': student.english, 'Genel Ort.': parseFloat(getAverageNet('english', student.english).toFixed(2)) },
  ];

  // Map exam history for the progression chart
  const progressionData = student.examHistory.map(exam => ({
    name: exam.name.length > 15 ? exam.name.substring(0, 15) + '...' : exam.name,
    full_name: exam.name,
    Net: exam.totalNet,
    Tarih: exam.date
  }));

  const hasHistoryData = student.examHistory.some(e => e.turkish !== undefined);

  // Define Subject Configuration using AVERAGES and Explicit Percentages
  const subjectConfigs = [
    { 
      name: 'Türkçe', 
      net: getAverageNet('turkish', student.turkish), 
      percentVal: student.turkishPercent,
      total: 20, 
      color: 'text-red-500', 
      bg: 'bg-red-50', 
      border: 'border-red-100' 
    },
    { 
      name: 'Matematik', 
      net: getAverageNet('math', student.math), 
      percentVal: student.mathPercent,
      total: 20, 
      color: 'text-blue-500', 
      bg: 'bg-blue-50', 
      border: 'border-blue-100' 
    },
    { 
      name: 'Fen Bilimleri', 
      net: getAverageNet('science', student.science), 
      percentVal: student.sciencePercent,
      total: 20, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-50', 
      border: 'border-emerald-100' 
    },
    { 
      name: 'İnkılap', 
      net: getAverageNet('history', student.history), 
      percentVal: student.historyPercent,
      total: 10, 
      color: 'text-amber-500', 
      bg: 'bg-amber-50', 
      border: 'border-amber-100' 
    },
    { 
      name: 'Din K.', 
      net: getAverageNet('religion', student.religion), 
      percentVal: student.religionPercent,
      total: 10, 
      color: 'text-violet-500', 
      bg: 'bg-violet-50', 
      border: 'border-violet-100' 
    },
    { 
      name: 'İngilizce', 
      net: getAverageNet('english', student.english), 
      percentVal: student.englishPercent,
      total: 10, 
      color: 'text-pink-500', 
      bg: 'bg-pink-50', 
      border: 'border-pink-100' 
    },
  ];

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Net Progression Chart */}
      <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200 h-[350px]">
        <h3 className="text-sm font-black text-slate-500 mb-6 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-4 bg-blue-600 rounded-full"></span> Toplam Net Gelişimi
        </h3>
        <ResponsiveContainer width="100%" height="85%">
          <AreaChart data={progressionData}>
            <defs>
              <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" fontSize={10} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis fontSize={10} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
              labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
            />
            <Area type="monotone" dataKey="Net" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorNet)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-auto lg:h-[400px]">
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200 h-[400px] lg:h-full">
          <h3 className="text-sm font-black text-slate-500 mb-6 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-4 bg-blue-600 rounded-full"></span> Son Sınav vs Kendi Ortalaman
          </h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={subjectData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="subject" fontSize={10} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis fontSize={10} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="top" align="right" iconType="circle" />
              <Bar dataKey="Son Sınav" fill="#2563eb" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Genel Ort." fill="#cbd5e1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Success Percentage Grid */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200 h-auto lg:h-full">
          <h3 className="text-sm font-black text-slate-500 mb-6 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-4 bg-emerald-500 rounded-full"></span> 
            {hasHistoryData ? `Genel Başarı Ortalaması (${student.examHistory.length} Sınav)` : "Son Sınav Başarı Oranı"}
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 h-[calc(100%-40px)] content-start">
            {subjectConfigs.map((subject, idx) => {
              const isExplicitPercent = subject.percentVal !== undefined && subject.percentVal !== null;
              
              let percent = 0;
              let label = "";

              if (hasHistoryData) {
                  // If history exists, we ALWAYS show average net, ignoring current exam percentage
                  percent = (subject.net / subject.total) * 100;
                  label = `${subject.net.toFixed(2)} / ${subject.total} Ort. Net`;
              } else if (isExplicitPercent) {
                  // No history, but explicit percentage from report
                  percent = subject.percentVal!;
                  label = `%${Math.round(percent)} Başarı`;
              } else {
                  // Fallback
                  percent = (subject.net / subject.total) * 100;
                  label = `${subject.net.toFixed(2)} / ${subject.total} Net`;
              }
              
              percent = Math.min(100, Math.max(0, percent));
              
              return (
                <div key={idx} className={`flex flex-col items-center justify-center p-3 rounded-2xl border ${subject.border} ${subject.bg}`}>
                   <CircularProgress value={percent} color={subject.color} />
                   <div className="mt-2 text-center">
                     <div className="text-xs font-black text-slate-700 uppercase">{subject.name}</div>
                     <div className="text-[10px] font-medium text-slate-400 mt-0.5">
                       {label}
                     </div>
                   </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
