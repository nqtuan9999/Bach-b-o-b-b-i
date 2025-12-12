import React, { useState, useEffect, Suspense } from 'react';
import { AppMode, AppSettings, UserState, Quest } from './types';
import Navigation from './components/Navigation';
import SettingsModal from './components/SettingsModal';

// Lazy load components
const TopicExplorer = React.lazy(() => import('./components/TopicExplorer'));
const QuizModule = React.lazy(() => import('./components/QuizModule'));
const GuideChat = React.lazy(() => import('./components/GuideChat'));
const GameHub = React.lazy(() => import('./components/GameHub'));

// Màn hình loading nội bộ cho Lazy components
const ComponentLoading = () => (
  <div className="h-full flex flex-col items-center justify-center p-6 space-y-4">
    <div className="w-8 h-8 border-2 border-teal-500 rounded-full border-t-transparent animate-spin"></div>
  </div>
);

// Màn hình Splash Screen giả lập 5 giây
const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Khởi động hệ thống...');

  useEffect(() => {
    const duration = 3500; // Giảm xuống 3.5 giây cho nhanh hơn chút
    const intervalTime = 50;
    const steps = duration / intervalTime;
    
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newProgress = Math.min((currentStep / steps) * 100, 100);
      setProgress(newProgress);

      if (newProgress > 10 && newProgress < 30) setMessage('Đang kết nối vệ tinh Bến Thành...');
      else if (newProgress >= 30 && newProgress < 60) setMessage('Tải dữ liệu lịch sử & kinh tế...');
      else if (newProgress >= 60 && newProgress < 90) setMessage('Hiệu chỉnh AI Chú Ba...');
      else if (newProgress >= 90) setMessage('Hoàn tất! Chào mừng bạn.');

      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(onFinish, 200); 
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div className="absolute inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center text-white px-8">
      <div className="mb-8 relative">
        <div className="w-24 h-24 bg-gradient-to-tr from-teal-400 to-blue-600 rounded-2xl rotate-45 animate-pulse absolute top-0 left-0 blur-xl opacity-50"></div>
        <div className="w-24 h-24 bg-white rounded-2xl rotate-45 flex items-center justify-center relative z-10 shadow-2xl">
           <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-teal-600 to-blue-600 -rotate-45">BT</span>
        </div>
      </div>
      
      <h1 className="text-2xl font-bold mb-2 tracking-tight">Ben Thanh Explorer</h1>
      <p className="text-slate-400 text-sm mb-8 font-mono h-6">{message}</p>

      {/* Progress Bar */}
      <div className="w-full max-w-xs h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
        <div 
          className="h-full bg-gradient-to-r from-teal-400 to-blue-500 transition-all duration-75 ease-linear shadow-[0_0_10px_rgba(45,212,191,0.5)]"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="mt-2 text-xs text-slate-500 font-mono text-right w-full max-w-xs">
        {Math.round(progress)}%
      </div>
    </div>
  );
};

// --- Màn hình chọn chế độ (Mới) ---
const ModeSelectionScreen = ({ onSelect }: { onSelect: (mode: 'DESKTOP' | 'MOBILE') => void }) => {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-3 uppercase tracking-tight">
                        Chọn thiết bị của bạn
                    </h1>
                    <p className="text-slate-500 font-medium">Để ứng dụng hiển thị đẹp nhất, hãy cho chúng tôi biết bạn đang dùng thiết bị gì?</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 px-4">
                    {/* Desktop Mode Card */}
                    <button 
                        onClick={() => onSelect('DESKTOP')}
                        className="group relative bg-white border-2 border-slate-100 hover:border-emerald-500 p-8 rounded-[2rem] transition-all duration-300 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-emerald-100/50 hover:-translate-y-2 flex flex-col items-center text-center overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                        <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 group-hover:text-emerald-600 mb-3">Máy Tính / Laptop</h2>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Ứng dụng sẽ hiển thị trong một <strong>khung điện thoại giả lập</strong> ở giữa màn hình. Phù hợp khi bạn đang ngồi máy tính.
                        </p>
                    </button>

                    {/* Mobile Mode Card */}
                    <button 
                         onClick={() => onSelect('MOBILE')}
                         className="group relative bg-white border-2 border-slate-100 hover:border-blue-500 p-8 rounded-[2rem] transition-all duration-300 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-100/50 hover:-translate-y-2 flex flex-col items-center text-center overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-2 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                         <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 group-hover:text-blue-600 mb-3">Điện Thoại / Tablet</h2>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Ứng dụng sẽ hiển thị <strong>toàn màn hình</strong> để bạn dễ dàng vuốt chạm. Phù hợp khi bạn đang dùng smartphone.
                        </p>
                    </button>
                </div>
            </div>
        </div>
    );
};

