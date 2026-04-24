import { prisma } from "@/lib/prisma";
import SpaceSwitcher from "./_components/SpaceSwitcher";
import ExerciceSwitcher from "./_components/ExerciceSwitcher";
import { notFound } from "next/navigation";
import { 
  LayoutDashboard, 
  ChevronRight, 
  Users2, 
  Settings 
} from 'lucide-react';
import Link from 'next/link';
import SidebarLinks from "./clients/_components/SidebarLinks";
import LogoutButton from "./_components/LogoutButton";

// Force le rendu dynamique pour garantir que les données Prisma sont fraîches
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode,
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  // 1. Récupérer les informations de l'espace de travail
  const espaceEnCours = await prisma.espace.findUnique({
    where: { id },
    select: { userId: true, nom: true }
  });

  if (!espaceEnCours || !espaceEnCours.userId) notFound();

  // 2. RÉCUPÉRATION DES EXERCICES
  const tousLesExercices = await prisma.exercice.findMany({
    where: { espaceId: id },
    select: { code: true, isActif: true },
    orderBy: { code: 'desc' }
  });

  const listeExercicesFinal = Array.from(new Set(tousLesExercices.map(ex => ex.code)));
  const exerciceActifObj = tousLesExercices.find(ex => ex.isActif);
  const anneeCivileActuelle = new Date().getFullYear().toString();

  // 3. Récupérer la liste des espaces de l'utilisateur (Propriétaire)
  const espacesDuProprietaire = await prisma.espace.findMany({
    where: { userId: espaceEnCours.userId },
    orderBy: { nom: 'asc' },
    select: { id: true, nom: true, siret: true }
  });

  return (
    <div className="flex min-h-screen bg-[#F4F7FE] overflow-x-hidden font-sans text-slate-700">
      
      {/* Sidebar fixe à gauche */}
      <aside className="w-80 bg-white border-r border-slate-200/60 hidden md:flex flex-col p-7 fixed h-full z-50 overflow-y-auto">

        {/* Logo Section */}
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-slate-900 p-2.5 rounded-xl shadow-lg shadow-slate-950/20">
            <LayoutDashboard className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-2xl tracking-tighter text-slate-900 leading-none uppercase italic">FZN DASH</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mt-1">Compta Pro</span>
          </div>
        </div>

        {/* Space Switcher Section */}
        <div className="mb-6">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-3 ml-2 tracking-widest">Espace Actif</p>
          <div className="p-1 bg-slate-100/50 rounded-2xl border border-slate-200/50">
            <SpaceSwitcher espaces={espacesDuProprietaire} currentId={id} />
          </div>
        </div>

        {/* Exercice Switcher */}
        <ExerciceSwitcher
          exercices={listeExercicesFinal}
          exerciceActif={exerciceActifObj?.code || anneeCivileActuelle}
        />

        {/* Navigation Links Section */}
        <nav className="flex-1 space-y-2 pr-2 mt-2">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-3 ml-2 tracking-widest">Menu Principal</p>
          <SidebarLinks id={id} />

          {/* NOUVELLE SECTION : ADMINISTRATION */}
          <div className="mt-8 pt-6 border-t border-slate-50 space-y-1">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-4 ml-2 tracking-widest">Administration</p>
            
            <Link 
              href={`/dashboard/${id}/users`}
              className="flex items-center justify-between group px-4 py-3.5 rounded-2xl hover:bg-slate-950 hover:text-white transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <Users2 className="w-5 h-5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                <span className="font-bold text-[13px] tracking-tight uppercase italic">Utilisateurs</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link 
              href={`/dashboard/${id}/settings`}
              className="flex items-center justify-between group px-4 py-3.5 rounded-2xl hover:bg-slate-950 hover:text-white transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                <span className="font-bold text-[13px] tracking-tight uppercase italic">Paramètres</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </nav>

        {/* Footer Sidebar (Logout) */}
        <div className="mt-auto pt-6 border-t border-slate-100">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-80 max-w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}