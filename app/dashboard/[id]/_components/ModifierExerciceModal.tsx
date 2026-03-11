"use client";

import { useState, useEffect } from "react";
import { modifierOuCreerExerciceAction } from "@/app/action/espace"; 
import { addMonths, subDays, format, getYear } from "date-fns";

export default function ModifierExerciceModal({ exercice, onClose }: any) {
  const [dateDebut, setDateDebut] = useState(
    exercice?.dateDebut ? format(new Date(exercice.dateDebut), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")
  );
  
  // États calculés automatiquement
  const [dateFinAuto, setDateFinAuto] = useState("");
  const [codeAuto, setCodeAuto] = useState("");

  // Calcul automatique dès que la date de début change
  useEffect(() => {
    if (dateDebut) {
      const debut = new Date(dateDebut);
      const fin = subDays(addMonths(debut, 12), 1);
      
      setDateFinAuto(format(fin, "yyyy-MM-dd"));
      setCodeAuto(getYear(fin).toString());
    }
  }, [dateDebut]);

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl">
        <h2 className="text-2xl font-black text-slate-900 mb-6">Paramétrer l'exercice</h2>
        
        <form action={modifierOuCreerExerciceAction} onSubmit={() => onClose()}>
          <input type="hidden" name="id" value={exercice?.id} />
          <input type="hidden" name="espaceId" value={exercice?.espaceId} />

          <div className="space-y-6">
            {/* DATE DE DÉBUT (Seul champ modifiable) */}
            <div>
              <label className="block text-sm font-black uppercase text-slate-400 mb-2 ml-1">Date de début</label>
              <input 
                type="date"
                name="dateDebut"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* AFFICHAGE DE LA DATE DE FIN (Lecture seule) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-black uppercase text-slate-400 mb-2 ml-1">Fin (Auto)</label>
                <div className="bg-indigo-50 border-2 border-indigo-100 text-indigo-600 rounded-2xl p-4 font-black">
                  {format(new Date(dateFinAuto || new Date()), "dd/MM/yyyy")}
                </div>
              </div>

              <div>
                <label className="block text-sm font-black uppercase text-slate-400 mb-2 ml-1">Code Exercice</label>
                <div className="bg-emerald-50 border-2 border-emerald-100 text-emerald-600 rounded-2xl p-4 font-black">
                  {codeAuto}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 italic">
              * Chaque exercice a un code unique, une date de début et de fin. L’exercice actif pilote les données affichées dans les autres vues (remboursements, facturation, compta).
            </p>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all">
                Annuler
              </button>
              <button type="submit" className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-200">
                Enregistrer
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}