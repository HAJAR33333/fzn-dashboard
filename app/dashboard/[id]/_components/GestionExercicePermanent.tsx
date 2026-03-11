"use client";

import { useState } from "react";
import { Settings2 } from "lucide-react";
import ModifierExerciceModal from "./ModifierExerciceModal";

export default function GestionExercicePermanent({ exercice }: { exercice: any }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black text-slate-900 uppercase italic">Configuration de l'exercice</h3>
          <p className="text-sm text-slate-500 font-medium">Modifier les dates de votre période comptable actuelle.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-6 py-3 rounded-2xl font-black flex items-center gap-2 transition-all"
        >
          <Settings2 size={18} />
          Modifier les dates
        </button>
      </div>

      {showModal && (
        <ModifierExerciceModal 
          exercice={exercice} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </div>
  );
}