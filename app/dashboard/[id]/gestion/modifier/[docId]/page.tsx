import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Save } from "lucide-react";
import FormulaireDocument from "./formulaire-document";

export default async function ModifierDocument({ 
  params 
}: { 
  params: Promise<{ id: string; docId: string }> 
}) {
  const { id, docId } = await params;

  // 1. Récupérer le document avec ses lignes et les clients pour la liste déroulante
  const [document, clients] = await Promise.all([
    prisma.facture.findUnique({
      where: { id: docId },
      include: { lignes: true }
    }),
    prisma.client.findMany({
      where: { espaceId: id },
      orderBy: { nom: 'asc' }
    })
  ]);

  // 2. Vérifications de sécurité
  if (!document) notFound();
  
  // Si le document est déjà payé ou annulé, on interdit l'accès à la modification
  if (document.statut === 'PAYE' || document.statut === 'ANNULE') {
    redirect(`/dashboard/${id}/gestion`);
  }

  return (
    <div className="p-6 md:p-10 bg-[#F8FAFF] min-h-screen space-y-8 text-slate-900">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <Link 
            href={`/dashboard/${id}/gestion`} 
            className="text-slate-500 font-bold flex items-center gap-2 hover:text-indigo-600 transition-colors mb-2 text-sm"
          >
            <ChevronLeft size={16} /> Annuler et retourner
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
            Modifier <span className="text-indigo-600">{document.numero}</span>
          </h1>
          <p className="text-slate-400 font-medium">Modification du {document.type.toLowerCase()}</p>
        </div>

        {/* Le Formulaire (Composant Client) */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8">
          <FormulaireDocument 
            document={document} 
            clients={clients} 
            espaceId={id} 
          />
        </div>

      </div>
    </div>
  );
}