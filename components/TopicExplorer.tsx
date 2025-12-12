import React, { useState, useEffect, useRef } from 'react';
import { Landmark, AppSettings } from '../types';
import { generateTopicContent } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

// Dữ liệu mẫu với hình ảnh chất lượng cao và ổn định hơn
const LANDMARKS: Landmark[] = [
  {
    id: 'cho-ben-thanh',
    name: 'Chợ Bến Thành',
    category: 'Economy',
    description: 'Biểu tượng thương mại sầm uất hơn 100 năm qua. "Trái tim" giao thương của Sài Gòn.',
    imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=800&auto=format&fit=crop',
    oldImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Saigon_-_Le_March%C3%A9_-_Ben-Thanh_-_Market_-_nguyentl.net.jpg/800px-Saigon_-_Le_March%C3%A9_-_Ben-Thanh_-_Market_-_nguyentl.net.jpg',
    audioText: 'Chợ Bến Thành, ban đầu nằm bên bờ sông Bến Nghé. Năm 1912, người Pháp xây chợ mới ở vị trí hiện tại. Đây là nơi giao thương sầm uất nhất, từ vải vóc, gia vị đến vàng bạc.'
  },
  {
    id: 'ga-metro-ben-thanh',
    name: 'Ga Ngầm Metro',
    category: 'Economy',
    description: 'Biểu tượng của sự hiện đại hóa. Giếng trời hoa sen lấy sáng tự nhiên độc đáo.',
    // Thay ảnh lỗi bằng ảnh ổn định từ Wikimedia/Unsplash
    imageUrl: 'https://images.unsplash.com/photo-1695642646395-65239a039755?q=80&w=800&auto=format&fit=crop', 
    audioText: 'Ga ngầm Bến Thành sâu 32 mét, là đầu mối của nhiều tuyến Metro. Điểm nhấn là giếng trời hình hoa sen lấy sáng tự nhiên, giúp tiết kiệm năng lượng.'
  },
  {
    id: 'bao-tang-my-thuat',
    name: 'Bảo tàng Mỹ thuật',
    category: 'History',
    description: 'Dinh thự của "Chú Hỏa" - một trong tứ đại phú hộ Sài Gòn xưa. Tuyệt tác Art Deco.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Ho_Chi_Minh_City_Fine_Arts_Museum_facade.jpg/800px-Ho_Chi_Minh_City_Fine_Arts_Museum_facade.jpg',
    audioText: 'Tòa nhà này từng là nhà của gia đình ông Hứa Bổn Hòa. Có 99 cánh cửa, là sự kết hợp tuyệt vời giữa kiến trúc Á và Âu. Giờ đây lưu giữ hàng ngàn tác phẩm nghệ thuật quý giá.'
  },
  {
    id: 'duong-le-loi',
    name: 'Đại lộ Lê Lợi',
    category: 'Culture',
    description: 'Con đường "vàng" của bất động sản. Nơi giao thoa giữa gánh hàng rong và hàng hiệu.',
    imageUrl: 'https://images.unsplash.com/photo-1555217851-6141535bd771?q=80&w=800&auto=format&fit=crop',
    audioText: 'Đại lộ Lê Lợi vừa được trả lại mặt bằng sau nhiều năm rào chắn thi công Metro. Giá thuê mặt bằng ở đây thuộc hàng đắt đỏ nhất Việt Nam.'
  }
];

interface TopicExplorerProps {
  settings: AppSettings;
  onTaskComplete: (taskType: string) => void;
}

