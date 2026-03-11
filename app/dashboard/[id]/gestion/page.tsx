import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  FileText, ArrowRightLeft, CheckCircle, 
  Clock, Plus, ChevronLeft, CreditCard, XCircle,
  Printer, Mail, Edit3 
} from "lucide-react";
import { 
  convertirDevisEnFacture, 
  changerStatutFacture,
  envoyerEmailClient 
} from "@/app/action/facture-actions";
import { StatutFacture } from "@/app/generated/prisma";

export default async function GestionCommerciale({ 
  params,
  searchParams 
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ exercice?: string }>
}) {
  const { id } = await params;
  const sParams = await searchParams;

  // 1. Récupération de l'exercice (Code URL ou Exercice Actif par défaut)
  const codeExerciceUrl = sParams.exercice;
  
  const exerciceSelectionne = await prisma.exercice.findFirst({
    where: { 
      espaceId: id,
      ...(codeExerciceUrl ? { code: codeExerciceUrl } : { isActif: true })
    }
  });

  // 2. Sécurité si aucun exercice n'existe
  if (!exerciceSelectionne) {
    return (
      <div className="p-20 text-center space-y-4">
        <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">Attention !</h1>
        <p className="text-slate-500 font-medium">Veuillez créer un exercice comptable dans vos paramètres pour gérer vos documents.</p>
      </div>
    );
  }

  // 3. Récupération des documents FILTRÉS par espace ET par exerciceId
  const documents = await prisma.facture.findMany({
    where: { 
      espaceId: id,
      exerciceId: exerciceSelectionne.id 
    },
    include: { client: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-6 md:p-10 bg-[#F8FAFF] min-h-screen space-y-8 text-slate-900">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link 
            href={`/dashboard/${id}`} 
            className="text-slate-500 font-bold flex items-center gap-2 hover:text-indigo-600 transition-colors mb-2 text-sm"
          >
            <ChevronLeft size={16} /> Retour au Dashboard
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
            Gestion Commerciale <span className="text-indigo-600">{exerciceSelectionne.code}</span>
          </h1>
        </div>

        <Link 
          href={`/dashboard/${id}/gestion/nouveau?exId=${exerciceSelectionne.id}`}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 scale-100 hover:scale-105 active:scale-95"
        >
          <Plus size={20} strokeWidth={3} /> Nouveau Devis
        </Link>
      </div>

      {/* --- TABLEAU DES DOCUMENTS --- */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <th className="p-6">Numéro</th>
              <th className="p-6">Client</th>
              <th className="p-6">Type</th>
              <th className="p-6">Montant HT</th>
              <th className="p-6">Statut</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="p-6 font-bold text-slate-700">{doc.numero}</td>
                <td className="p-6 text-slate-600 font-medium">{doc.client.nom}</td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    doc.type === 'DEVIS' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'
                  }`}>
                    {doc.type}
                  </span>
                </td>
                <td className="p-6 font-black text-slate-900">{doc.montantHT.toLocaleString('fr-FR')} €</td>
                <td className="p-6">
                  <div className={`flex items-center gap-2 text-xs font-bold ${
                    doc.statut === 'PAYE' ? 'text-emerald-600' : 
                    doc.statut === 'ANNULE' ? 'text-red-400 line-through' : 'text-amber-500'
                  }`}>
                    {doc.statut === 'PAYE' ? <CheckCircle size={16} /> : doc.statut === 'ANNULE' ? <XCircle size={16} /> : <Clock size={16} />}
                    {doc.statut}
                  </div>
                </td>

                <td className="p-6 text-right">
                  <div className="flex justify-end items-center gap-3">
                    
                    <div className="flex gap-2">
                      {/* BOUTON MODIFIER : Sauf si PAYÉ ou ANNULÉ */}
                      {doc.statut !== 'PAYE' && doc.statut !== 'ANNULE' && (
                        <Link 
                          href={`/dashboard/${id}/gestion/modifier/${doc.id}`}
                          className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 px-3 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all shadow-sm"
                        >
                          <Edit3 size={14} /> Modifier
                        </Link>
                      )}

                      {/* FLUX DE TRAVAIL (Convertir / Payer) */}
                      {doc.statut !== 'PAYE' && doc.statut !== 'ANNULE' && (
                        <>
                          {doc.type === "DEVIS" && (
                            <form action={async () => { "use server"; await convertirDevisEnFacture(doc.id, id); }}>
                              <button className="bg-slate-900 hover:bg-indigo-600 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all">
                                <ArrowRightLeft size={14} /> Convertir
                              </button>
                            </form>
                          )}

                          {doc.type === "FACTURE" && (
                            <form action={async () => { "use server"; await changerStatutFacture(doc.id, "PAYE" as StatutFacture, id); }}>
                              <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all">
                                <CreditCard size={14} /> Payer
                              </button>
                            </form>
                          )}

                          {/* ANNULER (Uniquement pour les DEVIS) */}
                          {doc.type === "DEVIS" && (
                            <form action={async () => { "use server"; await changerStatutFacture(doc.id, "ANNULE" as StatutFacture, id); }}>
                              <button title="Annuler le devis" className="bg-white hover:bg-red-50 text-slate-300 hover:text-red-500 border border-slate-200 px-2 py-2 rounded-xl transition-all">
                                <XCircle size={16} />
                              </button>
                            </form>
                          )}
                        </>
                      )}
                    </div>

                    {/* ACTIONS PDF / MAIL */}
                    <div className="flex gap-1 border-l pl-3 border-slate-100">
                      <Link 
                        href={`/api/pdf/${doc.id}`} 
                        target="_blank"
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Générer le PDF"
                      >
                        <Printer size={18} />
                      </Link>

                      <form action={async () => { "use server"; await envoyerEmailClient(doc.id, id); }}>
                        <button 
                          type="submit"
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Envoyer au client"
                        >
                          <Mail size={18} />
                        </button>
                      </form>
                    </div>

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* --- ÉTAT VIDE --- */}
        {documents.length === 0 && (
          <div className="p-20 text-center space-y-4">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <FileText size={40} />
            </div>
            <p className="text-slate-400 font-bold italic">
              Aucun document pour l'exercice {exerciceSelectionne.code}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}