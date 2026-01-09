
import { GoogleGenAI, Type } from "@google/genai";
import { Student, ClassAverages, AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseSınavzaReport = async (
  input: string | { data: string; mimeType: string }
): Promise<{ students: Student[]; averages: ClassAverages }> => {
  const isFile = typeof input !== 'string';
  
  const contentPart = isFile 
    ? { inlineData: input } 
    : { text: input };

  const promptPart = {
    text: `Aşağıdaki LGS Deneme Sınavı Raporunu analiz et.

    --- DERS VE SÜTUN EŞLEŞTİRME KURALLARI ---
    Tablolardaki şu başlıkları belirtilen JSON alanlarına eşleştir:
    1. "LGS-TRK", "LGS-TÜRKÇE", "TÜRKÇE", "TRK" -> turkish
    2. "LGS SOS", "LGS-SOSYAL", "SOSYAL", "İNKILAP", "SOS" -> history
    3. "LGS DİN", "LGS-DİN", "DİN" -> religion
    4. "LGS İNG", "LGS-İNGİLİZCE", "İNGİLİZCE", "İNG" -> english
    5. "LGS-MAT", "LGS-MATEMATİK", "MATEMATİK", "MAT" -> math
    6. "LGS FEN", "LGS-FEN", "FEN BİLİMLERİ", "FEN" -> science

    --- VERİ ÇEKME KURALLARI ---
    1. **ANA NETLER:** Öğrencinin en son sınavına ait genel netleri 'Student' objesine işle.
    2. **BAŞARI YÜZDELERİ:**
       - Tabloda "Konu Adı" veya "Ders" satırlarında en sağda "Baş.(%)" veya "Başarı %" sütunu varsa bu değeri al.
    
    3. **GEÇMİŞ SINAVLAR (ZORUNLU):** 
       - "SON 9 SINAVIN SONUÇLARI" veya benzeri geçmiş listesini bul.
       - Her satır için Tarih, Sınav Adı ve Toplam Net'i ("T.NET") al.
       - **KRİTİK:** Tablodaki "LGS-TRK", "LGS SOS", "LGS DİN", "LGS İNG", "LGS-MAT", "LGS FEN" sütunları var.
       - Her bir sınav satırı için bu sütunların altındaki net değerlerini mutlaka 'examHistory' içindeki 'turkish', 'history', 'religion', 'english', 'math', 'science' alanlarına kaydet.
       - Bu alanlar ortalama hesaplaması için gereklidir, boş geçme.

    Yanıtı SADECE JSON formatında ver.`
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [contentPart, promptPart]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          students: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                rank: { type: Type.NUMBER },
                no: { type: Type.NUMBER },
                name: { type: Type.STRING },
                examCount: { type: Type.NUMBER },
                turkish: { type: Type.NUMBER },
                history: { type: Type.NUMBER },
                religion: { type: Type.NUMBER },
                english: { type: Type.NUMBER },
                math: { type: Type.NUMBER },
                science: { type: Type.NUMBER },
                
                turkishPercent: { type: Type.NUMBER },
                historyPercent: { type: Type.NUMBER },
                religionPercent: { type: Type.NUMBER },
                englishPercent: { type: Type.NUMBER },
                mathPercent: { type: Type.NUMBER },
                sciencePercent: { type: Type.NUMBER },

                verbalTotal: { type: Type.NUMBER },
                numericalTotal: { type: Type.NUMBER },
                lgsScore: { type: Type.NUMBER },
                examHistory: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      no: { type: Type.NUMBER },
                      name: { type: Type.STRING },
                      date: { type: Type.STRING },
                      totalNet: { type: Type.NUMBER },
                      turkish: { type: Type.NUMBER },
                      math: { type: Type.NUMBER },
                      science: { type: Type.NUMBER },
                      history: { type: Type.NUMBER },
                      religion: { type: Type.NUMBER },
                      english: { type: Type.NUMBER }
                    }
                  }
                }
              },
              required: ["name", "lgsScore", "examHistory"]
            }
          },
          averages: {
            type: Type.OBJECT,
            properties: {
              turkish: { type: Type.NUMBER },
              history: { type: Type.NUMBER },
              religion: { type: Type.NUMBER },
              english: { type: Type.NUMBER },
              math: { type: Type.NUMBER },
              science: { type: Type.NUMBER },
              verbalTotal: { type: Type.NUMBER },
              numericalTotal: { type: Type.NUMBER },
              lgsScore: { type: Type.NUMBER },
            }
          }
        },
        required: ["students", "averages"]
      }
    }
  });

  const result = JSON.parse(response.text);

  // Enhanced Robust Net Cleaner
  const cleanNet = (val: any, maxQuestions: number = 20) => {
    if (val === undefined || val === null || val === '') return 0;

    let stringVal = String(val).trim();
    stringVal = stringVal.replace(/,/g, '.');
    // Remove all non-numeric characters except dot and minus
    stringVal = stringVal.replace(/[^0-9.-]/g, '');

    // Handle double dots if any
    const parts = stringVal.split('.');
    if (parts.length > 2) {
      stringVal = parts[0] + '.' + parts.slice(1).join('');
    }

    let n = Number(stringVal);
    
    if (isNaN(n)) return 0;

    if (n > maxQuestions) {
        if (n > 100) n = n / 100;
        else if (n > maxQuestions) n = n / 10;
    }

    if (n > maxQuestions) return maxQuestions;
    if (n < -maxQuestions) return -maxQuestions; 

    return parseFloat(n.toFixed(2));
  };

  const cleanPercent = (val: any) => {
    if (val === undefined || val === null || val === '') return undefined;
    let stringVal = String(val).trim().replace(/,/g, '.').replace(/[^0-9.]/g, '');
    let n = Number(stringVal);
    if (isNaN(n)) return undefined;
    if (n > 100) return 100;
    if (n < 0) return 0;
    return Math.round(n);
  };

  const cleanScore = (val: any) => {
    if (val === undefined || val === null || val === '') return 0;
    let stringVal = String(val).replace(/,/g, '.').replace(/[^0-9.-]/g, '');
    let n = Number(stringVal);
    if (isNaN(n)) return 0;
    if (n > 500) { 
      if (n > 50000) n = n / 100;
      else if (n > 5000) n = n / 10;
    }
    return parseFloat(n.toFixed(2));
  };

  if (result.students) {
    result.students = result.students.map((s: any) => {
      s.turkish = cleanNet(s.turkish, 20);
      s.math = cleanNet(s.math, 20);
      s.science = cleanNet(s.science, 20);
      s.history = cleanNet(s.history, 10);
      s.religion = cleanNet(s.religion, 10);
      s.english = cleanNet(s.english, 10);
      
      // Clean percentages
      s.turkishPercent = cleanPercent(s.turkishPercent);
      s.mathPercent = cleanPercent(s.mathPercent);
      s.sciencePercent = cleanPercent(s.sciencePercent);
      s.historyPercent = cleanPercent(s.historyPercent);
      s.religionPercent = cleanPercent(s.religionPercent);
      s.englishPercent = cleanPercent(s.englishPercent);

      s.verbalTotal = parseFloat((s.turkish + s.history + s.religion + s.english).toFixed(2));
      s.numericalTotal = parseFloat((s.math + s.science).toFixed(2));
      s.lgsScore = cleanScore(s.lgsScore);
      
      if (s.examHistory) {
        s.examHistory = s.examHistory.map((e: any) => ({
          ...e,
          totalNet: cleanNet(e.totalNet, 90),
          turkish: e.turkish !== undefined ? cleanNet(e.turkish, 20) : undefined,
          math: e.math !== undefined ? cleanNet(e.math, 20) : undefined,
          science: e.science !== undefined ? cleanNet(e.science, 20) : undefined,
          history: e.history !== undefined ? cleanNet(e.history, 10) : undefined,
          religion: e.religion !== undefined ? cleanNet(e.religion, 10) : undefined,
          english: e.english !== undefined ? cleanNet(e.english, 10) : undefined,
        }));
      }
      return s;
    });
  }

  if (result.averages) {
    result.averages.turkish = cleanNet(result.averages.turkish, 20);
    result.averages.math = cleanNet(result.averages.math, 20);
    result.averages.science = cleanNet(result.averages.science, 20);
    result.averages.history = cleanNet(result.averages.history, 10);
    result.averages.religion = cleanNet(result.averages.religion, 10);
    result.averages.english = cleanNet(result.averages.english, 10);
    result.averages.verbalTotal = parseFloat((result.averages.turkish + result.averages.history + result.averages.religion + result.averages.english).toFixed(2));
    result.averages.numericalTotal = parseFloat((result.averages.math + result.averages.science).toFixed(2));
    result.averages.lgsScore = cleanScore(result.averages.lgsScore);
  }

  return result;
};

