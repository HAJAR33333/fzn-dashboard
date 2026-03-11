"use client";

import { useState, useMemo } from "react";
import { Plus, Trash2, Save, ArrowLeft, AlertTriangle, Calculator } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createDevis } from "@/app/action/facture-actions";

export default function NouveauDevisForm({ clients, exerciceId }: { clients: any[], exerciceId: string }) {
  const { id: espaceId } = useParams();
  
  const clientsComplets = clients.filter(c => 
    c.formeJuridique && c.siret && c.adresse && c.telephone && c.contactNom
  );

  // Initialisation avec remise et tva par défaut
  const [lignes, setLignes] = useState([
    { designation: "", quantite: 1, prixUnitaire: 0, remise: 0, tva: 20 }
  ]);

  // --- CALCULS EN TEMPS RÉEL (useMemo) ---
  const totaux = useMemo(() => {
    let totalBrutHT = 0;
    let totalRemise = 0;
    let totalTVA = 0;

    lignes.forEach((l) => {
      const qte = Number(l.quantite) || 0;
      const pu = Number(l.prixUnitaire) || 0;
      const remisePct = Number(l.remise) || 0;
      const tvaPct = Number(l.tva) || 0;

      const sousTotalBrut = qte * pu;
      const montantRemise = sousTotalBrut * (remisePct / 100);
      const sousTotalNetHT = sousTotalBrut - montantRemise;
      const montantTVA = sousTotalNetHT * (tvaPct / 100);

      totalBrutHT += sousTotalBrut;
      totalRemise += montantRemise;
      totalTVA += montantTVA;
    });

    const totalHTFinal = totalBrutHT - totalRemise;
    const totalTTC = totalHTFinal + totalTVA;

    return { totalBrutHT, totalRemise, totalHTFinal, totalTVA, totalTTC };
  }, [lignes]);

  const ajouterLigne = () => {
    setLignes([...lignes, { designation: "", quantite: 1, prixUnitaire: 0, remise: 0, tva: 20 }]);
  };
  
  const majLigne = (index: number, champ: string, valeur: any) => {
    const nouvellesLignes = [...lignes];
    nouvellesLignes[index] = { ...nouvellesLignes[index], [champ]: valeur };
    setLignes(nouvellesLignes);
  };

  const supprimerLigne = (index: number) => {
    if (lignes.length > 1) {
      setLignes(lignes.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 bg-[#F8FAFF] min-h-screen">
      <Link 
        href={`/dashboard/${espaceId}/gestion`} 
        className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft size={18} /> Retour à la gestion commerciale
      </Link>

      <form 
        action={async (formData) => {
          await createDevis(formData, lignes, espaceId as string);
        }} 
        className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-slate-200 border border-white space-y-10"
      >
        <input type="hidden" name="exerciceId" value={exerciceId} />
        
        <div className="flex justify-between items-center border-b border-slate-50 pb-8">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">
            Nouveau Devis
          </h2>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Statut</p>
            <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">Brouillon</span>
          </div>
        </div>

        {/* SÉLECTION DU CLIENT */}
        <div className="space-y-3">
          <label className="block text-xs font-black uppercase text-slate-400 tracking-widest">Client destinataire</label>
          <select 
            name="clientId" 
            required 
            className="w-full md:w-1/2 p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-600 outline-none font-bold text-slate-700 transition-all"
          >
            {clientsComplets.length > 0 ? (
              <>
                <option value="">Choisir un client...</option>
                {clientsComplets.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </>
            ) : (
              <option value="">⚠️ Aucun client complet</option>
            )}
          </select>
          {clientsComplets.length === 0 && (
            <div className="flex items-center gap-2 text-amber-600 text-[10px] font-black uppercase bg-amber-50 p-3 rounded-xl border border-amber-100">
              <AlertTriangle size={14} />
              Finalisez une fiche client avant de créer un devis.
            </div>
          )}
        </div>

        {/* LIGNES D'ARTICLES */}
        <div className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Détails des prestations</label>
            <button 
              type="button" 
              onClick={ajouterLigne} 
              className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all border border-dashed border-indigo-200"
            >
              <Plus size={16} /> Ajouter une ligne
            </button>
          </div>
          
          <div className="space-y-4">
            {lignes.map((ligne, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-end bg-slate-50/50 p-5 rounded-[2rem] border border-slate-50 relative group shadow-sm hover:shadow-md transition-all">
                
                {/* Désignation */}
                <div className="col-span-12 lg:col-span-4">
                  <p className="text-[9px] font-black text-slate-400 mb-1 ml-1 uppercase italic">Désignation</p>
                  <input 
                    placeholder="Ex: Prestation de service..." 
                    value={ligne.designation} 
                    onChange={(e) => majLigne(index, 'designation', e.target.value)}
                    className="w-full p-3 bg-white rounded-xl outline-none border border-slate-100 focus:border-indigo-600 font-bold transition-all shadow-inner" 
                    required
                  />
                </div>

                {/* Quantité */}
                <div className="col-span-3 lg:col-span-1">
                  <p className="text-[9px] font-black text-slate-400 mb-1 ml-1 uppercase text-center italic">Qté</p>
                  <input 
                    type="number" 
                    value={ligne.quantite} 
                    onChange={(e) => majLigne(index, 'quantite', e.target.value)}
                    className="w-full p-3 bg-white rounded-xl outline-none border border-slate-100 focus:border-indigo-600 font-black text-center shadow-inner" 
                    required
                  />
                </div>

                {/* Prix Unitaire */}
                <div className="col-span-5 lg:col-span-2">
                  <p className="text-[9px] font-black text-slate-400 mb-1 ml-1 uppercase text-center italic">PU HT (€)</p>
                  <input 
                    type="number" 
                    step="0.01"
                    value={ligne.prixUnitaire} 
                    onChange={(e) => majLigne(index, 'prixUnitaire', e.target.value)}
                    className="w-full p-3 bg-white rounded-xl outline-none border border-slate-100 focus:border-indigo-600 font-black text-right shadow-inner" 
                    required
                  />
                </div>

                {/* Remise % */}
                <div className="col-span-4 lg:col-span-2">
                  <p className="text-[9px] font-black text-indigo-400 mb-1 ml-1 uppercase text-center italic">Remise %</p>
                  <input 
                    type="number" 
                    value={ligne.remise} 
                    onChange={(e) => majLigne(index, 'remise', e.target.value)}
                    className="w-full p-3 bg-indigo-50/50 rounded-xl outline-none border border-indigo-100 focus:border-indigo-600 font-black text-center text-indigo-600 shadow-inner" 
                  />
                </div>

                {/* TVA % */}
                <div className="col-span-4 lg:col-span-2">
                  <p className="text-[9px] font-black text-slate-400 mb-1 ml-1 uppercase text-center italic">TVA %</p>
                  <select 
                    value={ligne.tva} 
                    onChange={(e) => majLigne(index, 'tva', e.target.value)}
                    className="w-full p-3 bg-white rounded-xl outline-none border border-slate-100 focus:border-indigo-600 font-black text-center shadow-inner appearance-none cursor-pointer"
                  >
                    <option value="0">0%</option>
                    <option value="5.5">5.5%</option>
                    <option value="10">10%</option>
                    <option value="20">20%</option>
                  </select>
                </div>

                {/* Supprimer */}
                <div className="col-span-4 lg:col-span-1 flex justify-center pb-1">
                  <button 
                    type="button" 
                    onClick={() => supprimerLigne(index)} 
                    className="p-3 text-slate-200 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- BLOC RÉSUMÉ FINANCIER --- */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white space-y-8 shadow-2xl relative overflow-hidden">
          <Calculator className="absolute -right-10 -bottom-10 text-white/5 w-64 h-64" />
          
          <div className="flex justify-between items-center border-b border-white/10 pb-6 relative z-10">
            <h3 className="text-xl font-black uppercase italic tracking-tighter text-indigo-400">Récapitulatif financier</h3>
            <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest">{lignes.length} Poste(s)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-bold uppercase italic">Total Brut HT</span>
                <span className="font-black text-xl">{totaux.totalBrutHT.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
              </div>
              <div className="flex justify-between text-sm text-indigo-400 italic">
                <span className="font-bold uppercase">Remises cumulées</span>
                <span className="font-black">- {totaux.totalRemise.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
              </div>
              <div className="flex justify-between pt-4 border-t border-white/10 font-black text-2xl tracking-tighter italic">
                <span className="text-slate-400 uppercase text-xs self-center">Total Net HT</span>
                <span>{totaux.totalHTFinal.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
              </div>
            </div>

            <div className="space-y-4 bg-white/5 p-8 rounded-3xl border border-white/5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-bold uppercase italic">Montant TVA</span>
                <span className="font-black text-emerald-400">+ {totaux.totalTVA.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
              </div>
              <div className="flex justify-between pt-6 border-t border-white/10">
                <span className="text-indigo-400 font-black uppercase italic text-2xl tracking-tighter self-end">NET À PAYER</span>
                <span className="text-5xl font-black italic">{totaux.totalTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
              </div>
            </div>
          </div>
        </div>

        {/* SUBMIT */}
        <div className="flex justify-center md:justify-end">
          <button 
            type="submit" 
            disabled={clientsComplets.length === 0}
            className={`w-full md:w-auto px-16 py-6 rounded-[2.5rem] font-black flex items-center justify-center gap-4 transition-all shadow-2xl active:scale-95 ${
              clientsComplets.length === 0 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
            }`}
          >
            <Save size={24} strokeWidth={3} /> 
            Créer et enregistrer le devis
          </button>
        </div>
      </form>
    </div>
  );
}