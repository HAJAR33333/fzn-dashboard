// app/dashboard/[id]/_components/SpaceSwitcher.tsx
'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Building2, Check, Plus } from 'lucide-react';

export default function SpaceSwitcher({ espaces, currentId }: { espaces: any[], currentId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const currentSpace = espaces.find(e => e.id === currentId);

  return (
    <div className="relative mb-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-100 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Building2 size={18} />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Société active</p>
            <p className="text-sm font-black text-slate-900 truncate w-32">{currentSpace?.nom}</p>
          </div>
        </div>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 shadow-xl rounded-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
          <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mes espaces</p>

          {espaces.map((e) => (
            <button
              key={e.id}
              onClick={() => {
                router.push(`/dashboard/${e.id}`);
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50 transition-colors text-left"
            >
              <span className={`text-sm font-bold ${e.id === currentId ? 'text-blue-600' : 'text-slate-600'}`}>
                {e.nom}
              </span>
              {e.id === currentId && <Check size={14} className="text-blue-600" />}
            </button>
          ))}

          <div className="h-[1px] bg-slate-100 my-2" />

          <button
            onClick={() => router.push('/selection-espace/nouveau')}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <Plus size={14} /> Ajouter une société
          </button>
        </div>
      )}
    </div>
  );
}