import React, { useState, useEffect } from 'react';
import { FullTripData, HouseTheme, ChecklistItem } from '../types';
import { saveTripData } from '../services/storageService';
import { syncTripToSheet, requestAccessToken } from '../services/googleService';
import { ShareModal } from './ShareModal';
import { 
  ArrowLeft, Settings, Users, Share2, Coins, FileText, 
  MapPin, DollarSign, Calendar, ListChecks, 
  Receipt, BarChart3, Plus, Trash2, Edit2, 
  CheckCircle2, Circle, Utensils, ShoppingBag, Camera, Briefcase, Sparkles, Wand2
} from 'lucide-react';
import { PieChart, Pie, Legend, ResponsiveContainer, Cell, Tooltip as RechartsTooltip } from 'recharts';
import * as XLSX from 'xlsx';

interface Props {
  trip: FullTripData;
  theme: HouseTheme;
  onBack: () => void;
  onUpdate: (trip: FullTripData) => void;
}

type ViewMode = 'itinerary' | 'checklist' | 'expenses' | 'stats';

export const TripEditor: React.FC<Props> = ({ trip, theme, onBack, onUpdate }) => {
  const [currentTrip, setCurrentTrip] = useState<FullTripData>(trip);
  const [view, setView] = useState<ViewMode>('itinerary');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  const [selectedDayId, setSelectedDayId] = useState<string>(currentTrip.itinerary[0]?.id || '');
  const [checklistTab, setChecklistTab] = useState<'packing'|'shopping'|'food'|'sightseeing'>('packing');

  useEffect(() => {
    saveTripData(currentTrip);
    onUpdate(currentTrip);
  }, [currentTrip]);

  const getCategoryIcon = (cat?: string) => {
    switch(cat) {
        case 'food': return <Utensils className="w-4 h-4" />;
        case 'shopping': return <ShoppingBag className="w-4 h-4" />;
        case 'activity': return <Camera className="w-4 h-4" />;
        case 'lodging': return <MapPin className="w-4 h-4" />;
        case 'transport': return <Briefcase className="w-4 h-4" />;
        default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const calculateTotalExpense = () => {
    return currentTrip.expenses.reduce((acc, curr) => acc + curr.amount, 0);
  };

  const handleSync = async () => {
      try {
          const token = await requestAccessToken();
          const sheetId = await syncTripToSheet(currentTrip, token);
          const updated = { ...currentTrip, googleDriveFileId: sheetId };
          setCurrentTrip(updated);
          alert("同步成功！卷軸已更新。");
      } catch (e) {
          console.error(e);
          alert("同步失敗，請確認已登入魔法部。");
      }
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Itinerary Sheet
    const itineraryRows: any[] = [];
    currentTrip.itinerary.forEach(day => {
        day.activities.forEach(act => {
            itineraryRows.push({
                Date: day.date,
                Time: act.time,
                Activity: act.description,
                Location: act.location,
                Cost: act.cost,
                Payer: currentTrip.companions.find(m => m.id === act.payerId)?.name || 'Unknown'
            });
        });
    });
    const wsItinerary = XLSX.utils.json_to_sheet(itineraryRows);
    XLSX.utils.book_append_sheet(wb, wsItinerary, "行程");

    // Expenses Sheet
    const expenseRows = currentTrip.expenses.map(e => ({
        Date: e.date,
        Item: e.description,
        Amount: e.amount,
        Category: e.category,
        Payer: currentTrip.companions.find(m => m.id === e.payerId)?.name || e.payerId
    }));
    const wsExpenses = XLSX.utils.json_to_sheet(expenseRows);
    XLSX.utils.book_append_sheet(wb, wsExpenses, "費用");

    XLSX.writeFile(wb, `${currentTrip.tripSettings.title}_魔法卷軸.xlsx`);
  };

  const solveDebts = () => {
    const balances: Record<string, number> = {};
    currentTrip.companions.forEach(m => balances[m.id] = 0);

    currentTrip.expenses.forEach(exp => {
        if (exp.payerId !== 'ALL') {
             balances[exp.payerId] = (balances[exp.payerId] || 0) + exp.amount;
        }
        const share = exp.amount / exp.targets.length;
        exp.targets.forEach(tid => {
            balances[tid] = (balances[tid] || 0) - share;
        });
    });

    const debts: {from: string, to: string, amount: number}[] = [];
    const debtors = Object.entries(balances).filter(([_, bal]) => bal < -0.01).sort((a,b) => a[1] - b[1]);
    const creditors = Object.entries(balances).filter(([_, bal]) => bal > 0.01).sort((a,b) => b[1] - a[1]);

    let i = 0;
    let j = 0;

    while (i < creditors.length && j < debtors.length) {
        let credit = creditors[i][1];
        let debt = Math.abs(debtors[j][1]);
        let amount = Math.min(credit, debt);

        debts.push({
            from: debtors[j][0],
            to: creditors[i][0],
            amount: Math.round(amount)
        });

        creditors[i][1] -= amount;
        debtors[j][1] += amount;

        if (creditors[i][1] < 0.01) i++;
        if (Math.abs(debtors[j][1]) < 0.01) j++;
    }

    return debts;
  };

  // --- Magic Components ---

  const MagicBackground = () => (
    <>
      <div className="absolute inset-0 bg-black/10 animate-pulse pointer-events-none fixed"></div>
      <div className="fixed top-20 left-10 z-0 animate-snitch pointer-events-none opacity-60">
        <div className="relative">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-200 to-yellow-600 shadow-[0_0_15px_rgba(250,204,21,0.8)]"></div>
          <div className="absolute top-0 right-0 w-6 h-2 bg-white/50 rounded-full origin-left -translate-y-1 translate-x-2 animate-wings"></div>
        </div>
      </div>
      <div className="fixed top-1/2 right-10 z-0 opacity-20 pointer-events-none">
         <Sparkles className="w-32 h-32 text-white animate-twinkle" />
      </div>
    </>
  );

  const Header = () => (
    <div className={`backdrop-blur-md bg-black/30 border-b border-white/10 sticky top-0 z-40 shadow-lg text-white`}>
      <div className="flex items-center justify-between px-3 py-2 md:px-4 md:py-3">
         <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-colors shrink-0">
               <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="cursor-pointer hover:opacity-80 transition-opacity min-w-0">
               <h1 className="font-bold text-base md:text-lg leading-tight flex items-center gap-2 font-magic tracking-wide truncate">
                 <span className="truncate">{currentTrip.tripSettings.title}</span>
                 <Edit2 className="w-3 h-3 text-white/50 shrink-0" />
               </h1>
               <div className="text-xs text-white/60 flex items-center gap-2">
                 <span className="truncate">{new Date(currentTrip.tripSettings.startDate).toLocaleDateString()} - {new Date(currentTrip.tripSettings.endDate).toLocaleDateString()}</span>
                 <span className="bg-white/10 px-1.5 rounded border border-white/10 shrink-0">{currentTrip.itinerary.length} 天</span>
               </div>
            </div>
         </div>
         <div className="flex items-center gap-0 md:gap-1 text-white/80 shrink-0">
            <button title="貨幣設定" className="p-2 hover:bg-white/10 hover:text-white rounded-full transition-colors hidden sm:block"><Coins className="w-5 h-5" /></button>
            <button title="旅伴管理" className="p-2 hover:bg-white/10 hover:text-white rounded-full relative transition-colors">
                <Users className="w-5 h-5" />
                <span className={`absolute top-1 right-1 ${theme.colors.primary} text-white text-[10px] w-3 h-3 flex items-center justify-center rounded-full border border-white/20 shadow-sm`}>
                    {currentTrip.companions.length}
                </span>
            </button>
            <button 
                onClick={() => setIsShareModalOpen(true)}
                title="分享" 
                className="p-2 hover:bg-white/10 hover:text-white rounded-full transition-colors"
            >
                <Share2 className="w-5 h-5" />
            </button>
            <button title="設定" className="p-2 hover:bg-white/10 hover:text-white rounded-full transition-colors hidden sm:block"><Settings className="w-5 h-5" /></button>
            <div className="relative group">
               <button className="p-2 hover:bg-white/10 hover:text-white rounded-full transition-colors"><FileText className="w-5 h-5" /></button>
               <div className={`absolute right-0 top-full mt-2 w-48 ${theme.colors.cardBg} rounded-lg shadow-xl border-2 ${theme.colors.cardBorder} hidden group-hover:block p-1 overflow-hidden z-50`}>
                  <button onClick={handleSync} className="w-full text-left px-4 py-2 text-sm hover:bg-black/5 rounded text-indigo-900 font-medium font-magic">立即手動同步</button>
                  <button onClick={handleExportExcel} className="w-full text-left px-4 py-2 text-sm hover:bg-black/5 rounded text-[#2c1810]">匯出 Excel</button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );

  const BottomNav = () => (
    <div className="backdrop-blur-md bg-black/40 border-t border-white/10 fixed bottom-0 left-0 right-0 z-40 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-7xl mx-auto">
        {[
          { id: 'itinerary', label: '行程', icon: Calendar },
          { id: 'checklist', label: '清單', icon: ListChecks },
          { id: 'expenses', label: '費用', icon: Receipt },
          { id: 'stats', label: '統計', icon: BarChart3 },
        ].map(item => {
          const isActive = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewMode)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${isActive ? 'text-white scale-110' : 'text-white/40 hover:text-white/70'}`}
            >
              <div className={`relative ${isActive ? 'animate-bounce-slow' : ''}`}>
                 <item.icon className={`w-6 h-6 ${isActive ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : ''}`} />
                 {isActive && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_5px_white]"></div>}
              </div>
              <span className="text-[10px] font-medium font-magic tracking-wider">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  );

  const ItineraryView = () => {
    const day = currentTrip.itinerary.find(d => d.id === selectedDayId) || currentTrip.itinerary[0];
    
    return (
      <div className="pb-40 animate-fade-in">
         {/* Day Navigator */}
         <div className="backdrop-blur-sm bg-black/20 sticky top-[57px] md:top-[60px] z-30 border-b border-white/5 overflow-x-auto no-scrollbar">
            <div className="flex px-3 py-2 md:px-4 md:py-3 gap-2 md:gap-3 min-w-max">
               {currentTrip.itinerary.map((d) => {
                 const isSelected = d.id === selectedDayId;
                 return (
                   <button 
                     key={d.id}
                     onClick={() => setSelectedDayId(d.id)}
                     className={`flex flex-col items-center min-w-[56px] md:min-w-[64px] p-1.5 md:p-2 rounded-xl border-2 transition-all duration-300 relative overflow-hidden group ${
                       isSelected 
                         ? `${theme.colors.cardBg} border-white shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-105` 
                         : 'bg-black/40 border-white/10 text-white/60 hover:bg-black/60 hover:border-white/30'
                     }`}
                   >
                     <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-[#2c1810]' : ''}`}>Day {d.dayNumber}</span>
                     <span className={`text-lg md:text-xl font-bold font-magic ${isSelected ? 'text-[#740001]' : ''}`}>{new Date(d.date).getDate()}</span>
                     {isSelected && <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none"></div>}
                   </button>
                 );
               })}
            </div>
         </div>

         <div className="p-3 md:p-4 space-y-3 md:space-y-4 max-w-3xl mx-auto mt-2">
            {day?.activities.map((act, index) => {
               const isShadow = parseInt(act.time.split(':')[0]) >= 23; 
               return (
                 <div key={act.id} className={`relative flex gap-3 md:gap-4 ${isShadow ? 'opacity-70' : ''} animate-slide-up`} style={{animationDelay: `${index * 100}ms`}}>
                    <div className="flex flex-col items-center w-10 md:w-12 pt-1">
                       <span className="text-xs md:text-sm font-bold text-white/90 drop-shadow-md font-mono">{act.time}</span>
                       <div className="h-full w-0.5 bg-white/20 mt-2 shadow-[0_0_2px_rgba(255,255,255,0.2)]"></div>
                    </div>
                    
                    <div className={`flex-1 ${theme.colors.cardBg} rounded-xl p-3 md:p-4 shadow-[4px_4px_0px_rgba(0,0,0,0.2)] border-2 ${theme.colors.cardBorder} relative group hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,0.3)] transition-all duration-300`}>
                       {/* Parchment Texture Overlay */}
                       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-40 pointer-events-none mix-blend-multiply rounded-xl"></div>
                       
                       {isShadow && <div className="absolute -top-2 -right-2 bg-orange-600 text-white text-[10px] px-2 py-0.5 rounded-full z-10 shadow-sm border border-orange-400">跨夜</div>}
                       
                       <div className="relative z-10">
                          <div className="flex justify-between items-start">
                             <div>
                                <h4 className="font-bold text-[#2c1810] text-base md:text-lg font-magic">{act.description}</h4>
                                <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-[#5c4d3c] mt-1">
                                   <MapPin className="w-3 h-3" /> {act.location}
                                </div>
                             </div>
                             <div className="text-right">
                                <span className="block font-mono font-bold text-[#740001] text-sm md:text-base">${act.cost}</span>
                                <span className="text-[10px] text-[#5c4d3c] bg-black/5 px-1.5 py-0.5 rounded-full border border-black/5 uppercase tracking-wide">{act.category}</span>
                             </div>
                          </div>
                          {act.notes && (
                            <div className="relative mt-2 md:mt-3 pl-2 md:pl-3 border-l-2 border-[#2c1810]/20">
                               <p className="text-xs text-[#5c4d3c] italic font-serif leading-relaxed line-clamp-2 md:line-clamp-none">"{act.notes}"</p>
                            </div>
                          )}
                       </div>
                       
                       <div className="absolute right-2 bottom-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-20">
                           <button className="p-1.5 bg-white/80 rounded-full shadow hover:text-indigo-600 hover:scale-110 transition-transform"><Edit2 className="w-3 h-3" /></button>
                           <button className="p-1.5 bg-white/80 rounded-full shadow hover:text-red-600 hover:scale-110 transition-transform"><Trash2 className="w-3 h-3" /></button>
                       </div>
                    </div>
                 </div>
               );
            })}
            <button className="group w-full py-4 border-2 border-dashed border-white/30 rounded-xl text-white/60 font-medium hover:border-white/60 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2 mt-4 backdrop-blur-sm">
               <div className="p-1 rounded-full border border-white/30 group-hover:rotate-90 transition-transform duration-500">
                  <Plus className="w-4 h-4" />
               </div>
               <span className="font-magic tracking-wider">新增魔法行程</span>
            </button>
         </div>
      </div>
    );
  };

  const ChecklistView = () => {
    const getList = (): ChecklistItem[] => {
      if (checklistTab === 'packing') return currentTrip.packingList || [];
      if (checklistTab === 'shopping') return currentTrip.shoppingList || [];
      if (checklistTab === 'food') return currentTrip.foodList || [];
      if (checklistTab === 'sightseeing') return currentTrip.sightseeingList || [];
      return [];
    };

    const setList = (newList: ChecklistItem[]) => {
      const update = { ...currentTrip };
      if (checklistTab === 'packing') update.packingList = newList;
      else if (checklistTab === 'shopping') update.shoppingList = newList;
      else if (checklistTab === 'food') update.foodList = newList;
      else if (checklistTab === 'sightseeing') update.sightseeingList = newList;
      setCurrentTrip(update);
    };

    return (
     <div className="pb-40 pt-3 md:pt-4 px-3 md:px-4 max-w-2xl mx-auto animate-fade-in">
        <div className={`${theme.colors.cardBg} rounded-2xl p-1 shadow-lg border-2 ${theme.colors.cardBorder} flex mb-4 md:mb-6 relative overflow-hidden`}>
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-30 pointer-events-none mix-blend-multiply"></div>
           {['packing', 'shopping', 'food', 'sightseeing'].map(tab => {
             const isActive = checklistTab === tab;
             return (
              <button 
                key={tab} 
                onClick={() => setChecklistTab(tab as any)}
                className={`relative z-10 flex-1 py-1.5 md:py-2 text-xs md:text-sm font-medium rounded-xl transition-all duration-300 font-magic tracking-wide ${isActive ? 'bg-[#2c1810] text-[#f5e6d3] shadow-md scale-105' : 'text-[#5c4d3c] hover:bg-black/5'}`}
              >
                {tab === 'packing' && '行李'}
                {tab === 'shopping' && '購物'}
                {tab === 'food' && '美食'}
                {tab === 'sightseeing' && '景點'}
              </button>
             );
           })}
        </div>

        <div className="space-y-3">
           {getList().map((item: ChecklistItem, index) => (
             <div key={item.id} className={`${theme.colors.cardBg} p-3 md:p-4 rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,0.2)] border ${theme.colors.cardBorder} flex items-center gap-3 relative overflow-hidden group animate-slide-up`} style={{animationDelay: `${index * 50}ms`}}>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-30 pointer-events-none mix-blend-multiply"></div>
                <button 
                   className="relative z-10 transition-transform active:scale-90 p-1"
                   onClick={() => {
                      const list = getList();
                      const idx = list.findIndex(i => i.id === item.id);
                      const newList = [...list];
                      newList[idx] = { ...newList[idx], completed: !newList[idx].completed };
                      setList(newList);
                   }}
                >
                   {item.completed ? <CheckCircle2 className="w-6 h-6 text-green-700" /> : <Circle className="w-6 h-6 text-[#8c7d6c] group-hover:text-[#2c1810]" />}
                </button>
                <div className="flex-1 relative z-10">
                   <p className={`font-medium font-magic text-base md:text-lg ${item.completed ? 'text-[#8c7d6c] line-through decoration-2' : 'text-[#2c1810]'}`}>{item.text}</p>
                   {item.cost && <p className="text-xs text-[#5c4d3c] mt-1 font-mono">預算: ${item.cost}</p>}
                </div>
             </div>
           ))}
           <button className="flex items-center justify-center gap-2 text-white/70 font-medium p-3 hover:bg-white/10 rounded-xl w-full border border-white/20 border-dashed hover:border-white/50 transition-all font-magic">
              <Plus className="w-4 h-4" /> 新增項目
           </button>
        </div>
     </div>
    );
  };

  const ExpensesView = () => (
     <div className="pb-40 pt-3 md:pt-4 px-3 md:px-4 max-w-2xl mx-auto animate-fade-in">
        <div className={`${theme.colors.primary} text-white p-4 md:p-6 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.4)] mb-4 md:mb-6 relative overflow-hidden border-2 border-white/20`}>
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse"></div>
           <div className="relative z-10">
              <p className="text-white/60 text-xs md:text-sm font-magic tracking-widest uppercase">總支出 Total Spent</p>
              <h2 className="text-4xl md:text-5xl font-bold mt-2 font-mono tracking-tighter drop-shadow-lg">${calculateTotalExpense().toLocaleString()}</h2>
              <div className="mt-4 flex gap-2">
                 <span className="text-xs bg-black/30 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">TWD: ~{(calculateTotalExpense() * (currentTrip.currencySettings.exchangeRate || 1)).toLocaleString()}</span>
              </div>
           </div>
           <DollarSign className="absolute -right-6 -bottom-6 w-32 h-32 md:w-40 md:h-40 text-white/10 rotate-12" />
        </div>

        <h3 className="font-bold text-white/90 mb-4 px-2 font-magic tracking-wider text-base md:text-lg flex items-center gap-2">
            <Wand2 className="w-4 h-4" /> 消費紀錄
        </h3>
        <div className="space-y-3">
           {currentTrip.expenses.map((exp, index) => (
              <div key={exp.id} className={`${theme.colors.cardBg} p-3 md:p-4 rounded-xl shadow-md border ${theme.colors.cardBorder} flex items-center justify-between relative overflow-hidden animate-slide-up`} style={{animationDelay: `${index * 50}ms`}}>
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-30 pointer-events-none mix-blend-multiply"></div>
                 <div className="flex items-center gap-3 md:gap-4 relative z-10">
                    <div className={`p-2 md:p-3 rounded-full bg-[#2c1810]/5 text-[#2c1810]`}>
                       {getCategoryIcon(exp.category)}
                    </div>
                    <div>
                       <h4 className="font-bold text-[#2c1810] font-magic text-base md:text-lg line-clamp-1">{exp.description}</h4>
                       <p className="text-xs text-[#5c4d3c] font-medium">
                          {currentTrip.companions.find(m => m.id === exp.payerId)?.name || '未知'} 付款 • {exp.targets.length} 人分攤
                       </p>
                    </div>
                 </div>
                 <div className="text-right relative z-10 shrink-0 ml-2">
                    <p className="font-bold text-[#740001] font-mono text-base md:text-lg">${exp.amount}</p>
                    <p className="text-xs text-[#8c7d6c]">{exp.date}</p>
                 </div>
              </div>
           ))}
        </div>
        
        <button className={`fixed bottom-24 right-6 w-12 h-12 md:w-14 md:h-14 ${theme.colors.primary} text-white rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center hover:scale-110 hover:rotate-90 transition-all border-2 border-white/20 z-50`}>
           <Plus className="w-5 h-5 md:w-6 md:h-6" />
        </button>
     </div>
  );

  const StatsView = () => {
    const debts = solveDebts();
    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c'];

    return (
     <div className="pb-40 pt-3 md:pt-4 px-3 md:px-4 max-w-2xl mx-auto space-y-6 md:space-y-8 animate-fade-in">
        <div className={`${theme.colors.cardBg} p-4 md:p-6 rounded-2xl shadow-lg border-2 ${theme.colors.cardBorder} relative overflow-hidden`}>
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-30 pointer-events-none mix-blend-multiply"></div>
           <h3 className="font-bold text-[#2c1810] mb-4 flex items-center gap-2 relative z-10 font-magic text-lg md:text-xl">
              <Coins className="w-5 h-5 text-[#740001]" /> 結算建議 (Gringotts)
           </h3>
           {debts.length === 0 ? (
              <p className="text-center text-[#8c7d6c] py-4 md:py-8 italic relative z-10 text-sm md:text-base">帳目已平，沒有債務！</p>
           ) : (
              <div className="space-y-2 md:space-y-3 relative z-10">
                 {debts.map((d, i) => {
                    const fromName = currentTrip.companions.find(m => m.id === d.from)?.name;
                    const toName = currentTrip.companions.find(m => m.id === d.to)?.name;
                    return (
                       <div key={i} className="flex items-center justify-between bg-[#2c1810]/5 p-3 md:p-4 rounded-lg text-sm border border-[#2c1810]/10">
                          <div className="flex items-center gap-2">
                             <span className="font-bold text-[#740001] text-sm md:text-base">{fromName}</span>
                             <span className="text-[#5c4d3c] text-xs">應支付</span>
                             <span className="font-bold text-green-700 text-sm md:text-base">{toName}</span>
                          </div>
                          <span className="font-bold text-[#2c1810] font-mono text-base md:text-lg">${d.amount}</span>
                       </div>
                    );
                 })}
              </div>
           )}
        </div>

        <div className={`${theme.colors.cardBg} p-4 md:p-6 rounded-2xl shadow-lg border-2 ${theme.colors.cardBorder} h-80 md:h-96 relative overflow-hidden`}>
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-30 pointer-events-none mix-blend-multiply"></div>
           <h3 className="font-bold text-[#2c1810] mb-4 relative z-10 font-magic text-lg md:text-xl">消費類別佔比</h3>
           <div className="relative z-10 w-full h-full pb-8">
              <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                        data={[
                          {name: '交通', value: 400}, {name: '住宿', value: 300}, 
                          {name: '食物', value: 300}, {name: '購物', value: 200}
                        ]} 
                        cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}
                        dataKey="value"
                    >
                        {COLORS.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry} stroke="#f5e6d3" strokeWidth={2} />
                        ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{backgroundColor: '#f5e6d3', borderColor: '#740001', color: '#2c1810', borderRadius: '8px'}} />
                    <Legend iconType="diamond" wrapperStyle={{fontSize: '12px'}} />
                  </PieChart>
              </ResponsiveContainer>
           </div>
        </div>
     </div>
    );
  };

  return (
    <div className={`min-h-screen ${theme.colors.background} transition-colors duration-1000 relative overflow-hidden font-sans flex flex-col`}>
       <MagicBackground />
       <Header />
       <div className="flex-1 overflow-y-auto z-10 relative scroll-smooth">
          {view === 'itinerary' && <ItineraryView />}
          {view === 'checklist' && <ChecklistView />}
          {view === 'expenses' && <ExpensesView />}
          {view === 'stats' && <StatsView />}
       </div>
       <BottomNav />
       
       <ShareModal 
         isOpen={isShareModalOpen}
         onClose={() => setIsShareModalOpen(false)}
         fileId={currentTrip.googleDriveFileId}
         theme={theme}
       />
    </div>
  );
};