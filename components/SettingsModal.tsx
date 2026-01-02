import React, { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../constants';
import { X, Save, Key, Scroll } from 'lucide-react';
import { initGoogleApi } from '../services/googleService';
import { HouseTheme } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  theme?: HouseTheme;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose, theme }) => {
  const [clientId, setClientId] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.CLIENT_ID);
    if (stored) setClientId(stored);
  }, [isOpen]);

  const handleSave = async () => {
    try {
      localStorage.setItem(STORAGE_KEYS.CLIENT_ID, clientId);
      await initGoogleApi(clientId);
      setStatus('success');
      setTimeout(() => {
          setStatus('idle');
          onClose();
      }, 1000);
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  };

  if (!isOpen) return null;

  const cardBg = theme ? theme.colors.cardBg : 'bg-[#f5e6d3]';
  const cardBorder = theme ? theme.colors.cardBorder : 'border-[#740001]';
  const primaryColor = theme ? theme.colors.primary : 'bg-red-900';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in">
      <div className={`${cardBg} rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] p-1 w-full max-w-md mx-4 transform transition-all scale-100 animate-slide-up border-4 ${cardBorder}`}>
        {/* Inner Parchment Border */}
        <div className="border border-[#2c1810]/20 rounded-lg p-6 h-full relative overflow-hidden">
             {/* Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-50 pointer-events-none mix-blend-multiply"></div>

            <div className="flex justify-between items-center mb-6 relative z-10">
            <h2 className="text-2xl font-bold text-[#2c1810] flex items-center gap-2 font-magic tracking-wider">
                <Scroll className="w-6 h-6" />
                魔法部設定
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-[#2c1810]/10 rounded-full text-[#2c1810]">
                <X className="w-6 h-6" />
            </button>
            </div>

            <div className="space-y-6 relative z-10">
            <div>
                <label className="block text-sm font-bold text-[#5c4d3c] mb-2 uppercase tracking-wide">
                Google Client ID (魔法連結鑰匙)
                </label>
                <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Enter your OAuth 2.0 Client ID"
                className="w-full bg-white/50 border-2 border-[#2c1810]/30 rounded-lg px-4 py-3 text-sm focus:border-[#2c1810] outline-none text-[#2c1810] placeholder-[#2c1810]/30 font-mono shadow-inner"
                />
                <p className="text-xs text-[#8c7d6c] mt-2 italic">
                * 用於解鎖 Google Drive 卷軸與 Sheets 魔法帳本功能。
                </p>
            </div>
            
            {status === 'success' && (
                <div className="p-3 bg-green-900/10 text-green-800 rounded-lg text-sm font-bold border border-green-800/20 flex items-center gap-2">
                    <span className="text-xl">✨</span> 連結成功！魔力已流通。
                </div>
            )}
            
            {status === 'error' && (
                <div className="p-3 bg-red-900/10 text-red-800 rounded-lg text-sm font-bold border border-red-800/20">
                    連結失敗。請檢查您的咒語 (Client ID)。
                </div>
            )}

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-[#2c1810]/10">
                <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-bold text-[#5c4d3c] hover:bg-[#2c1810]/5 rounded-lg uppercase tracking-wide"
                >
                取消
                </button>
                <button
                onClick={handleSave}
                className={`px-6 py-2 text-sm font-bold text-white ${primaryColor} hover:brightness-110 rounded-lg flex items-center gap-2 shadow-lg transition-all active:scale-95`}
                >
                <Save className="w-4 h-4" />
                儲存並連結
                </button>
            </div>
            </div>
        </div>
      </div>
    </div>
  );
};