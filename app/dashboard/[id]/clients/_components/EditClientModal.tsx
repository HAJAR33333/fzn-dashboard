"use client";

import { useState } from "react";
import { X, Save, ShieldCheck } from "lucide-react";
import { updateClientAction } from "@/app/action/client-actions";

export default function EditClientModal({ client, id }: { client: any, id: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-bold text-[10px] uppercase shadow-md shadow-amber-100 transition-all"
      >
        Compléter Profil
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header Modal */}
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-500 p-3 rounded-2xl">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase italic">Finaliser la fiche</h2>
                  <p className="text-slate-400 text-sm font-bold">{client.nom}</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={28} />
              </button>
            </div>

            {/* Formulaire */}
            <form action={async (formData) => {
              await updateClientAction(formData);
              setIsOpen(false);
            }} className="p-8 grid grid-cols-2 gap-5">
              <input type="hidden" name="clientId" value={client.id} />
              <input type="hidden" name="espaceId" value={id} />

              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Forme Juridique</label>
                <input name="formeJuridique" required placeholder="Ex: SAS, Auto-entrepreneur" className="w-full p-3 bg-slate-50 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-600" />
              </div>

              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">SIRET</label>
                <input name="siret" required placeholder="14 chiffres" className="w-full p-3 bg-slate-50 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-600" />
              </div>

              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Prénom Dirigeant</label>
                <input name="contactPrenom" required className="w-full p-3 bg-slate-50 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-600" />
              </div>

              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nom Dirigeant</label>
                <input name="contactNom" required className="w-full p-3 bg-slate-50 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-600" />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Adresse Complète</label>
                <input name="adresse" required className="w-full p-3 bg-slate-50 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-600" />
              </div>

              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Code Postal</label>
                <input name="codePostal" required className="w-full p-3 bg-slate-50 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-600" />
              </div>

              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Ville</label>
                <input name="ville" required className="w-full p-3 bg-slate-50 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-600" />
              </div>

              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Téléphone</label>
                <input name="telephone" required className="w-full p-3 bg-slate-50 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-600" />
              </div>

              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Statut</label>
                <select name="statutClient" className="w-full p-3 bg-slate-50 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-600">
                  <option value="CLIENT_ACTIF">Client Actif</option>
                  <option value="PROSPECT">Prospect</option>
                </select>
              </div>

              <button type="submit" className="col-span-2 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100">
                <Save size={20} /> Valider et débloquer la facturation
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}