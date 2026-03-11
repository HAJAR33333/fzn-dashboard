import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { 
  Settings, 
  Building2, 
  Fingerprint, 
  Save, 
  ShieldCheck,
  Info,
  CalendarDays
} from "lucide-react";
import GestionExercicePermanent from "../_components/GestionExercicePermanent";

export default async function SettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Récupération des données de l'espace ET de l'exercice actif
  const [espace, exerciceActif] = await Promise.all([
    prisma.espace.findUnique({ where: { id } }),
    prisma.exercice.findFirst({ where: { espaceId: id, isActif: true } })
  ]);

  if (!espace) notFound();

  // Action Server pour la mise à jour de l'identité de l'espace
  async function updateEspace(formData: FormData) {
    "use server";
    const nom = formData.get("nom") as string;
    const siret = formData.get("siret") as string;

    await prisma.espace.update({
      where: { id },
      data: { nom, siret },
    });

    revalidatePath(`/dashboard/${id}/settings`);
    revalidatePath(`/dashboard/${id}`);
  }

  return (
    <div className="p-6 md:p-10 bg-[#F8FAFF] min-h-screen space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3">
            <Settings className="text-indigo-600" size={32} /> Paramètres
          </h1>
          <p className="text-slate-500 font-bold">Configurez votre environnement de travail</p>
        </div>
      </div>

      <div className="max-w-4xl space-y-8">
        
        {/* --- SECTION COMPTABILITÉ (NOUVEAU) --- */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 ml-4">
            <CalendarDays size={18} className="text-slate-400" />
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Période Comptable</h2>
          </div>
          {exerciceActif ? (
            <GestionExercicePermanent exercice={exerciceActif} />
          ) : (
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-[2.5rem] text-amber-700 font-bold">
              Aucun exercice actif trouvé pour cet espace.
            </div>
          )}
        </div>

        {/* --- FORMULAIRE IDENTITÉ --- */}
        <form action={updateEspace} className="space-y-8">
          
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Building2 size={24} />
              </div>
              <div>
                <h2 className="font-black text-slate-800 uppercase tracking-tight">Identité de l'entreprise</h2>
                <p className="text-xs text-slate-400 font-bold uppercase">Informations légales pour vos documents</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2">
                  <Info size={12} /> Nom de la structure
                </label>
                <input 
                  name="nom" 
                  defaultValue={espace.nom}
                  required 
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold text-slate-700 transition-all border border-transparent focus:bg-white" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2">
                  <Fingerprint size={12} /> Numéro SIRET
                </label>
                <input 
                  name="siret" 
                  defaultValue={espace.siret || ""}
                  required 
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold text-slate-700 transition-all border border-transparent focus:bg-white"
                  placeholder="123 456 789 00012"
                />
              </div>
            </div>
          </div>

          {/* SECTION ENREGISTREMENT */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-white/10 rounded-2xl">
                    <ShieldCheck className="text-indigo-400" size={28} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg">Sécurité & Validation</h3>
                    <p className="text-slate-400 text-sm font-medium">Mettez à jour vos informations en toute confiance.</p>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-900/50"
                >
                  <Save size={20} /> Enregistrer l'identité
                </button>
             </div>
             
             <div className="absolute -right-10 -bottom-10 opacity-10">
                <Settings size={200} />
             </div>
          </div>
        </form>

        {/* ZONE DANGER */}
        <div className="p-8 border-2 border-dashed border-red-100 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h4 className="text-red-600 font-black uppercase text-xs tracking-widest">Zone de danger</h4>
            <p className="text-slate-400 text-sm font-bold">Action irréversible : suppression définitive</p>
          </div>
          <button className="text-red-500 hover:bg-red-50 px-6 py-3 rounded-xl font-black text-xs uppercase transition-all">
            Supprimer l'espace
          </button>
        </div>
      </div>
    </div>
  );
}