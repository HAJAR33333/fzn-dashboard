"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CalendarDays, ChevronDown, Check } from "lucide-react";

export default function ExerciceSwitcher({ 
  exercices, 
  exerciceActif 
}: { 
  exercices: string[], 
  exerciceActif: string 
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // L'affichage se base sur une priorité : URL > Base de données
  const [currentLabel, setCurrentLabel] = useState(searchParams.get("exercice") || exerciceActif);
  const [isOpen, setIsOpen] = useState(false);

  // Synchronisation forcée quand la base de données change (après modification)
  useEffect(() => {
    const urlParam = searchParams.get("exercice");
    
    // Si l'exercice dans l'URL n'existe plus dans la liste (car renommé) 
    // ou si on vient de faire une modif, on force la nouvelle valeur
    if (!urlParam || !exercices.includes(urlParam)) {
      setCurrentLabel(exerciceActif);
      
      // Optionnel : on met à jour l'URL proprement pour éviter les décalages
      const params = new URLSearchParams(searchParams);
      params.set("exercice", exerciceActif);
      router.replace(`${pathname}?${params.toString()}`);
    } else {
      setCurrentLabel(urlParam);
    }
  }, [exerciceActif, exercices, searchParams, pathname, router]);

  const handleSelect = (annee: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("exercice", annee);
    router.push(`${pathname}?${params.toString()}`);
    setIsOpen(false);
  };

  return (
    <div className="relative mb-6">
      <p className="text-[10px] font-black uppercase text-slate-400 mb-3 ml-2 tracking-widest">
        Exercice Comptable
      </p>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-slate-50 border border-slate-200/50 p-3 rounded-2xl transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-xl shadow-sm group-hover:text-indigo-600">
            <CalendarDays size={18} className="text-indigo-600" />
          </div>
          {/* Ce label changera maintenant instantanément */}
          <span className="font-bold text-sm text-slate-700">Année {currentLabel}</span>
        </div>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden z-[60] animate-in fade-in slide-in-from-top-1">
          {exercices.map((ex) => (
            <button
              key={ex}
              onClick={() => handleSelect(ex)}
              className="w-full flex items-center justify-between p-4 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
            >
              {ex}
              {currentLabel === ex && <Check size={16} className="text-emerald-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}