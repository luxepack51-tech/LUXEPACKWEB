import React from 'react';
import { Sparkles, ShoppingBag, PhoneCall } from 'lucide-react';
import { StoreSettings, Package, Perfume } from '../../types/storefront';

interface HeaderProps {
  settings: StoreSettings;
  selectedPackage: Package | null;
  selectedPerfumes: Perfume[];
  onScrollToSection: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  selectedPackage,
  selectedPerfumes,
  onScrollToSection
}) => {
  const perfumesNeeded = selectedPackage ? selectedPackage.perfumes_count : 0;
  const isComplete = selectedPackage && selectedPerfumes.length === perfumesNeeded;

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-amber-500/20 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-0.5 shadow-lg shadow-amber-500/10">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 bg-clip-text text-transparent tracking-wide">
              {settings.store_name}
            </h1>
            <p className="text-[10px] sm:text-xs text-amber-200/70 font-medium">متجر العطور الفاخرة بالجزائر 🇩🇿</p>
          </div>
        </div>

        {/* Center / Right actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Active selection mini badge */}
          {selectedPackage && (
            <button
              onClick={() => onScrollToSection('perfumes')}
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                isComplete 
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
                  : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>
                {selectedPerfumes.length} / {perfumesNeeded} عطور
              </span>
              {isComplete && <span className="bg-emerald-500 text-zinc-950 text-[10px] px-1.5 py-0.2 rounded-full font-bold">مكتمل ✓</span>}
            </button>
          )}

          {/* Direct phone / whatsapp helper */}
          {settings.phone_number && (
            <a
              href={`tel:${settings.phone_number}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-amber-400 text-xs font-medium transition-colors"
              title="اتصل بنا مباشرة"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">{settings.phone_number}</span>
            </a>
          )}
        </div>
      </div>
    </header>
  );
};
