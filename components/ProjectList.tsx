import React from 'react';
import { TripProject, HouseTheme } from '../types';
import { HOUSE_THEMES } from '../constants';
import { MapPin, Trash2, ArrowRight, Footprints, Sparkles, Scroll, CloudDownload, LogIn, LogOut, Plus } from 'lucide-react';
import { initGoogleApi, requestAccessToken, searchTripFiles } from '../services/googleService';
import { STORAGE_KEYS } from '../constants';

interface Props {
  projects: TripProject[];
  currentTheme: HouseTheme;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
  onThemeChange: (themeId: string) => void;
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

export const ProjectList: React.FC<Props> = ({ 
  projects, 
  onSelect, 
  onDelete, 
  onCreateNew, 
  currentTheme,
  onThemeChange,
  isLoggedIn,
  onLogin,
  onLogout
}) => {

  const handleCloudSync = async () => {
     if (!isLoggedIn) return;
     try {
       await requestAccessToken();
       const files = await searchTripFiles();
       if (files.length === 0) {
           alert("雲端中沒有找到相關的魔法卷軸 (TripSync 檔案)");
       } else {
           const fileList = files.map((f: any) => `- ${f.name}`).join('\n');
           alert(`找到以下卷軸：\n${fileList}\n\n(目前僅支援顯示，完整匯入功能正在開發中)`);
       }
     } catch (e) {
       console.error(e);
       alert("咒語失敗，請檢查魔法連結 (Client ID) 或網路連線");
     }
  };

  return (
    <div className={`min-h-screen ${currentTheme.colors.background} transition-colors duration-1000 relative overflow-hidden font-sans`}>
      
      {/* --- Ambient Animations --- */}
      <div className="absolute inset-0 bg-black/20 animate-pulse pointer-events-none"></div>
      <div className="fixed top-0 left-0 z-0 animate-snitch pointer-events-none">
        <div className="relative">
          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-yellow-200 to-yellow-600 shadow-[0_0_15px_rgba(250,204,21,0.6)]"></div>
          <div className="absolute top-0 right-0 w-8 h-3 bg-white/50 rounded-full origin-left -translate-y-1 translate-x-3 animate-wings"></div>
        </div>
      </div>
      <div className="fixed bottom-20 left-20 z-0 pointer-events-none flex flex-col gap-8 rotate-12 opacity-30">
        <Footprints className="text-white w-6 h-6 animate-footprint-1" />
        <Footprints className="text-white w-6 h-6 animate-footprint-2 ml-4" />
        <Footprints className="text-white w-6 h-6 animate-footprint-3" />
      </div>

      {/* --- Navbar --- */}
      <nav className="relative z-50 px-4 py-3 md:px-6 md:py-4 flex justify-between items-center backdrop-blur-sm bg-black/10 border-b border-white/10">
        <div className="flex items-center gap-2 md:gap-3">
          <div className={`p-1.5 md:p-2 rounded-lg ${currentTheme.colors.primary} shadow-lg`}>
            <Scroll className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-widest font-magic">𝐓𝐑𝐈𝐏</h1>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* House Switcher - Hidden on mobile, can be added to a menu later if needed */}
          <div className="hidden md:flex gap-1 bg-black/40 p-1 rounded-full border border-white/10">
            {Object.values(HOUSE_THEMES).map((house) => (
              <button
                key={house.id}
                onClick={() => onThemeChange(house.id)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                  currentTheme.id === house.id 
                    ? `bg-white text-black scale-110 shadow-lg` 
                    : 'text-white/50 hover:text-white hover:bg-white/10'
                }`}
                title={house.label}
              >
                {house.icon}
              </button>
            ))}
          </div>

          {/* Auth Status */}
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <button 
                onClick={handleCloudSync}
                className="flex items-center gap-2 px-2 py-1.5 md:px-3 bg-indigo-600/80 hover:bg-indigo-500 text-white text-xs md:text-sm rounded-lg border border-indigo-400/30 transition-all shadow-[0_0_10px_rgba(99,102,241,0.5)]"
              >
                <CloudDownload className="w-4 h-4" />
                <span className="hidden sm:inline">召喚雲端卷軸</span>
              </button>
              <button 
                onClick={onLogout}
                className="flex items-center gap-2 px-2 py-1.5 md:px-3 bg-emerald-900/80 text-emerald-100 text-xs md:text-sm rounded-lg border border-emerald-500/50 hover:bg-red-900/80 hover:border-red-500/50 transition-all group"
                title="登出"
              >
                <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80] group-hover:bg-red-500"></div>
                <span className="hidden sm:inline">巫師已登入</span>
                <LogOut className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2" />
              </button>
            </div>
          ) : (
            <button 
              onClick={onLogin}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs md:text-sm rounded-lg border border-slate-600 transition-all shadow-lg"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">登入魔法部</span>
              <span className="sm:hidden">登入</span>
            </button>
          )}
        </div>
      </nav>

      {/* --- Main Content --- */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-6 md:py-10">
        
        {/* Hero Section */}
        <div className="text-center mb-6 md:mb-10 animate-float">
           <h2 className={`text-3xl md:text-5xl font-bold ${currentTheme.colors.text} drop-shadow-md mb-2 md:mb-4 font-magic tracking-wider`}>
             您的魔法旅程
           </h2>
           <p className={`${currentTheme.colors.accent} text-base md:text-lg opacity-80`}>
             "{currentTheme.traits}"
           </p>
        </div>

        {/* Create Button */}
        <div className="flex justify-center mb-8">
           <button 
             onClick={onCreateNew}
             className="group relative px-6 py-3 md:px-8 md:py-4 bg-[#f5e6d3] text-[#2c1810] font-bold text-base md:text-lg rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:scale-105 transition-all duration-300 border-2 border-[#d4c5b0] overflow-hidden"
           >
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform"></div>
             <span className="flex items-center gap-2 md:gap-3">
               <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" />
               展開新冒險
               <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
             </span>
           </button>
        </div>

        {/* Project Grid - Modified for Horizontal Layout */}
        {projects.length === 0 ? (
          <div className="text-center py-12 md:py-20 bg-black/20 backdrop-blur-sm rounded-3xl border border-white/10 mx-auto max-w-2xl">
            <Scroll className="w-12 h-12 md:w-16 md:h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-lg md:text-xl text-white/70">尚未有任何卷軸</h3>
            <p className="text-white/40 mt-2 text-sm md:text-base">請點擊上方按鈕開始規劃</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-20">
            {projects.map(project => (
              <div 
                key={project.id}
                className={`group relative ${currentTheme.colors.cardBg} rounded-lg shadow-[4px_4px_0px_rgba(0,0,0,0.3)] md:shadow-[6px_6px_0px_rgba(0,0,0,0.3)] hover:shadow-[6px_6px_0px_rgba(0,0,0,0.4)] md:hover:shadow-[8px_8px_0px_rgba(0,0,0,0.4)] hover:-translate-y-1 hover:-translate-x-0.5 transition-all duration-300 cursor-pointer border-2 ${currentTheme.colors.cardBorder} overflow-hidden flex flex-row h-32 md:h-40`}
                onClick={() => onSelect(project.id)}
              >
                {/* Texture */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-30 pointer-events-none mix-blend-multiply"></div>

                {/* Cover - Left Side */}
                <div className="w-32 md:w-48 h-full relative border-r-2 border-[#4a3b2a]/20 shrink-0">
                  {project.coverImage ? (
                    <img src={project.coverImage} alt={project.destination} className="w-full h-full object-cover sepia-[.2] group-hover:sepia-0 transition-all duration-700" />
                  ) : (
                    <div className={`w-full h-full ${currentTheme.colors.secondary} flex items-center justify-center`}>
                       <span className="text-4xl md:text-5xl opacity-30 animate-pulse">{currentTheme.icon}</span>
                    </div>
                  )}
                  
                  {/* Delete Button (Hover) */}
                  <div className="absolute top-1 left-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                     <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
                      className="bg-black/70 hover:bg-red-900/90 text-white p-1.5 rounded-full backdrop-blur-sm transition-colors border border-white/20"
                      title="去去武器走 (刪除)"
                     >
                       <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                     </button>
                  </div>
                </div>

                {/* Content - Right Side */}
                <div className="flex-1 p-3 md:p-4 relative z-10 flex flex-col justify-between min-w-0">
                  <div>
                    <h3 className="text-lg md:text-2xl font-bold text-[#2c1810] font-magic mb-1 line-clamp-1 group-hover:text-red-900 transition-colors">
                      {project.name}
                    </h3>
                    
                    <div className="flex items-center gap-1.5 text-xs md:text-sm text-[#5c4d3c] font-bold line-clamp-1">
                      <MapPin className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
                      {project.destination || '未知的領域'}
                    </div>
                  </div>

                  <div className="flex items-end justify-between mt-1">
                     <div className="flex flex-col">
                        <span className="text-[10px] md:text-xs text-[#8c7d6c] font-mono">
                          {new Date(project.lastModified).toLocaleDateString()} 更新
                        </span>
                        <span className="text-xs md:text-sm font-bold text-[#5c4d3c] bg-[#4a3b2a]/10 px-1.5 py-0.5 md:px-2 md:py-1 rounded mt-1 inline-block w-max">
                          {new Date(project.startDate).toLocaleDateString()}
                        </span>
                     </div>

                    <span className={`text-xs md:text-sm font-bold ${currentTheme.id === 'slytherin' ? 'text-green-800' : 'text-red-800'} flex items-center gap-1 group-hover:gap-2 transition-all`}>
                      <span className="hidden sm:inline">打開卷軸</span> <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};