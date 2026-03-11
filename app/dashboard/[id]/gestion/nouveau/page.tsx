import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import NouveauDevisForm from "./NouveauDevisForm";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // 1. On récupère les clients de cet espace
  // 2. On récupère l'exercice actif pour que le dashboard soit mis à jour plus tard
  const [clients, exercice] = await Promise.all([
    prisma.client.findMany({ where: { espaceId: id } }),
    prisma.exercice.findFirst({ where: { espaceId: id, isActif: true } })
  ]);

  if (!exercice) {
    return (
      <div className="p-20 text-center space-y-4">
        <h1 className="text-2xl font-black text-slate-800">Attention !</h1>
        <p className="text-slate-500">Vous devez avoir un exercice actif pour créer un devis.</p>
      </div>
    );
  }

  return <NouveauDevisForm clients={clients} exerciceId={exercice.id} />;
}