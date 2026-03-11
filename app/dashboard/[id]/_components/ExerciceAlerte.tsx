"use client";

import { useState } from "react";
import { Info, Check, Settings2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import ModifierExerciceModal from "./ModifierExerciceModal";

export default function ExerciceAlerte({ 
  espaceId, 
  exercice 
}: { 
  espaceId: string, 
  exercice: any 
}) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  // Fonction pour formater la date pour l'affichage (ex: 01/01/2026)
  const formatDateLocale = (dateInput: any) => {
    if (!dateInput) return ".. / .. / ....";
    const date = new Date(dateInput);
    return date.toLocaleDateString('fr-FR');
  };

  const handleValider = () => {
    setLoading(true);
    // On retire le paramètre "nouveau" de l'URL pour masquer l'alerte
    router.push(`/dashboard/${espaceId}`);
    router.refresh();
    setLoading(false);
  };

  return (
    <>
      <div className="bg-blue-50 border-2 border-blue-200 p-6 md:p-8 rounded-[2.5rem] mb-10 animate-in fade-in slide-in-from-top-4 duration-500 shadow-xl shadow-blue-900/5">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Section Message Informationnel */}
          <div className="flex items-center gap-6">
            <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg shadow-blue-200 shrink-0">
              <Info size={32} />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">
                Exercice comptable actif
              </h2>
              <p className="text-slate-600 font-bold text-lg">
                Détails de votre période comptable actuelle :
              </p>
              {/* CORRECTION : On utilise les données réelles de l'objet exercice ici */}
              <p className="text-blue-700 font-black bg-blue-100/50 px-3 py-1 rounded-lg w-fit">
                Du {formatDateLocale(exercice?.dateDebut)} au {formatDateLocale(exercice?.dateFin)} (code {exercice?.code})
              </p>
            </div>
          </div>

          {/* Section Boutons */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button
              onClick={handleValider}
              disabled={loading}
              className="flex-1 lg:flex-none bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Check className="w-5 h-5" />}
              C'est noté
            </button>
            
            <button 
              type="button"
              onClick={() => setShowModal(true)}
              className="flex-1 lg:flex-none bg-white border-2 border-blue-200 hover:border-blue-600 text-blue-600 px-10 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Settings2 className="w-5 h-5" />
              Modifier
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <ModifierExerciceModal 
          exercice={exercice} 
          onClose={() => {
            setShowModal(false);
            router.refresh();
          }} 
        />
      )}
    </>
  );
}