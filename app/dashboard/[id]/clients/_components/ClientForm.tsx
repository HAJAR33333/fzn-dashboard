"use client";

import { createClient } from "@/app/action/client-actions";
import { useParams } from "next/navigation";
import { useFormState } from "react-dom";

export default function ClientForm() {
  const { id: espaceId } = useParams(); // Récupère l'ID de l'espace depuis l'URL
  const [state, formAction] = useFormState(createClient, null);

  return (
    <form action={formAction} className="bg-white p-8 rounded-[2rem] shadow-xl space-y-4">
      <input type="hidden" name="espaceId" value={espaceId} />
      
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1">Nom du Client</label>
        <input 
          name="nom" 
          placeholder="ex: Jean Dupont" 
          className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
        <input 
          name="email" 
          type="email" 
          placeholder="client@exemple.com" 
          className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <button className="w-full bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-700 transition-all">
        Enregistrer le Client
      </button>

      {state?.error && <p className="text-red-500 text-sm font-bold">{state.error}</p>}
    </form>
  );
}