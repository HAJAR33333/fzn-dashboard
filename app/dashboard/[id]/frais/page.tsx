import { prisma } from "@/lib/prisma";
import { Car, Clock, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import NouveauFraisModal from "../_components/NouveauFraisModal";
import SelectStatutFrais from "../_components/SelectStatutFrais";
import DetailsFraisModal from "../_components/DetailsFraisModal";

export default async function PageFrais({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [frais, collaborateurs, clients, societe] = await Promise.all([
    prisma.fraisKilometrique.findMany({
      where: { espaceId: id },
      include: { user: true },
      orderBy: { date: 'desc' },
    }),
    prisma.user.findMany({
      where: { espaceId: id, isActive: true },
      select: { id: true, nom: true, prenom: true }
    }),
    prisma.client.findMany({
      where: { espaceId: id },
      select: { id: true, nom: true }
    }),
    prisma.espace.findUnique({
      where: { id },
      select: { id: true, nom: true }
    })
  ]);

  const totalEnAttente = frais
    .filter(f => f.statut === "EN_ATTENTE")
    .reduce((acc, curr) => acc + curr.montant, 0);
    
  const distanceTotale = frais.reduce((acc, curr) => acc + curr.distance, 0);

  return (
    <div className="p-6 md:p-10 bg-[#F8FAFF] min-h-screen space-y-8 font-sans">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">
            Régularisations Frais
          </h1>
          <p className="text-slate-500 font-medium text-sm">Gestion des indemnités kilométriques (IK)</p>
        </div>
        <NouveauFraisModal 
          espaceId={id} 
          societes={societe ? [societe] : []} 
          collaborateurs={collaborateurs} 
          clients={clients} 
        />
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-orange-100 text-orange-600 rounded-2xl">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">À régulariser</p>
            <p className="text-2xl font-black text-slate-900">{totalEnAttente.toLocaleString('fr-FR')} €</p>
          </div>
        </div>
        
        <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl flex items-center gap-4 text-white border-none">
          <div className="p-4 bg-white/10 text-white rounded-2xl">
            <Car size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Distance Totale</p>
            <p className="text-2xl font-black uppercase">{distanceTotale.toLocaleString('fr-FR')} KM</p>
          </div>
        </div>
      </div>

      {/* TABLEAU */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Collaborateur</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Distance</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Montant</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Statut</th>
                <th className="p-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {frais.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-black text-xs uppercase">
                        {f.user?.prenom?.[0] || '?'}{f.user?.nom?.[0] || ''}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 uppercase italic leading-none">
                          {f.user?.nom} {f.user?.prenom}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1">
                          {format(new Date(f.date), "dd MMMM yyyy", { locale: fr })}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-sm font-bold text-slate-900 uppercase">{f.distance} km</td>
                  <td className="p-6 text-lg font-black text-slate-900 italic">{f.montant.toFixed(2)} €</td>
                  <td className="p-6 text-center">
                    <SelectStatutFrais id={f.id} initialStatut={f.statut} espaceId={id} />
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2 items-center">
                      {/* BOUTON DÉTAILS ET IMPRESSION */}
                      <DetailsFraisModal frais={f} />
                      
                      <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-200 hover:text-indigo-600 transition-all">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}