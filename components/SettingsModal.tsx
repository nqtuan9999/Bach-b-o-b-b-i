import React from 'react';
import { AppSettings, GradeLevel, ThemeColor } from '../types';

interface SettingsModalProps {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  onClose: () => void;
  color: string;
}

const LANGUAGES = [
  { code: 'Vietnamese', label: 'Tiếng Việt 🇻🇳' },
  { code: 'English', label: 'English 🇺🇸' },
  { code: 'French', label: 'Français 🇫🇷' },
  { code: 'Japanese', label: '日本語 🇯🇵' },
  { code: 'Korean', label: '한국어 🇰🇷' },
  { code: 'Chinese', label: '中文 🇨🇳' },
  { code: 'Spanish', label: 'Español 🇪🇸' },
  { code: 'Russian', label: 'Русский 🇷🇺' },
  { code: 'German', label: 'Deutsch 🇩🇪' },
  { code: 'Thai', label: 'ไทย 🇹🇭' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, updateSettings, onClose, color }) => {
  const colors: { id: ThemeColor; label: string; class: string }[] = [
    { id: 'teal', label: 'Teal', class: 'bg-teal-500' },
    { id: 'blue', label: 'Blue', class: 'bg-blue-500' },
    { id: 'rose', label: 'Rose', class: 'bg-rose-500' },
    { id: 'amber', label: 'Amber', class: 'bg-amber-500' },
    { id: 'violet', label: 'Violet', class: 'bg-violet-500' },
  ];

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in-up"
      style={{ animationDuration: '0.2s' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
        <div className={`p-4 flex justify-between items-center bg-${color}-600 text-white shrink-0`}>
          <h2 className="font-bold text-lg">Cài Đặt / Settings</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto">
          {/* Grade Level */}
          <div>
            <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-slate-700">Trình độ học vấn</label>
                <span className={`text-xs font-bold px-2 py-1 rounded bg-${color}-100 text-${color}-700`}>
                    Lớp {settings.gradeLevel}
                </span>
            </div>
            
            <input 
                type="range" 
                min="1" 
                max="12" 
                step="1"
                value={settings.gradeLevel}
                onChange={(e) => updateSettings({ gradeLevel: parseInt(e.target.value) as GradeLevel })}
                className={`w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-${color}-600`}
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1 font-medium">
                <span>Lớp 1</span>
                <span>Lớp 6</span>
                <span>Lớp 12</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 italic">
                {settings.gradeLevel <= 5 ? "Nội dung đơn giản, vui nhộn, nhiều hình ảnh." : 
                 settings.gradeLevel <= 9 ? "Nội dung vừa phải, giải thích rõ ràng." : 
                 "Nội dung chuyên sâu, phân tích chi tiết."}
            </p>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Ngôn Ngữ / Language</label>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => updateSettings({ language: lang.code })}
                  className={`py-2 px-3 rounded-lg text-sm font-medium border text-left flex items-center gap-2 transition-all ${
                    settings.language === lang.code
                     ? `bg-${color}-50 border-${color}-500 text-${color}-700 ring-1 ring-${color}-500`
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Color */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Giao diện / Theme</label>
            <div className="flex gap-3 justify-between">
              {colors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => updateSettings({ theme: c.id })}
                  className={`w-10 h-10 rounded-full ${c.class} transition-transform ${
                    settings.theme === c.id ? 'ring-4 ring-slate-200 scale-110 shadow-lg' : 'hover:scale-105'
                  }`}
                  aria-label={c.label}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center shrink-0">
          <p className="text-xs text-slate-400">AI sẽ tự động điều chỉnh nội dung theo cài đặt này.</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;