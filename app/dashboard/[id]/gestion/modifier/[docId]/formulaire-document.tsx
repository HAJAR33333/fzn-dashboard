"use client";

import { useState, useMemo } from "react";
import { updateDocument } from "@/app/action/facture-actions";
import { Plus, Trash2, Save, Loader2, Calculator, Percent } from "lucide-react";

export default function FormulaireDocument({ document, clients, espaceId }: any) {
  const [loading, setLoading] = useState(false);
  // Initialisation des lignes avec remise (0 par défaut) et tva (20 par défaut)
  const [lignes, setLignes] = useState(document.lignes.map((l: any) => ({
    ...l,
    remise: l.remise || 0,
    tva: l.tva || 20
  })));

  // --- CALCULS COMPLEXES EN TEMPS RÉEL ---
  const totaux = useMemo(() => {
    let totalBrutHT = 0;
    let totalRemise = 0;
    let totalTVA = 0;

    lignes.forEach((ligne: any) => {
      const qte = parseFloat(ligne.quantite) || 0;
      const pu = parseFloat(ligne.prixUnitaire) || 0;
      const remisePct = parseFloat(ligne.remise) || 0;
      const tvaPct = parseFloat(ligne.tva) || 0;

      const sousTotalLigneBrut = qte * pu;
      const montantRemiseLigne = sousTotalLigneBrut * (remisePct / 100);
      const sousTotalLigneApresRemise = sousTotalLigneBrut - montantRemiseLigne;
      const montantTVALigne = sousTotalLigneApresRemise * (tvaPct / 100);

      totalBrutHT += sousTotalLigneBrut;
      totalRemise += montantRemiseLigne;
      totalTVA += montantTVALigne;
    });

    const totalHTFinal = totalBrutHT - totalRemise;
    const totalTTC = totalHTFinal + totalTVA;

    return { totalBrutHT, totalRemise, totalHTFinal, totalTVA, totalTTC };
  }, [lignes]);

  const ajouterLigne = () => {
    setLignes([...lignes, { designation: "", quantite: 1, prixUnitaire: 0, remise: 0, tva: 20 }]);
  };

  const updateLigne = (index: number, field: string, value: any) => {
    const nouvellesLignes = [...lignes];
    nouvellesLignes[index][field] = value;
    setLignes(nouvellesLignes);
  };

  const supprimerLigne = (index: number) => {
    setLignes(lignes.filter((_: any, i: number) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    // On envoie les lignes enrichies (remise et tva) à l'action
    await updateDocument(document.id, formData, lignes, espaceId);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* SECTION : CLIENT */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest italic">Destinataire</label>
        <select 
          name="clientId" 
          defaultValue={document.clientId}
          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none"
          required
        >
          {clients.map((c: any) => (
            <option key={c.id} value={c.id}>{c.nom}</option>
          ))}
        </select>
      </div>

      {/* SECTION : LIGNES DÉTAILLÉES */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Articles & Services</label>
          <button type="button" onClick={ajouterLigne} className="bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-all border border-indigo-100">
            <Plus size={14} strokeWidth={3} /> Nouveau Poste
          </button>
        </div>

        <div className="space-y-3">
          {lignes.map((ligne: any, index: number) => (
            <div key={index} className="grid grid-cols-12 gap-3 items-start bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative group">
              
              {/* Désignation */}
              <div className="col-span-12 lg:col-span-4">
                <input 
                  placeholder="Désignation"
                  value={ligne.designation}
                  onChange={(e) => updateLigne(index, "designation", e.target.value)}
                  className="w-full bg-slate-50 border-transparent rounded-xl px-4 py-3 text-sm font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all"
                  required
                />
              </div>

              {/* Quantité */}
              <div className="col-span-3 lg:col-span-1">
                <label className="block text-[8px] font-black text-slate-300 uppercase mb-1 ml-1 text-center">Qté</label>
                <input 
                  type="number" 
                  value={ligne.quantite}
                  onChange={(e) => updateLigne(index, "quantite", e.target.value)}
                  className="w-full bg-slate-50 border-transparent rounded-xl px-2 py-3 text-sm font-black text-center outline-none focus:bg-white focus:border-indigo-500"
                  required
                />
              </div>

              {/* Prix Unitaire */}
              <div className="col-span-4 lg:col-span-2">
                <label className="block text-[8px] font-black text-slate-300 uppercase mb-1 ml-1 text-center">Prix Unit. HT</label>
                <input 
                  type="number" step="0.01"
                  value={ligne.prixUnitaire}
                  onChange={(e) => updateLigne(index, "prixUnitaire", e.target.value)}
                  className="w-full bg-slate-50 border-transparent rounded-xl px-3 py-3 text-sm font-black text-right outline-none focus:bg-white focus:border-indigo-500"
                  required
                />
              </div>

              {/* Remise % */}
              <div className="col-span-2 lg:col-span-2 text-indigo-500">
                <label className="block text-[8px] font-black text-indigo-300 uppercase mb-1 ml-1 text-center italic">Remise %</label>
                <div className="relative">
                    <input 
                        type="number"
                        value={ligne.remise}
                        onChange={(e) => updateLigne(index, "remise", e.target.value)}
                        className="w-full bg-indigo-50/30 border-transparent rounded-xl px-3 py-3 text-sm font-black text-center outline-none focus:bg-white focus:border-indigo-400"
                    />
                </div>
              </div>

              {/* TVA % */}
              <div className="col-span-2 lg:col-span-2 text-slate-500">
                <label className="block text-[8px] font-black text-slate-300 uppercase mb-1 ml-1 text-center italic">TVA %</label>
                <select 
                  value={ligne.tva}
                  onChange={(e) => updateLigne(index, "tva", e.target.value)}
                  className="w-full bg-slate-50 border-transparent rounded-xl px-2 py-3 text-sm font-black text-center outline-none focus:bg-white focus:border-indigo-500 appearance-none cursor-pointer"
                >
                    <option value="0">0%</option>
                    <option value="5.5">5.5%</option>
                    <option value="10">10%</option>
                    <option value="20">20%</option>
                </select>
              </div>

              {/* Supprimer */}
              <div className="col-span-1 flex justify-center pt-5">
                <button type="button" onClick={() => supprimerLigne(index)} className="text-slate-300 hover:text-red-500 p-2 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- RÉSUMÉ FINANCIER DÉTAILLÉ --- */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white space-y-6 shadow-2xl relative overflow-hidden">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <h3 className="font-black uppercase italic tracking-tighter text-indigo-400">Détails du calcul</h3>
          <Calculator size={20} className="text-slate-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-bold">Total Brut HT</span>
                    <span className="font-black">{totaux.totalBrutHT.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                </div>
                <div className="flex justify-between text-sm text-indigo-400">
                    <span className="font-bold italic">Total Remises</span>
                    <span className="font-black">- {totaux.totalRemise.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-white/5 font-black text-lg">
                    <span>Total Net HT</span>
                    <span>{totaux.totalHTFinal.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                </div>
            </div>

            <div className="space-y-3 bg-white/5 p-6 rounded-2xl">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-bold">Total TVA</span>
                    <span className="font-black text-emerald-400">+ {totaux.totalTVA.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-white/10">
                    <span className="text-indigo-400 font-black uppercase italic text-xl tracking-tighter">Net à payer TTC</span>
                    <span className="text-3xl font-black italic">{totaux.totalTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                </div>
            </div>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-[2rem] font-black shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
        Enregistrer les modifications
      </button>
    </form>
  );
}