"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Car, User as UserIcon, MapPin, Send, Building2, Calculator } from "lucide-react";
import { creerFraisKilometrique } from "@/app/action/frais";

const obtenirTauxIK = (puissance: number, distanceAnnuelle: number, isElectrique: boolean) => {
  let taux = 0.636; 
  if (distanceAnnuelle > 5000 && distanceAnnuelle <= 20000) taux = 0.539;
  if (distanceAnnuelle > 20000) taux = 0.409;
  return isElectrique ? taux * 1.2 : taux; 
};

interface Props {
  espaceId: string;
  societes: { id: string; nom: string }[];
  collaborateurs: { id: string; nom: string | null; prenom: string | null }[];
  clients: { id: string; nom: string }[];
}

export default function NouveauFraisModal({ espaceId, societes, collaborateurs, clients }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSociete, setSelectedSociete] = useState(societes?.length === 1 ? societes[0].id : espaceId);
  const [selectedUser, setSelectedUser] = useState(collaborateurs?.length === 1 ? collaborateurs[0].id : "");
  const [selectedClient, setSelectedClient] = useState(clients?.length === 1 ? clients[0].id : "");
  
  const [distanceUnitaire, setDistanceUnitaire] = useState(0);
  const [isAllerRetour, setIsAllerRetour] = useState(true);
  const [puissance, setPuissance] = useState(5);
  const [carburant, setCarburant] = useState("ESSENCE");
  const [kmAnnuels, setKmAnnuels] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const distanceTrajet = isAllerRetour ? distanceUnitaire * 2 : distanceUnitaire;
  const tauxApplique = useMemo(() => obtenirTauxIK(puissance, kmAnnuels, carburant === "ELECTRIQUE"), [puissance, kmAnnuels, carburant]);
  const montantTotal = distanceTrajet * tauxApplique;

  // FIX: Handler pour éviter l'erreur de type sur 'action'
  const handleFormAction = async (formData: FormData) => {
    const res = await creerFraisKilometrique(formData);
    if (res.success) setIsOpen(false);
    else alert(res.error);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl font-bold shadow-xl flex items-center gap-2 transition-all hover:scale-105">
        <Car size={18} /> Créer un remboursement
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end p-0 md:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="relative bg-white w-full max-w-2xl h-full md:h-[95vh] md:rounded-[3rem] shadow-2xl overflow-y-auto">
              <div className="p-8 md:p-12 space-y-8">
                <div className="flex justify-between items-start">
                  <h2 className="text-3xl font-black text-slate-900 uppercase italic">Nouveau <br />Remboursement</h2>
                  <button onClick={() => setIsOpen(false)} className="p-3 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-500"><X size={24} /></button>
                </div>

                <form action={handleFormAction} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Inputs cachés pour envoyer les calculs au serveur */}
                  <input type="hidden" name="montantTotal" value={montantTotal} />
                  <input type="hidden" name="tauxApplique" value={tauxApplique} />
                  <input type="hidden" name="distance" value={distanceTrajet} />

                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-6 rounded-[2rem]">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Building2 size={12}/> Société *</label>
                      <select name="espaceId" value={selectedSociete} onChange={(e) => setSelectedSociete(e.target.value)} className="w-full bg-white p-3 rounded-xl font-bold text-sm shadow-sm border-none">
                        {societes.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><UserIcon size={12}/> Utilisateur *</label>
                      <select name="userId" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="w-full bg-white p-3 rounded-xl font-bold text-sm shadow-sm border-none">
                        <option value="">Sélectionner</option>
                        {collaborateurs.map(c => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><MapPin size={12}/> Client *</label>
                      <select name="clientId" value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} className="w-full bg-white p-3 rounded-xl font-bold text-sm shadow-sm border-none">
                        <option value="">Sélectionner</option>
                        {clients?.map(cl => <option key={cl.id} value={cl.id}>{cl.nom}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Date & Véhicule</label>
                    <input type="date" name="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl font-bold" />
                    <select 
                        className="w-full bg-slate-50 p-3 rounded-xl font-bold" 
                        // On utilise 'value' pour lier au state ou 'defaultValue' pour une valeur initiale fixe
                        value={puissance} 
                        onChange={(e) => setPuissance(Number(e.target.value))}
                        >
                        <option value="3">3 CV ou moins</option>
                        <option value="4">4 CV</option>
                        <option value="5">5 CV</option>
                        <option value="6">6 CV</option>
                        <option value="7">7 CV et plus</option>
                        </select>
                    <div className="flex gap-2">
                      {["ESSENCE", "ELECTRIQUE"].map(t => (
                        <button key={t} type="button" onClick={() => setCarburant(t)} className={`flex-1 p-2 rounded-lg text-[10px] font-black ${carburant === t ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}>{t}</button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Trajet</label>
                    <input type="number" onChange={(e) => setDistanceUnitaire(Number(e.target.value))} className="w-full bg-slate-50 p-3 rounded-xl font-bold" placeholder="Distance (km)" />
                    <button type="button" onClick={() => setIsAllerRetour(!isAllerRetour)} className={`w-full p-3 rounded-xl font-bold text-xs ${isAllerRetour ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100'}`}>
                      {isAllerRetour ? "Aller-Retour" : "Aller Simple"}
                    </button>
                    <input type="number" onChange={(e) => setKmAnnuels(Number(e.target.value))} className="w-full bg-slate-50 p-3 rounded-xl font-bold" placeholder="Cumul annuel km" />
                  </div>

                  <div className="md:col-span-2 bg-indigo-600 rounded-[2rem] p-8 text-white flex justify-between items-center shadow-xl">
                    <div>
                      <p className="text-[10px] font-black uppercase opacity-60">Montant total</p>
                      <div className="text-5xl font-black italic">{montantTotal.toFixed(2)} €</div>
                    </div>
                    <div className="text-right text-[10px] font-black uppercase border-l border-white/20 pl-8">
                      <p className="opacity-60">Distance : {distanceTrajet} km</p>
                      <p className="opacity-60">Taux : {tauxApplique.toFixed(3)} €/km</p>
                    </div>
                  </div>

                  <button type="submit" className="md:col-span-2 bg-slate-900 text-white p-5 rounded-2xl font-black uppercase italic tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                    <Send size={18} /> Valider le remboursement
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}