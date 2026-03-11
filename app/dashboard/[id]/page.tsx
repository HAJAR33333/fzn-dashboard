import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  TrendingUp, Users, Zap, 
  ArrowUpRight, Activity, FileText 
} from 'lucide-react';
import ExerciceAlerte from "./_components/ExerciceAlerte"; 

// On force le rafraîchissement pour éviter les problèmes de cache à la création
export const dynamic = "force-dynamic";
export const revalidate = 0; // Force la désactivation du cache pour ce segment 

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ nouveau?: string }>;
}

export default async function DashboardReel({ params, searchParams }: Props) {
  const { id } = await params;
  const { nouveau } = await searchParams;

  // 1. CHARGEMENT DES DONNÉES RÉELLES EN PARALLÈLE
  const [espace, statsCA, nbClients, nbDevis, exerciceActif] = await Promise.all([
    prisma.espace.findUnique({ where: { id } }),
    
    // Calcul du CA Réel
    prisma.facture.aggregate({
      where: {
        espaceId: id,
        exercice: { isActif: true },
        type: "FACTURE",
        statut: "PAYE",
      },
      _sum: { montantHT: true },
    }),

    // Nombre de clients
    prisma.client.count({ where: { espaceId: id } }),

    // Nombre de devis en attente
    prisma.facture.count({
      where: {
        espaceId: id,
        type: "DEVIS",
        statut: "BROUILLON",
      },
    }),

    // Recherche d'un exercice actif
    prisma.exercice.findFirst({
      where: { espaceId: id, isActif: true }
    })
  ]);

  if (!espace) notFound();

  // LOGIQUE D'AFFICHAGE DE L'ALERTE :
  // On l'affiche si l'exercice n'existe pas OU si le flag "nouveau" est présent dans l'URL
  const doitAfficherAlerte = !exerciceActif || nouveau === "true";

  const totalCA = statsCA._sum.montantHT || 0;
  const objectif = 50000;
  const pourcentageAtteint = Math.min(Math.round((totalCA / objectif) * 100), 100);

  return (
    <div className="p-6 md:p-10 bg-[#F8FAFF] min-h-screen space-y-10 font-sans text-slate-900">
      
      {/* CORRECTION ICI : Passage de la propriété 'exercice' requise par le composant */}
      {doitAfficherAlerte && (
        <ExerciceAlerte 
          espaceId={id} 
          exercice={exerciceActif} 
        />
      )}

      {/* HEADER AVEC BOUTONS D'ACTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent italic uppercase tracking-tighter">
            {espace.nom}
          </h1>
          <p className="text-slate-500 font-bold flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
            Analyse de l'exercice en temps réel
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href={`/dashboard/${id}/gestion`}
            className="bg-white border border-slate-200 hover:border-indigo-600 text-slate-700 px-6 py-3 rounded-2xl font-bold shadow-sm transition-all flex items-center gap-2 group"
          >
            <FileText size={18} className="text-slate-400 group-hover:text-indigo-600 transition-colors" /> 
            Gérer les Devis
          </Link>

          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2">
            <Zap size={18} fill="white" /> Exporter PDF
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          label="Chiffre d'Affaires" 
          value={`${totalCA.toLocaleString('fr-FR')} €`} 
          trend="Encaissé" 
          color="from-blue-600 to-indigo-700" 
          icon={<TrendingUp />} 
        />
        <StatCard 
          label="Portefeuille Clients" 
          value={nbClients.toString()} 
          trend="Total fiches" 
          color="from-slate-800 to-slate-950" 
          icon={<Users />} 
        />
        <StatCard 
          label="Devis en attente" 
          value={nbDevis.toString()} 
          trend="À convertir" 
          color="from-orange-500 to-red-600" 
          icon={<FileText />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* GRAPHIQUE */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Activity size={120} className="text-indigo-600" />
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-8">Flux d'activité mensuel</h3>
          <div className="flex items-end justify-between h-64 gap-3">
            {[60, 40, 95, 70, 55, 85, 100, 75, 50, 90, 65, 80].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                <div 
                  style={{ height: `${h}%` }} 
                  className="w-full bg-slate-100 group-hover:bg-gradient-to-t group-hover:from-indigo-600 group-hover:to-blue-400 rounded-2xl transition-all duration-500 shadow-sm"
                />
                <span className="text-[10px] font-black text-slate-400 group-hover:text-indigo-600 transition-colors">
                    {['J','F','M','A','M','J','J','A','S','O','N','D'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CERCLE DE PROGRESSION */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white flex flex-col items-center justify-between text-center border border-slate-800">
          <h3 className="text-lg font-bold mb-4 text-slate-400 uppercase tracking-widest text-[10px]">Objectif Annuel</h3>
          <div className="relative w-56 h-56">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="112" cy="112" r="90" stroke="#1e293b" strokeWidth="18" fill="transparent" />
              <circle 
                cx="112" cy="112" r="90" 
                stroke="url(#dashboardGradient)" strokeWidth="18" fill="transparent" 
                strokeDasharray="565" strokeDashoffset={565 * (1 - pourcentageAtteint / 100)} 
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="dashboardGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#c084fc" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black">{pourcentageAtteint}%</span>
              <span className="text-indigo-400 text-[10px] font-bold tracking-widest uppercase mt-1">Atteint</span>
            </div>
          </div>
          <div className="w-full mt-6 p-5 bg-white/5 rounded-[2rem] border border-white/10">
            <p className="text-slate-400 text-xs font-medium mb-1">Cible de l'exercice</p>
            <p className="text-white text-xl font-black">{objectif.toLocaleString('fr-FR')} €</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, trend, color, icon }: any) {
  return (
    <div className={`bg-gradient-to-br ${color} p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}>
      <div className="absolute -right-4 -top-4 bg-white/10 p-8 rounded-full group-hover:scale-125 transition-transform duration-500">
        {icon}
      </div>
      <div className="relative z-10 space-y-4">
        <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">{label}</p>
        <h3 className="text-4xl font-black tracking-tighter">{value}</h3>
        <div className="flex items-center gap-1 bg-black/20 w-fit px-3 py-1 rounded-full text-[10px] font-bold border border-white/10">
          <ArrowUpRight size={12} /> {trend}
        </div>
      </div>
    </div>
  );
}