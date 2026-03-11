"use client";

import { useState, useEffect } from "react";
import { modifierOuCreerExerciceAction } from "@/app/action/espace";
import { addMonths, subDays, format, getYear } from "date-fns";
import { Target, Info } from "lucide-react"; // Pour le style

export default function ModifierExerciceModal({ exercice, onClose }: any) {
  const [dateDebut, setDateDebut] = useState(
    exercice?.dateDebut ? format(new Date(exercice.dateDebut), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")
  );
  // ✅ État pour l'objectif (cible)
  const [objectif, setObjectif] = useState(exercice?.objectif || 50000);

  const [dateFinAuto, setDateFinAuto] = useState("");
  const [codeAuto, setCodeAuto] = useState("");

  useEffect(() => {
    if (dateDebut) {
      const debut = new Date(dateDebut);
      const fin = subDays(addMonths(debut, 12), 1);
      setDateFinAuto(format(fin, "yyyy-MM-dd"));
      setCodeAuto(getYear(fin).toString());
    }
  }, [dateDebut]);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600">
            <Target size={24} />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Configuration de l'exercice</h2>
        </div>

        <form action={modifierOuCreerExerciceAction} onSubmit={() => onClose()}>
          <input type="hidden" name="id" value={exercice?.id} />
          <input type="hidden" name="espaceId" value={exercice?.espaceId} />

          <div className="space-y-6">
            {/* DATE DE DÉBUT */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">Date de début</label>
              <input
                type="date"
                name="dateDebut"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* CIBLE DE L'EXERCICE (OBJECTIF CA) */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">Objectif de CA (€)</label>
              <div className="relative">
                <input
                  type="number"
                  name="objectif"
                  value={objectif}
                  onChange={(e) => setObjectif(e.target.value)}
                  placeholder="Ex: 50000"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 pl-12 font-black text-slate-900 focus:border-indigo-500 outline-none transition-all"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">€</span>
              </div>
            </div>

            {/* INFOS AUTO */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">Fin calculée</label>
                <div className="bg-indigo-50/50 border-2 border-indigo-100 text-indigo-600 rounded-2xl p-4 font-black text-center">
                  {dateFinAuto ? format(new Date(dateFinAuto), "dd/MM/yyyy") : "--/--/----"}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">Code</label>
                <div className="bg-emerald-50/50 border-2 border-emerald-100 text-emerald-600 rounded-2xl p-4 font-black text-center">
                  {codeAuto || "----"}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 items-start">
              <Info size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
                L’objectif de CA permet de calculer votre progression en temps réel sur le tableau de bord.
              </p>
            </div>

            {/* BOUTONS */}
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all">
                Annuler
              </button>
              <button type="submit" className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100">
                Enregistrer
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}