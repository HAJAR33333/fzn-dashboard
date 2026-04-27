import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  TrendingUp, Users, Zap,
  ArrowUpRight, Activity, FileText,
  UserPlus, Car, Clock
} from 'lucide-react';
import ExerciceAlerte from "./_components/ExerciceAlerte";
import InformationSocieteModal from "./_components/InformationSocieteModal";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ nouveau?: string; exercice?: string }>;
}

export default async function DashboardReel({ params, searchParams }: Props) {
  const { id } = await params;
  const sParams = await searchParams;
  const { nouveau, exercice: exerciceParam } = sParams;

  // --- LOGIQUE EXERCICE ---
  let exerciceCible = null;
  if (exerciceParam) {
    exerciceCible = await prisma.exercice.findFirst({
      where: {
        espaceId: id,
        code: exerciceParam,
      },
    });
  }

  if (!exerciceCible) {
    exerciceCible = await prisma.exercice.findFirst({
      where: {
        espaceId: id,
        isActif: true,
      },
    });
  }

  // --- CHARGEMENT DES DONNÉES ---
  const [espace, statsCA, nbClients, nbDevis, collaborateurs, fraisStats, derniersFrais] = await Promise.all([
    prisma.espace.findUnique({ where: { id } }),

    prisma.facture.aggregate({
      where: {
        espaceId: id,
        exerciceId: exerciceCible?.id,
        type: "FACTURE",
        statut: "PAYE",
      },
      _sum: { montantHT: true },
    }),

    prisma.client.count({ where: { espaceId: id } }),

    prisma.facture.count({
      where: {
        espaceId: id,
        exerciceId: exerciceCible?.id,
        type: "DEVIS",
        statut: "BROUILLON",
      },
    }),

    prisma.user.findMany({
      where: { espaceId: id },
      take: 3,
      orderBy: { createdAt: 'desc' }
    }),

    // Stats des Frais
    prisma.fraisKilometrique.aggregate({
      where: { espaceId: id, statut: "EN_ATTENTE" },
      _sum: { montant: true }
    }),

    // Aperçu des 2 derniers frais
    prisma.fraisKilometrique.findMany({
      where: { espaceId: id },
      include: { user: true },
      take: 2,
      orderBy: { date: 'desc' }
    })
  ]);

  if (!espace) notFound();

  const infosIncompletes = !espace.formeJuridique || !espace.adresse || !espace.dirigeantNom;
  const doitAfficherAlerte = !exerciceCible || nouveau === "true";
  const totalCA = statsCA._sum.montantHT || 0;
  const totalFraisEnAttente = fraisStats._sum.montant || 0;
  const objectif = exerciceCible?.objectif || 5000;
  const pourcentageAtteint = Math.min(Math.round((totalCA / objectif) * 100), 100);

  return (
    <div className="p-6 md:p-10 bg-[#F8FAFF] min-h-screen space-y-10 font-sans text-slate-900">

      {infosIncompletes && (
        <InformationSocieteModal espace={espace} />
      )}

      {doitAfficherAlerte && (
        <ExerciceAlerte
          espaceId={id}
          exercice={exerciceCible}
        />
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent italic uppercase tracking-tighter">
            {espace.nom} 
            {exerciceCible && (
              <span className="ml-3 text-blue-600">
                [{exerciceCible.code}]
              </span>
            )}
          </h1>
          <p className="text-slate-500 font-bold flex items-center gap-2 text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
            Analyse en temps réel • {exerciceCible?.code || "Exercice indéfini"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/dashboard/${id}/users`}
            className="bg-white border border-slate-200 hover:border-indigo-600 text-slate-700 px-5 py-3 rounded-2xl font-bold shadow-sm transition-all flex items-center gap-2 group text-sm"
          >
            <Users size={16} className="text-slate-400 group-hover:text-indigo-600" />
            Équipe
          </Link>
          <Link
            href={`/dashboard/${id}/frais`}
            className="bg-white border border-slate-200 hover:border-orange-500 text-slate-700 px-5 py-3 rounded-2xl font-bold shadow-sm transition-all flex items-center gap-2 group text-sm"
          >
            <Car size={16} className="text-slate-400 group-hover:text-orange-500" />
            Frais IK
          </Link>
          <Link
            href={`/dashboard/${id}/gestion`}
            className="bg-white border border-slate-200 hover:border-indigo-600 text-slate-700 px-5 py-3 rounded-2xl font-bold shadow-sm transition-all flex items-center gap-2 group text-sm"
          >
            <FileText size={16} className="text-slate-400 group-hover:text-indigo-600" />
            Devis
          </Link>

          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 text-sm">
            <Zap size={16} fill="white" /> Exporter
          </button>
        </div>
      </div>

      {/* STATS CARDS - Passage à 4 colonnes pour inclure les Frais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label={`CA ENCAISSÉ ${exerciceCible?.code || ""}`}
          value={`${totalCA.toLocaleString('fr-FR')} €`}
          trend="Réel encaissé"
          color="from-blue-600 to-indigo-700"
          icon={<TrendingUp />}
        />
        <StatCard
          label="Frais en attente"
          value={`${totalFraisEnAttente.toLocaleString('fr-FR')} €`}
          trend="À régulariser"
          color="from-orange-400 to-orange-600"
          icon={<Clock />}
        />
        <StatCard
          label="Portefeuille Clients"
          value={nbClients.toString()}
          trend="Total fiches"
          color="from-slate-800 to-slate-950"
          icon={<Users />}
        />
        <StatCard
          label="Devis Brouillon"
          value={nbDevis.toString()}
          trend="En attente"
          color="from-rose-500 to-red-600"
          icon={<FileText />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* COLONNE GAUCHE : ÉQUIPE + FRAIS (1 colonne) */}
        <div className="space-y-6">
          {/* APERÇU ÉQUIPE */}
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xs font-black text-slate-800 uppercase italic">Équipe</h3>
               <Link href={`/dashboard/${id}/users`} className="text-indigo-600 text-[9px] font-black uppercase tracking-widest hover:underline">Voir tout</Link>
            </div>
            <div className="space-y-3">
              {collaborateurs.map((collab) => (
                <div key={collab.id} className="flex items-center gap-3 p-2 bg-slate-50/50 rounded-xl border border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-indigo-600 font-black text-[10px] shadow-sm">
                    {collab.nom?.charAt(0) || "U"}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-black text-slate-900 uppercase truncate leading-none">{collab.nom || "Membre"}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">{collab.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* APERÇU FRAIS */}
          <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xs font-black text-slate-800 uppercase italic">Derniers Frais</h3>
               <Link href={`/dashboard/${id}/frais`} className="text-orange-600 text-[9px] font-black uppercase tracking-widest hover:underline">IK</Link>
            </div>
            <div className="space-y-3">
              {derniersFrais.map((f) => (
                <div key={f.id} className="p-3 bg-orange-50/50 rounded-xl border border-orange-100/50">
                  <div className="flex justify-between items-start">
                    <p className="text-[9px] font-black text-slate-900 uppercase truncate w-24">
                      {f.user?.prenom} {f.user?.nom}
                    </p>
                    <span className="text-[10px] font-black text-orange-600 italic">{f.montant.toFixed(2)}€</span>
                  </div>
                  <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">
                    {f.distance} KM • {f.statut.replace('_', ' ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* GRAPHIQUE (Prend 2 colonnes) */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Activity size={100} className="text-indigo-600" />
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-8">Flux d'activité {exerciceCible?.code}</h3>
          <div className="flex items-end justify-between h-56 gap-2">
            {[60, 40, 95, 70, 55, 85, 100, 75, 50, 90, 65, 80].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                <div
                  style={{ height: `${h}%` }}
                  className="w-full bg-slate-100 group-hover:bg-gradient-to-t group-hover:from-indigo-600 group-hover:to-blue-400 rounded-2xl transition-all duration-500 shadow-sm"
                />
                <span className="text-[9px] font-black text-slate-400 group-hover:text-indigo-600 transition-colors">
                  {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CERCLE DE PROGRESSION (Prend 1 colonne) */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white flex flex-col items-center justify-between text-center border border-slate-800">
          <h3 className="text-lg font-bold mb-4 text-slate-400 uppercase tracking-widest text-[10px]">Objectif {exerciceCible?.code}</h3>
          <div className="relative w-44 h-44">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="88" cy="88" r="75" stroke="#1e293b" strokeWidth="14" fill="transparent" />
              <circle
                cx="88" cy="88" r="75"
                stroke="url(#dashboardGradient)" strokeWidth="14" fill="transparent"
                strokeDasharray="471" strokeDashoffset={471 * (1 - pourcentageAtteint / 100)}
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
              <span className="text-4xl font-black">{pourcentageAtteint}%</span>
              <span className="text-indigo-400 text-[8px] font-bold tracking-widest uppercase mt-1">Atteint</span>
            </div>
          </div>
          <div className="w-full mt-6 p-4 bg-white/5 rounded-[1.5rem] border border-white/10">
            <p className="text-slate-400 text-[10px] font-medium mb-1 tracking-tighter">Cible de l'exercice</p>
            <p className="text-white text-lg font-black">{objectif.toLocaleString('fr-FR')} €</p>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ label, value, trend, color, icon }: any) {
  return (
    <div className={`bg-gradient-to-br ${color} p-6 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}>
      <div className="absolute -right-2 -top-2 bg-white/10 p-6 rounded-full group-hover:scale-125 transition-transform duration-500">
        {icon}
      </div>
      <div className="relative z-10 space-y-3">
        <p className="text-white/60 text-[9px] font-black uppercase tracking-widest">{label}</p>
        <h3 className="text-3xl font-black tracking-tighter">{value}</h3>
        <div className="flex items-center gap-1 bg-black/20 w-fit px-3 py-1 rounded-full text-[9px] font-bold border border-white/10">
          <ArrowUpRight size={10} /> {trend}
        </div>
      </div>
    </div>
  );
}