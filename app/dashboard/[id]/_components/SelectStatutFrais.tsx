"use client";

import { updateStatutFrais } from "@/app/action/frais";
import { useState } from "react";

// Les clés 'value' doivent correspondre EXACTEMENT à ton enum StatutFrais
const STATUS_OPTIONS = [
  { value: "EN_ATTENTE", label: "En attente", color: "text-orange-600 bg-orange-50 border-orange-100" },
  { value: "VALIDE", label: "Validé", color: "text-blue-600 bg-blue-50 border-blue-100" },
  { value: "REMBOURSE", label: "Remboursé", color: "text-green-600 bg-green-50 border-green-100" },
  { value: "REFUSE", label: "Refusé", color: "text-red-600 bg-red-50 border-red-100" },
];

export default function SelectStatut({ id, initialStatut, espaceId }: { id: string, initialStatut: string, espaceId: string }) {
  const [currentStatut, setCurrentStatut] = useState(initialStatut);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = async (newStatut: string) => {
    setIsLoading(true);
    setCurrentStatut(newStatut); 
    
    const res = await updateStatutFrais(id, newStatut, espaceId);
    
    if (!res.success) {
      alert("Erreur lors de la mise à jour");
      setCurrentStatut(initialStatut); // Retour à l'état précédent si erreur
    }
    setIsLoading(false);
  };

  const style = STATUS_OPTIONS.find(o => o.value === currentStatut) || STATUS_OPTIONS[0];

  return (
    <select
      value={currentStatut}
      disabled={isLoading}
      onChange={(e) => handleChange(e.target.value)}
      className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase border cursor-pointer outline-none transition-all appearance-none text-center ${style.color} ${isLoading ? 'opacity-50' : 'opacity-100'}`}
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-white text-slate-900">
          {opt.label}
        </option>
      ))}
    </select>
  );
}