export const generateDetailedAnalysis = async (
  student: Student, 
  averages: ClassAverages
): Promise<AnalysisResult> => {
  const prompt = `
    Sen Türkiye'nin en iyi LGS Sınav Koçu ve Rehber Öğretmenisin.
    
    Öğrenci Adı: ${student.name}
    
    Öğrenci Net Durumu:
    - Türkçe: ${student.turkish} net
    - Matematik: ${student.math} net
    - Fen Bilimleri: ${student.science} net
    - Toplam Net: ${(student.verbalTotal + student.numericalTotal).toFixed(2)}
    
    Sınav Geçmişi:
    ${student.examHistory.map(e => `- ${e.name}: ${e.totalNet} Net`).join('\n')}

    GÖREV: Profesyonel koçluk analizi oluştur.

    --- VELİ WHATSAPP MESAJI (RESMİ VE KURUMSAL) ---
    Bu mesaj doğrudan veliye gönderilecektir. O yüzden diliniz "Öğretmen/Kurum" ciddiyetinde, saygılı ve profesyonel olmalıdır.
    
    Kurallar:
    1. Hitap: Mutlaka "Sayın Velimiz," ile başla.
    2. İçerik: Öğrencinin sınav sonucunu ve genel gidişatını veliyi panikletmeden ama gerçekleri saklamadan aktar.
    3. Üslup: "Sen" dili yerine "Siz" veya "Biz" dili kullan (Örn: "Yapacağız", "Planladık", "Gözlemledik"). Asla laubali olma.
    4. Odak: Sorun odaklı değil, çözüm odaklı ol. "Netleri düştü" demek yerine "Bu hafta şu konulara yoğunlaşmamız gerektiği tespit edildi" de.
    5. Kapanış: "Öğrencimizin gelişimi için desteğinizi rica eder, iyi günler dileriz." gibi resmi bir kapanış yap.
    6. Emoji: En fazla 1-2 tane, ciddiyeti bozmayacak emojiler (📚, 📉 gibi) kullan veya hiç kullanma.

    --- ÖĞRENCİ MEKTUBU FORMATI VE TONU (SAMİMİ ABİ/ABLA) ---
    Öğrenciye ise tam tersi; resmi bir öğretmen gibi değil, onun derdini anlayan, omzuna elini atan çok samimi, sıcak ve güven veren bir "Rehber Abisi/Ablası" gibi seslen.
    
    **ÖNEMLİ:** Mektup sadece "başarabilirsin" diyen boş bir motivasyon metni OLMAMALI. Rehber öğretmen olarak tespit ettiğin teknik eksikleri (örn: Matematikteki düşüş, Fen'deki dikkat hataları veya Türkçedeki süre sorunu gibi) bu mektubun içine, "Bak şuna dikkat etmeliyiz" şeklinde samimi bir dille yedirmelisin.

    **NET DURUMUNA GÖRE ÖĞRENCİ YAKLAŞIMI:**
    - Düşük Netlerde (55 altı): Asla kızma, yargılama veya "kötü" deme. "Biliyorum, belki sen de bu sonuçtan dolayı biraz buruksun ama sakın yüzünü asma. Bu sadece bir deneme, senin zekanın ölçüsü değil. Biz seninle neleri başarabiliriz, ben çok iyi biliyorum," gibi çok kucaklayıcı konuş.
    - Orta Netlerde (55-75 arası): "Harika bir potansiyelin var, bunu görebiliyorum. Sadece o içindeki gücü tam olarak sahaya yansıtmak kaldı. Biraz daha inatçı olacağız," gibi hem öven hem ateşleyen bir dil kullan.
    - Yüksek Netlerde (75 üstü): "Gurur duyuyorum seninle! Ama asıl hedefin zirve, biliyorsun. Bu disiplini bozmadan, o şampiyonluk kupasını kaldıracağız," gibi coşkulu konuş.

    **FORMAT VE YAPI KURALLARI:**
    1. PARAGRAF YAPISI: Metni tek bir blok halinde yazma. En az 4-5 kısa paragraf olsun.
    2. AYIRICILAR: Paragrafları birbirinden ayırmak için JSON içinde mutlaka "\n" (yeni satır) karakterini kullan.
    3. BİÇİMLENDİRME: Mektup metninde **kalın** veya *italik* gibi Markdown işaretleri KULLANMA. Sadece düz yazı olsun.
    
    Mektup İçeriği:
    1. GİRİŞ: Mutlaka "Sevgili ${student.name}," hitabıyla başla. "Sana bu satırları sadece bir hoca olarak değil, bu yollardan geçmiş ve seni çok iyi anlayan bir abin/ablan olarak yazıyorum," gibi çok samimi bir giriş yap. "Koçum benim" gibi laubali hitapları asla kullanma.
    2. DUYGU ANALİZİ: Sınav sonucuna baktığında ne hissettiğini tahmin et.
    3. TEKNİK REHBERLİK (KRİTİK): Rehber Öğretmen Görüşü niteliğindeki teknik analizlerini (hangi derse yüklenmeli, konu eksiği mi var, dikkat hatası mı) mektubun akışını bozmadan, bir abinin kardeşine verdiği taktikler gibi metne yedir. Sadece gaz verme, yol da göster.
    4. EYLEM ÇAĞRISI: "Hadi gel, seninle bir söz verelim," diyerek onu çalışmaya davet et.
    5. KAPANIŞ: "Sana tüm kalbimle inanıyorum," diyerek bitir.

    --- STRATEJİK REHBERLİK KURALLARI (KISA VE VURUCU) ---
    - **KRİTİK LGS KURALI:** LGS'de Sözel ve Sayısal olmak üzere iki ayrı oturum vardır ve oturumlar arası süre aktarımı YAPILAMAZ. Bu yüzden asla "Türkçeden/Sözelden artan süreyi Matematiğe/Sayısala ver" gibi hatalı bir taktik VERME. Zaman yönetimi tavsiyelerini sadece o oturumun kendi içindeki dersler için ver (Örn: "Dinden artan süreyi Türkçeye aktar" veya "Fenden artan süreyi Matematiğe sakla").
    - Başlıklar anlaşılır ve cümle düzeninde olsun (Örn: Sınav anında zaman yönetimi). BÜYÜK HARF ZORUNLULUĞU YOKTUR.
    - İçerik doğrudan EMİR KİPİYLE yazılmalı. Asla uzun cümleler kurma.
    - **MADDELER MAKSİMUM 1-2 CÜMLE OLSUN.** Kısa, öz ve net taktikler ver. Edebiyat yapma, taktik ver.
    - Yazıların boyutu optimize edildi, içeriği kısa ve öz tut.
    - Şu 3 başlığı mutlaka kullan:
      **Sınav Anında Zaman Yönetimi**
      **Dikkat ve Hata Yönetimi**
      **Kritik Hamle ve Turlama**

    Yanıtı JSON formatında ver.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          studentFeedback: { type: Type.STRING },
          concreteSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          whatsappMessage: { type: Type.STRING },
          studentLetter: { type: Type.STRING },
          attentionScore: { type: Type.NUMBER },
          attentionAnalysis: { type: Type.STRING },
          strategicGuidance: { type: Type.STRING }
        },
        required: ["studentFeedback", "concreteSuggestions", "whatsappMessage", "studentLetter", "attentionScore", "attentionAnalysis", "strategicGuidance"]
      }
    }
  });

  return JSON.parse(response.text);
};
