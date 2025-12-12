import React, { useState, useRef, useEffect } from 'react';
import { generateQuizForTopic } from '../services/geminiService';
import { QuizQuestion, AppSettings } from '../types';

const TOPICS = [
  'Chợ Bến Thành & Biểu tượng', 
  'Ẩm thực đường phố Sài Gòn', 
  'Lịch sử & Di sản Quận 1', 
  'Kinh tế đêm & Giải trí', 
  'Hệ thống Metro hiện đại'
];

interface QuizModuleProps {
  settings: AppSettings;
  onTaskComplete: () => void;
}

const QuizModule: React.FC<QuizModuleProps> = ({ settings, onTaskComplete }) => {
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);
  
  // Refs for scrolling
  const explanationRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  
  const color = settings.theme;

  const startQuiz = async (topic: string) => {
    setLoading(true);
    setCurrentTopic(topic);
    setQuestions([]);
    setShowResult(false);
    setScore(0);
    setCurrentIndex(0);
    
    const generatedQuestions = await generateQuizForTopic(topic, settings);
    setQuestions(generatedQuestions);
    setLoading(false);
  };

  const handleOptionSelect = (index: number) => {
    if (isAnswerChecked) return;
    setSelectedOption(index);
  };

  const checkAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerChecked(true);
    if (selectedOption === questions[currentIndex].correctAnswer) {
      setScore(s => s + 10);
    }
  };
  
  // Auto-scroll to explanation when answer is checked
  useEffect(() => {
    if (isAnswerChecked) {
        setTimeout(() => {
            explanationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
  }, [isAnswerChecked]);

  const nextQuestion = () => {
    setSelectedOption(null);
    setIsAnswerChecked(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      // Scroll to top of question area
      document.getElementById('question-area')?.scrollTo(0,0);
    } else {
      setShowResult(true);
      if (onTaskComplete) onTaskComplete(); // Trigger Task XP
    }
  };

  const resetQuiz = () => {
    setCurrentTopic(null);
    setQuestions([]);
    setShowResult(false);
  };

  // Helper function to render options nicely (Flowchart support)
  const renderOptionContent = (text: string) => {
    if (text.includes('->')) {
      const steps = text.split('->').map(s => s.trim());
      return (
        <div className="flex flex-wrap items-center gap-2">
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              <span className="bg-white/60 px-2 py-1 rounded-md text-xs font-bold border border-slate-300 shadow-sm text-slate-700">
                {step}
              </span>
              {i < steps.length - 1 && (
                <span className="text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      );
    }
    return <span className="font-medium text-sm md:text-base leading-snug break-words">{text}</span>;
  };

  // 1. Topic Selection Screen
  if (!currentTopic) {
    return (
      <div className="p-6 pb-32 max-w-2xl mx-auto h-full overflow-y-auto relative no-scrollbar">
         {/* Background Pattern */}
         <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, slate-400 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>

        <div className={`relative bg-gradient-to-br from-${color}-500 to-${color}-700 rounded-3xl p-8 text-white mb-8 shadow-xl overflow-hidden`}>
           <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
           <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
           
           <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-3 border border-white/30">
                Quiz Mode
              </span>
              <h1 className="text-3xl font-extrabold mb-2 leading-tight">Thử Thách <br/> Trí Tuệ</h1>
              <p className="opacity-90 text-sm font-medium">Chọn chủ đề để khám phá những bí mật thú vị về Bến Thành!</p>
           </div>
        </div>
        
        <h2 className="font-bold text-slate-800 mb-4 px-1 text-lg flex items-center gap-2">
            <span className="w-1 h-6 rounded-full bg-slate-800"></span>
            Chủ đề khả dụng
        </h2>
        
        <div className="grid gap-4">
          {TOPICS.map((topic, idx) => (
            <button
              key={topic}
              onClick={() => startQuiz(topic)}
              style={{ animationDelay: `${idx * 50}ms` }}
              className={`group bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.08)] hover:border-${color}-200 transition-all duration-300 text-left flex justify-between items-center animate-fade-in-up active:scale-[0.98]`}
            >
              <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full bg-${color}-50 text-${color}-600 flex items-center justify-center text-lg group-hover:bg-${color}-100 transition-colors shadow-sm`}>
                    {idx + 1}
                  </div>
                  <span className="font-bold text-slate-700 group-hover:text-${color}-700 text-base">{topic}</span>
              </div>
              <div className={`w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-${color}-500 group-hover:text-white transition-all`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 2. Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 bg-slate-50/50">
        <div className="relative w-24 h-24 mb-6">
            <div className={`absolute inset-0 border-[6px] border-${color}-100 rounded-full`}></div>
            <div className={`absolute inset-0 border-[6px] border-${color}-500 rounded-full border-t-transparent animate-spin`}></div>
            <div className="absolute inset-0 flex items-center justify-center text-2xl">🧠</div>
        </div>
        <p className="text-slate-700 font-bold text-lg animate-pulse">Chú Ba đang soạn câu hỏi...</p>
        <p className="text-slate-400 text-sm mt-1">Đang tải dữ liệu lịch sử</p>
      </div>
    );
  }

  // 3. Result Screen
  if (showResult) {
    const isHighScore = score >= 20;
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center pb-32 relative overflow-hidden">
        {/* Background Confetti Effect */}
        <div className="absolute top-10 left-10 w-4 h-4 bg-red-400 rounded-full animate-bounce"></div>
        <div className="absolute top-20 right-20 w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="absolute bottom-32 left-20 w-5 h-5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>

        <div className={`relative w-32 h-32 mb-8`}>
            <div className={`absolute inset-0 bg-${color}-100 rounded-full animate-ping opacity-20`}></div>
            <div className={`relative w-full h-full bg-gradient-to-tr from-${color}-500 to-${color}-400 text-white rounded-full flex items-center justify-center shadow-xl shadow-${color}-200`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-14 h-14">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0V5.625a2.625 2.625 0 1 0-5.25 0v2.875M6.75 6.75h10.5" />
                </svg>
            </div>
        </div>

        <h2 className="text-4xl font-black text-slate-800 mb-2">{isHighScore ? 'Tuyệt Vời!' : 'Hoàn Thành!'}</h2>
        <p className="text-slate-500 mb-8 max-w-xs mx-auto">
            Bạn đã trả lời đúng <span className={`font-bold text-${color}-600`}>{score / 10}/{questions.length}</span> câu hỏi.
            {isHighScore ? ' Kiến thức của bạn về Bến Thành thật đáng nể!' : ' Hãy thử lại để đạt điểm cao hơn nhé!'}
        </p>
        
        <div className="w-full max-w-xs space-y-3">
            <button 
              onClick={resetQuiz}
              className={`w-full bg-${color}-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-${color}-200 hover:bg-${color}-700 transition-all active:scale-95`}
            >
              Chơi chủ đề khác
            </button>
            <button 
               onClick={() => startQuiz(currentTopic!)}
               className="w-full bg-white text-slate-600 border border-slate-200 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-95"
            >
               Thử lại chủ đề này
            </button>
        </div>
      </div>
    );
  }

  // 4. Question Interface
  if (questions.length === 0) {
     return <div className="p-6 text-center">Không thể tải câu hỏi. <button onClick={resetQuiz} className={`text-${color}-600 underline`}>Quay lại</button></div>
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Decorative Top Background */}
      <div className={`absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-${color}-50 via-${color}-50/50 to-transparent pointer-events-none`}></div>

      {/* Header Bar */}
      <div className="relative px-6 pt-6 pb-2 flex justify-between items-center z-10">
        <button onClick={resetQuiz} className="p-2 -ml-2 text-slate-400 hover:text-slate-800 bg-white/50 backdrop-blur rounded-full hover:bg-white transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="flex flex-col items-end">
             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Điểm số</span>
             <span className={`text-xl font-black text-${color}-600 leading-none`}>{score}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 mb-4 relative z-10">
        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
             <div 
                className={`h-full bg-${color}-500 transition-all duration-500 ease-out`} 
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
             ></div>
        </div>
        <div className="flex justify-between mt-1.5">
             <span className="text-[10px] font-bold text-slate-400">Câu {currentIndex + 1}</span>
             <span className="text-[10px] font-bold text-slate-400">Tổng {questions.length}</span>
        </div>
      </div>

      {/* Question Card Area - Added pb-40 to prevent button overlap */}
      <div id="question-area" className="flex-1 px-4 overflow-y-auto no-scrollbar relative z-10 max-w-2xl mx-auto w-full pb-40">
        {/* Question Text */}
        <div className="mb-6 animate-fade-in-up">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-relaxed tracking-tight">
            {currentQ.question}
            </h2>
        </div>

        {/* Options List */}
        <div className="space-y-3">
          {currentQ.options.map((option, idx) => {
            let containerClass = "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50";
            let circleClass = "bg-slate-100 text-slate-500 border-slate-200";
            let icon = <span className="font-bold text-sm">{String.fromCharCode(65 + idx)}</span>;
            
            if (isAnswerChecked) {
              if (idx === currentQ.correctAnswer) {
                containerClass = "border-green-500 bg-green-50 shadow-md shadow-green-100";
                circleClass = "bg-green-500 text-white border-green-500";
                icon = (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                );
              } else if (idx === selectedOption) {
                containerClass = "border-red-400 bg-red-50 opacity-90";
                circleClass = "bg-red-400 text-white border-red-400";
                icon = (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                );
              } else {
                containerClass = "border-slate-100 bg-slate-50 opacity-40 grayscale";
              }
            } else if (selectedOption === idx) {
              containerClass = `border-${color}-500 bg-${color}-50 shadow-md ring-1 ring-${color}-500`;
              circleClass = `bg-${color}-600 text-white border-${color}-600`;
            }

            return (
              <button
                key={idx}
                disabled={isAnswerChecked}
                onClick={() => handleOptionSelect(idx)}
                style={{ animationDelay: `${idx * 100}ms` }}
                className={`w-full p-4 rounded-2xl border-2 flex items-start gap-4 transition-all duration-200 animate-fade-in-up active:scale-[0.98] ${containerClass}`}
              >
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors mt-0.5 ${circleClass}`}>
                    {icon}
                </div>
                <div className="text-left flex-1 text-slate-700 leading-snug">
                    {renderOptionContent(option)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation Card */}
        {isAnswerChecked && (
          <div ref={explanationRef} className="mt-6 mb-4 bg-white rounded-2xl p-5 shadow-xl border border-blue-100 relative overflow-hidden animate-fade-in-up scroll-mt-20">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-blue-600"></div>
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0 text-xl">
                    💡
                </div>
                <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1 uppercase tracking-wide text-blue-600">Góc Chú Ba</h4>
                    <p className="text-slate-700 text-sm leading-relaxed">{currentQ.explanation}</p>
                </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Bottom Action Bar - Fixed floating above nav */}
      <div className="fixed bottom-20 left-0 w-full p-4 pointer-events-none z-30">
        <div className="max-w-2xl mx-auto pointer-events-auto">
             {!isAnswerChecked ? (
            <button
                disabled={selectedOption === null}
                onClick={checkAnswer}
                className={`w-full py-4 rounded-2xl font-bold text-white transition-all shadow-lg transform active:scale-95 text-lg ${
                selectedOption === null 
                    ? 'bg-slate-300 shadow-none cursor-not-allowed' 
                    : `bg-gradient-to-r from-${color}-500 to-${color}-600 shadow-${color}-200 ring-2 ring-white`
                }`}
            >
                Kiểm tra đáp án
            </button>
            ) : (
            <button
                onClick={nextQuestion}
                className={`w-full py-4 rounded-2xl font-bold text-white bg-slate-800 hover:bg-slate-900 shadow-xl shadow-slate-300 transform active:scale-95 flex items-center justify-center gap-2 ring-2 ring-white text-lg`}
            >
                {currentIndex < questions.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả'}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
            </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default QuizModule;