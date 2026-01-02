import React, { useState } from 'react';
import { X, UserPlus, Wand2, Mail } from 'lucide-react';
import { addCollaborator } from '../services/googleService';
import { HouseTheme } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  fileId?: string;
  theme: HouseTheme;
}

export const ShareModal: React.FC<Props> = ({ isOpen, onClose, fileId, theme }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handleInvite = async () => {
    if (!email || !fileId) return;
    setStatus('sending');
    try {
      await addCollaborator(fileId, email);
      setStatus('success');
      setTimeout(() => {
        setStatus('idle');
        setEmail('');
        onClose();
      }, 1500);
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in">
      <div className={`${theme.colors.cardBg} rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] p-1 w-full max-w-md mx-4 transform transition-all scale-100 animate-slide-up border-4 ${theme.colors.cardBorder}`}>
        <div className="border border-[#2c1810]/20 rounded-lg p-6 h-full relative overflow-hidden">
             {/* Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-50 pointer-events-none mix-blend-multiply"></div>

            <div className="flex justify-between items-center mb-6 relative z-10">
                <h2 className="text-2xl font-bold text-[#2c1810] flex items-center gap-2 font-magic tracking-wider">
                    <UserPlus className="w-6 h-6" />
                    邀請協作
                </h2>
                <button onClick={onClose} className="p-1 hover:bg-[#2c1810]/10 rounded-full text-[#2c1810]">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="space-y-6 relative z-10">
                {!fileId ? (
                     <div className="p-4 bg-orange-100 text-orange-800 rounded-lg text-sm border border-orange-200">
                        <p className="font-bold mb-1">尚未同步到雲端</p>
                        <p>請先點擊「同步」按鈕產生魔法卷軸，才能邀請其他巫師。</p>
                     </div>
                ) : (
                    <div>
                        <label className="block text-sm font-bold text-[#5c4d3c] mb-2 uppercase tracking-wide">
                        巫師 Email
                        </label>
                        <div className="flex gap-2">
                             <div className="relative flex-1">
                                <Mail className="absolute left-3 top-3 w-4 h-4 text-[#2c1810]/50" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="wizard@hogwarts.edu"
                                    className="w-full bg-white/50 border-2 border-[#2c1810]/30 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-[#2c1810] outline-none text-[#2c1810] placeholder-[#2c1810]/30 font-mono"
                                />
                             </div>
                        </div>
                    </div>
                )}
                
                {status === 'success' && (
                    <div className="p-3 bg-green-900/10 text-green-800 rounded-lg text-sm font-bold border border-green-800/20 flex items-center gap-2">
                        <Wand2 className="w-4 h-4" /> 貓頭鷹已出發！
                    </div>
                )}
                
                {status === 'error' && (
                    <div className="p-3 bg-red-900/10 text-red-800 rounded-lg text-sm font-bold border border-red-800/20">
                        傳送失敗，請檢查 Email 或權限。
                    </div>
                )}

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[#2c1810]/10">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-bold text-[#5c4d3c] hover:bg-[#2c1810]/5 rounded-lg uppercase tracking-wide"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleInvite}
                        disabled={!fileId || status === 'sending'}
                        className={`px-6 py-2 text-sm font-bold text-white ${theme.colors.primary} hover:brightness-110 rounded-lg flex items-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {status === 'sending' ? '施法中...' : '發送邀請'}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};