const AppContent: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<AppMode>(AppMode.EXPLORE);
  const [showSettings, setShowSettings] = useState(false);
  const [showQuests, setShowQuests] = useState(false);
  
  // User State & Settings
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'teal',
    gradeLevel: 6,
    language: 'Vietnamese'
  });

  const [userState, setUserState] = useState<UserState>({
    xp: 0,
    level: 1,
    money: 1000,
    inventory: [],
    quests: [
      { id: 'q1', label: 'Đọc 1 bài Sử', target: 1, current: 0, completed: false, xpReward: 30 },
      { id: 'q2', label: 'Hoàn thành 1 Quiz', target: 1, current: 0, completed: false, xpReward: 30 }
    ]
  });

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleTaskComplete = (taskType: string) => {
    setUserState(prev => {
        let newXp = prev.xp;
        let questsChanged = false;

        const newQuests = prev.quests.map(q => {
            let matches = false;
            if (taskType === 'READ_TOPIC' && q.id === 'q1') matches = true;
            if (taskType === 'COMPLETE_QUIZ' && q.id === 'q2') matches = true;

            if (matches && !q.completed) {
                const newCurrent = q.current + 1;
                if (newCurrent >= q.target) {
                    newXp += q.xpReward;
                    questsChanged = true;
                    return { ...q, current: newCurrent, completed: true };
                }
                return { ...q, current: newCurrent };
            }
            return q;
        });

        if (!questsChanged) newXp += 5; 

        const nextLevelXp = prev.level * 100;
        let newLevel = prev.level;
        if (newXp >= nextLevelXp) {
            newLevel += 1;
        }

        return { ...prev, xp: newXp, level: newLevel, quests: newQuests };
    });
  };

  const renderContent = () => {
    switch (mode) {
      case AppMode.EXPLORE:
        return <TopicExplorer settings={settings} onTaskComplete={handleTaskComplete} />;
      case AppMode.QUIZ:
        return <QuizModule settings={settings} onTaskComplete={() => handleTaskComplete('COMPLETE_QUIZ')}/>; 
      case AppMode.CHAT:
        return <GuideChat settings={settings} />;
      case AppMode.GAME:
        return <GameHub />;
      default:
        return <TopicExplorer settings={settings} onTaskComplete={handleTaskComplete} />;
    }
  };

  const bgGradient = `from-${settings.theme}-50/80`;
  const textGradient = `from-${settings.theme}-600 to-${settings.theme}-500`;

  return (
    <>
      {loading && <SplashScreen onFinish={() => setLoading(false)} />}
      
      <div className={`flex flex-col h-full bg-slate-50 text-slate-900 w-full mx-auto overflow-hidden relative font-sans selection:bg-${settings.theme}-100`}>
        {/* Decorative Background Elements */}
        <div className={`absolute top-[-20%] left-[-20%] w-[140%] h-[60%] bg-gradient-to-b ${bgGradient} to-transparent pointer-events-none z-0`} />
        
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200/60 px-4 py-3 flex items-center justify-between shadow-sm transition-all duration-300 gap-2">
          
          {/* Brand & Level */}
          <div className="flex items-center gap-2 flex-1">
              <div className="relative w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 cursor-pointer" onClick={() => setShowQuests(!showQuests)}>
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                      {userState.quests.filter(q => !q.completed).length}
                  </div>
                  <span className="font-bold text-slate-700">LV.{userState.level}</span>
              </div>
              
              {/* XP Bar */}
              <div className="flex-1 max-w-[100px] flex flex-col justify-center">
                  <div className="flex justify-between text-[8px] font-bold text-slate-500 mb-0.5">
                      <span>XP</span>
                      <span>{userState.xp}/{userState.level * 100}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                          className={`h-full bg-gradient-to-r ${textGradient}`} 
                          style={{ width: `${Math.min(100, (userState.xp / (userState.level * 100)) * 100)}%` }}
                      ></div>
                  </div>
              </div>
          </div>
          
          <div className="flex items-center gap-1">
             <button 
                onClick={() => setMode(AppMode.GAME)}
                className="hidden md:block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold mr-2"
             >
                Tycoon: ${userState.money}
             </button>

             <button 
                onClick={() => setShowSettings(true)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.11v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.11V11.36c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
            </button>
          </div>
        </header>

        {/* Quest Widget Overlay */}
        {showQuests && (
            <div className="absolute top-16 right-4 z-50 w-64 bg-white rounded-xl shadow-xl border border-slate-100 p-4 animate-fade-in-up origin-top-right">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-slate-800">Nhiệm vụ hàng ngày</h3>
                    <button onClick={() => setShowQuests(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>
                <div className="space-y-3">
                    {userState.quests.map(q => (
                        <div key={q.id} className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${q.completed ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300'}`}>
                                {q.completed && "✓"}
                            </div>
                            <div className="flex-1">
                                <p className={`text-sm ${q.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{q.label}</p>
                                <div className="w-full bg-slate-100 h-1 mt-1 rounded-full">
                                    <div className="bg-amber-400 h-1 rounded-full transition-all" style={{ width: `${(q.current/q.target)*100}%` }}></div>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-amber-500">+{q.xpReward}XP</span>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 relative overflow-hidden z-10">
          <Suspense fallback={<ComponentLoading />}>
            {renderContent()}
          </Suspense>
        </main>

        {showSettings && (
          <SettingsModal 
            settings={settings} 
            updateSettings={updateSettings} 
            onClose={() => setShowSettings(false)}
            color={settings.theme}
          />
        )}

        <Navigation currentMode={mode} setMode={setMode} />
      </div>
    </>
  );
};

// Main App Container handles Responsive Layout based on User Selection
const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'UNSET' | 'DESKTOP' | 'MOBILE'>('UNSET');

  if (viewMode === 'UNSET') {
    return <ModeSelectionScreen onSelect={setViewMode} />;
  }

  // Chế độ Máy Tính: Có khung điện thoại, background đẹp
  if (viewMode === 'DESKTOP') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 md:p-8 font-sans overflow-hidden">
        {/* Desktop Background Art */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1555217851-6141535bd771?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center pointer-events-none blur-sm"></div>

        {/* Phone Frame Container */}
        <div className="w-full max-w-[420px] h-[850px] max-h-[90vh] bg-white rounded-[3rem] border-[12px] border-slate-800 shadow-2xl overflow-hidden relative shadow-slate-900/50 flex flex-col transition-all duration-500 animate-fade-in-up">
          {/* Notch/Camera */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-slate-800 rounded-b-2xl z-[100] pointer-events-none"></div>
          
          <AppContent />
        </div>
        
        {/* Helper Text */}
        <div className="absolute bottom-4 left-0 w-full text-center text-slate-500 text-sm font-medium tracking-wide">
          <button onClick={() => setViewMode('UNSET')} className="hover:text-white transition-colors underline opacity-60 hover:opacity-100">
             Quay lại chọn chế độ
          </button>
        </div>
      </div>
    );
  }

  // Chế độ Điện Thoại: Full màn hình, không padding
  return (
    <div className="h-screen w-screen bg-white font-sans overflow-hidden">
        <AppContent />
    </div>
  );
};

export default App;