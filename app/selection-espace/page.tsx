// app/selection-espace/page.tsx
import { prisma } from "@/lib/prisma";
import Link from 'next/link';
import { Building2, ArrowRight, Plus, LayoutDashboard, Globe } from 'lucide-react';

export default async function SelectionEspace() {
  // 1. Simulation de l'ID utilisateur (À remplacer par ton ID de session/auth)
  // Normalement : const session = await getServerSession()
  const userId = "clm123...";

  // 2. Récupération des espaces de l'utilisateur
  const espaces = await prisma.espace.findMany({
    where: { userId: userId }, // On filtre par l'utilisateur connecté
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 relative overflow-hidden">

      {/* Background décoratif */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl w-full space-y-10">

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 mb-2">
            <LayoutDashboard className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sélecteur d'instance</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Bonjour ! Quel espace <br /> souhaitez-vous <span className="text-blue-600">piloter ?</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            Sélectionnez l'organisation que vous voulez gérer aujourd'hui.
          </p>
        </div>

        {/* Grille des Espaces */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {espaces.map((espace) => (
            <Link
              key={espace.id}
              href={`/dashboard/${espace.id}`}
              className="group relative bg-white p-8 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/50 hover:shadow-blue-200/40 hover:border-blue-100 transition-all duration-300 flex flex-col justify-between min-h-[200px]"
            >
              <div className="flex justify-between items-start">
                <div className="bg-slate-50 p-4 rounded-2xl group-hover:bg-blue-50 transition-colors">
                  <Building2 className="w-8 h-8 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <div className="bg-green-100 text-green-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  Actif
                </div>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {espace.nom}
                </h3>
                <p className="text-slate-400 text-sm font-medium flex items-center gap-1">
                  <Globe className="w-3 h-3" /> SIRET : {espace.siret}
                </p>
              </div>

              <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all">
                <ArrowRight className="w-6 h-6 text-blue-600" />
              </div>
            </Link>
          ))}

          {/* Carte "Ajouter une société" */}
          <Link
            href="/selection-espace/nouveau"
            className="border-2 border-dashed border-slate-200 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all group min-h-[200px]"
          >
            <div className="p-4 rounded-full border-2 border-dashed border-slate-200 group-hover:border-blue-400 transition-colors">
              <Plus className="w-8 h-8" />
            </div>
            <span className="font-bold">Ajouter une société</span>
          </Link>
        </div>

        {/* Footer info */}
        <p className="text-center text-slate-400 text-sm font-medium">
          Vous ne trouvez pas votre entreprise ? <button className="text-blue-600 font-bold hover:underline">Contacter le support</button>
        </p>
      </div>
    </div>
  );
}