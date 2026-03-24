"use client";

import { useState } from "react";
import { Building2, User, MapPin, Mail, Phone, ShieldCheck, Loader2 } from "lucide-react";
import { updateEspaceAction } from "@/app/action/espace";

export default function InformationSocieteModal({ espace }: { espace: any }) {
  const [isPending, setIsPending] = useState(false);

  const formesJuridiques = [
    "SARL", "EURL", "SAS", "SASU", "SA", "SNC", "EI", "Auto-entrepreneur", "Association"
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-indigo-600 p-8 text-white">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">Finaliser votre Espace</h2>
          <p className="text-indigo-100 text-sm">Veuillez renseigner les informations légales de <strong>{espace.nom}</strong></p>
        </div>

        <form action={async (formData) => {
          setIsPending(true);
          await updateEspaceAction(espace.id, formData);
          window.location.reload();
        }} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* SECTION 1: IDENTITÉ */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest">
              <Building2 size={14} /> Structure Légale
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="nom" defaultValue={espace.nom} placeholder="Dénomination sociale" className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold" required />
              <select name="formeJuridique" className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold" required>
                <option value="">Forme juridique...</option>
                {formesJuridiques.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          {/* SECTION 2: DIRIGEANT */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest">
              <User size={14} /> Dirigeant
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input name="dirigeantPrenom" placeholder="Prénom" className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold" required />
              <input name="dirigeantNom" placeholder="Nom" className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold" required />
            </div>
          </div>

          {/* SECTION 3: ADRESSE */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest">
              <MapPin size={14} /> Siège Social
            </div>
            <input name="adresse" placeholder="Adresse complète" className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold" required />
            <div className="grid grid-cols-3 gap-4">
              <input name="codePostal" placeholder="Code Postal" className="bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold" required />
              <input name="ville" placeholder="Ville" className="col-span-2 bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold" required />
            </div>
          </div>

          {/* SECTION 4: CONTACT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Email Pro</label>
              <input name="email" type="email" placeholder="contact@societe.fr" className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Téléphone</label>
              <input name="telephone" placeholder="01 02 03 04 05" className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none font-bold" required />
            </div>
          </div>

          <button disabled={isPending} className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-3">
            {isPending ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={20} /> Valider les informations</>}
          </button>
        </form>
      </div>
    </div>
  );
}