const TopicExplorer: React.FC<TopicExplorerProps> = ({ settings, onTaskComplete }) => {
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);
  const [aiContent, setAiContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>('All');
  const [sliderValue, setSliderValue] = useState(50); // Cho Time Window
  const [isSpeaking, setIsSpeaking] = useState(false);
  const color = settings.theme;
  const detailRef = useRef<HTMLDivElement>(null);

  const handleSelect = async (landmark: Landmark) => {
    setSelectedLandmark(landmark);
    setLoading(true);
    setAiContent(''); 
    setSliderValue(50);
    
    // Smooth scroll happens after render in useEffect/setTimeout
    setTimeout(() => {
        detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    const content = await generateTopicContent(landmark.name, settings);
    setAiContent(content);
    setLoading(false);
    
    // Trigger task completion (Read a topic)
    setTimeout(() => onTaskComplete('READ_TOPIC'), 2000);
  };

  const toggleSpeech = (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = settings.language === 'Vietnamese' ? 'vi-VN' : 'en-US';
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // Stop speech when unmounting or changing topic
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [selectedLandmark]);

  const filteredLandmarks = filter === 'All' 
    ? LANDMARKS 
    : LANDMARKS.filter(l => l.category === filter);

  return (
    <div className="pb-32 h-full overflow-y-auto no-scrollbar bg-slate-50">
      
      {/* Intro Section - Fixed Layout (No overlapping issues) */}
      {!selectedLandmark && (
        <div className="flex flex-col gap-4 mb-6">
          {/* Hero Banner */}
          <div className={`relative w-full h-56 bg-gradient-to-br from-${color}-900 to-${color}-600 rounded-b-[2.5rem] shadow-xl overflow-hidden shrink-0`}>
             <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/city-fields.png')]"></div>
             {/* Decorative Circles */}
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
             
             <div className="absolute bottom-0 left-0 p-6 text-white w-full z-10">
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border border-white/20">Quận 1, TP.HCM</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black mb-2 leading-tight">Phường <br/> Bến Thành</h1>
                <p className="text-sm opacity-90 max-w-sm leading-relaxed font-medium">
                  "Trái tim" của Sài Gòn. Nơi hội tụ của lịch sử trăm năm và nhịp sống kinh tế tỷ đô.
                </p>
             </div>
          </div>
          
          {/* Quick Stats Cards - Placed nicely below banner */}
          <div className="px-5 -mt-8 z-20">
             <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
                <div className="bg-white p-4 rounded-2xl shadow-lg shadow-slate-200/50 min-w-[110px] flex flex-col items-center border border-slate-50">
                    <span className="text-2xl mb-1">🏛️</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Di tích</span>
                    <span className="font-bold text-slate-800 text-lg">10+</span>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-lg shadow-slate-200/50 min-w-[110px] flex flex-col items-center border border-slate-50">
                    <span className="text-2xl mb-1">💰</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Giá đất</span>
                    <span className="font-bold text-slate-800 text-lg">Top 1</span>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-lg shadow-slate-200/50 min-w-[110px] flex flex-col items-center border border-slate-50">
                    <span className="text-2xl mb-1">🍜</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Ẩm thực</span>
                    <span className="font-bold text-slate-800 text-lg">Đa dạng</span>
                </div>
             </div>
          </div>
        </div>
      )}

      <div className="px-5 max-w-2xl mx-auto">
        {/* Detail View Overlay */}
        {selectedLandmark && (
          <div ref={detailRef} className="mb-8 animate-fade-in-up pt-4">
            <button 
              onClick={() => setSelectedLandmark(null)}
              className="group flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 font-bold transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 w-fit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-1 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Quay lại danh sách
            </button>

            <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100">
              {/* Feature: Time Window (AR Simulation) */}
              <div className="relative h-72 w-full group overflow-hidden bg-slate-200 select-none">
                
                {/* Old Image (Background) */}
                <div 
                    className="absolute inset-0 bg-cover bg-center grayscale sepia-[0.3]"
                    style={{ backgroundImage: `url(${selectedLandmark.oldImageUrl || selectedLandmark.imageUrl})` }}
                >
                    <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-amber-200 border border-amber-500/50 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
                        🎞️ Quá Khứ (19xx)
                    </div>
                </div>

                {/* New Image (Foreground with clip-path) */}
                <div 
                    className="absolute inset-0 bg-cover bg-center will-change-[clip-path]"
                    style={{ 
                        backgroundImage: `url(${selectedLandmark.imageUrl})`,
                        clipPath: `polygon(${sliderValue}% 0, 100% 0, 100% 100%, ${sliderValue}% 100%)`
                    }}
                >
                     <div className="absolute top-4 right-4 bg-teal-600/90 backdrop-blur-md text-white border border-teal-400/50 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
                        📸 Hiện Tại (2024)
                    </div>
                </div>

                {/* Slider Control */}
                <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={sliderValue} 
                    onChange={(e) => setSliderValue(parseInt(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                />
                
                {/* Slider Line Indicator */}
                <div 
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(0,0,0,0.8)] z-20 pointer-events-none flex items-center justify-center"
                    style={{ left: `${sliderValue}%` }}
                >
                    <div className="w-10 h-10 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-slate-50 cursor-ew-resize">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 text-slate-700">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                        </svg>
                    </div>
                </div>
                
                {/* Instruction Overlay (fades out) */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[10px] px-3 py-1 rounded-full backdrop-blur pointer-events-none opacity-80">
                    Kéo để so sánh
                </div>
              </div>
              
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-start mb-6">
                    <h2 className="text-3xl font-black text-slate-800 leading-none">
                    {selectedLandmark.name}
                    </h2>
                    {/* Audio Guide Button */}
                    <button 
                        onClick={() => toggleSpeech(selectedLandmark.audioText || selectedLandmark.description)}
                        className={`p-3.5 rounded-full transition-all shadow-md active:scale-95 shrink-0 ml-4 ${isSpeaking ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        {isSpeaking ? (
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                            </svg>
                        )}
                    </button>
                </div>

                <div className="prose prose-slate prose-lg prose-p:text-slate-600 prose-headings:text-slate-800 max-w-none">
                  {loading ? (
                    <div className="space-y-4 animate-pulse">
                      <div className="h-4 bg-slate-100 rounded w-full"></div>
                      <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                      <div className="h-4 bg-slate-100 rounded w-4/6"></div>
                      <div className="h-20 bg-slate-50 rounded w-full mt-4"></div>
                    </div>
                  ) : (
                    <ReactMarkdown components={{
                        p: ({node, ...props}) => <p className="mb-4 text-justify leading-relaxed" {...props} />,
                        strong: ({node, ...props}) => <span className={`text-${color}-600 font-bold`} {...props} />
                    }}>{aiContent}</ReactMarkdown>
                  )}
                </div>

                {/* Feature: Economic Contrast */}
                {!loading && (
                    <div className="mt-8 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 shadow-inner">
                        <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2 text-lg">
                            <span className="text-2xl">⚖️</span> Góc nhìn Kinh tế
                        </h4>
                        <p className="text-slate-700 text-sm md:text-base leading-relaxed">
                            Khu vực này có sự chênh lệch giá trị rất lớn. Một mét vuông đất ở đây có thể trị giá hàng tỷ đồng, tương đương với doanh thu cả đời của một gánh hàng rong gần đó. Sự cộng sinh này tạo nên nét đặc trưng của Quận 1.
                        </p>
                    </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Filters & List */}
        {!selectedLandmark && (
          <>
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-slate-50/95 backdrop-blur py-3 z-30 border-b border-slate-100/50">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                 <span className="w-1.5 h-6 bg-slate-800 rounded-full"></span>
                 Địa điểm nổi bật
              </h3>
              <div className="flex gap-2">
                {['All', 'History', 'Economy'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${
                      filter === f 
                        ? `bg-${color}-600 text-white shadow-md shadow-${color}-200` 
                        : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {f === 'All' ? 'Tất cả' : f === 'History' ? 'Sử' : 'Kinh tế'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              {filteredLandmarks.map((landmark, index) => (
                <div 
                  key={landmark.id}
                  onClick={() => handleSelect(landmark)}
                  className="group relative bg-white rounded-3xl p-3 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:border-slate-200 transition-all duration-300 cursor-pointer active:scale-[0.98] flex gap-4 overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-28 h-28 shrink-0 rounded-2xl overflow-hidden relative shadow-sm">
                     <img 
                      src={landmark.imageUrl} 
                      alt={landmark.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                          // Fallback nếu ảnh lỗi
                          e.currentTarget.src = 'https://via.placeholder.com/150?text=BenThanh'; 
                      }}
                    />
                    {landmark.oldImageUrl && (
                        <div className="absolute bottom-1 left-1 right-1 bg-black/60 backdrop-blur-sm text-white text-[9px] py-1 rounded text-center font-bold tracking-wide">
                            So sánh Xưa/Nay
                        </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col justify-center flex-1 py-1 pr-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`w-2 h-2 rounded-full ${
                        landmark.category === 'History' ? 'bg-amber-400' :
                        landmark.category === 'Economy' ? 'bg-blue-400' : 'bg-rose-400'
                      }`}></span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {landmark.category}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-lg leading-tight mb-2 group-hover:text-teal-600 transition-colors">
                      {landmark.name}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed opacity-80">
                      {landmark.description}
                    </p>
                  </div>
                  
                  {/* Arrow Icon */}
                  <div className="flex items-center justify-center w-8 text-slate-300 group-hover:text-teal-500 transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Community Story Section */}
             <div className="mt-10 mb-6">
                <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                    <span className="text-xl">🗣️</span> Nhân chứng sống
                </h3>
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 rounded-full bg-slate-200 shrink-0 overflow-hidden ring-4 ring-slate-50">
                        <img src="https://randomuser.me/api/portraits/men/45.jpg" alt="Chú Tư" className="w-full h-full object-cover grayscale"/>
                    </div>
                    <div>
                         <div className="flex items-baseline gap-2 mb-1">
                             <span className="text-sm font-bold text-slate-800">Chú Tư Xe Ôm</span>
                             <span className="text-xs text-slate-400 font-medium">65 tuổi</span>
                         </div>
                        <p className="text-sm italic text-slate-600 leading-relaxed">
                            "Hồi xưa đường Lê Lợi cây xanh mát rượi, giờ toàn nhà cao tầng. Nhưng mà nhìn hiện đại, sang trọng, chú cũng mừng cho thành phố."
                        </p>
                    </div>
                </div>
             </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TopicExplorer;