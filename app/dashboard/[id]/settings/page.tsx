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
  CalendarDays,
  User,
  MapPin,
  Mail,
  Phone
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

  // Action Server mise à jour pour inclure tous les nouveaux champs
  async function updateEspace(formData: FormData) {
    "use server";
    const data = {
      nom: formData.get("nom") as string,
      siret: formData.get("siret") as string,
      formeJuridique: formData.get("formeJuridique") as string,
      dirigeantPrenom: formData.get("dirigeantPrenom") as string,
      dirigeantNom: formData.get("dirigeantNom") as string,
      adresse: formData.get("adresse") as string,
      codePostal: formData.get("codePostal") as string,
      ville: formData.get("ville") as string,
      email: formData.get("email") as string,
      telephone: formData.get("telephone") as string,
    };

    await prisma.espace.update({
      where: { id },
      data: data,
    });

    revalidatePath(`/dashboard/${id}/settings`);
    revalidatePath(`/dashboard/${id}`);
  }

  const formesJuridiques = [
    "SARL", "EURL", "SAS", "SASU", "SA", "SNC", "EI", 
    "Auto-entrepreneur", "Association Loi 1901", "Autre"
  ];

  return (
    <div className="p-6 md:p-10 bg-[#F8FAFF] min-h-screen space-y-8 font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3">
            <Settings className="text-indigo-600" size={32} /> Paramètres
          </h1>
          <p className="text-slate-500 font-bold">Configurez votre environnement de travail</p>
        </div>
      </div>

      <div className="max-w-5xl space-y-8">
        
        {/* --- SECTION COMPTABILITÉ --- */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 ml-4">
            <CalendarDays size={18} className="text-slate-400" />
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Période Comptable</h2>
          </div>
          {exerciceActif ? (
            <GestionExercicePermanent exercice={exerciceActif} />
          ) : (
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-[2.5rem] text-amber-700 font-bold">
              Aucun exercice actif trouvé.
            </div>
          )}
        </div>

        {/* --- FORMULAIRE COMPLET --- */}
        <form action={updateEspace} className="space-y-8">
          
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white space-y-10">
            
            {/* Header Section Identité */}
            <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Building2 size={24} />
              </div>
              <div>
                <h2 className="font-black text-slate-800 uppercase tracking-tight">Identité Légale</h2>
                <p className="text-xs text-slate-400 font-bold uppercase">Ces informations apparaîtront sur vos factures</p>
              </div>
            </div>

            {/* GRID PRINCIPALE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              
              {/* Infos Société */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest bg-indigo-50 w-fit px-3 py-1 rounded-full">
                  <Building2 size={12} /> Structure
                </div>
                
                <div className="space-y-4">
                  <Field label="Nom de la structure" name="nom" defaultValue={espace.nom} icon={<Info size={12}/>} />
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Forme Juridique</label>
                    <select name="formeJuridique" defaultValue={espace.formeJuridique || ""} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold text-slate-700 border border-transparent appearance-none">
                      <option value="">Sélectionner...</option>
                      {formesJuridiques.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>

                  <Field label="Numéro SIRET" name="siret" defaultValue={espace.siret || ""} icon={<Fingerprint size={12}/>} />
                </div>
              </div>

              {/* Infos Dirigeant */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest bg-indigo-50 w-fit px-3 py-1 rounded-full">
                  <User size={12} /> Représentant Légal
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Prénom" name="dirigeantPrenom" defaultValue={espace.dirigeantPrenom || ""} />
                  <Field label="Nom" name="dirigeantNom" defaultValue={espace.dirigeantNom || ""} />
                </div>
                <Field label="Email de facturation" name="email" type="email" defaultValue={espace.email || ""} icon={<Mail size={12}/>} />
                <Field label="Téléphone" name="telephone" defaultValue={espace.telephone || ""} icon={<Phone size={12}/>} />
              </div>

              {/* Adresse (Pleine largeur) */}
              <div className="md:col-span-2 space-y-6 pt-4">
                <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest bg-indigo-50 w-fit px-3 py-1 rounded-full">
                  <MapPin size={12} /> Siège Social
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <Field label="Adresse" name="adresse" defaultValue={espace.adresse || ""} />
                  </div>
                  <Field label="Code Postal" name="codePostal" defaultValue={espace.codePostal || ""} />
                  <div className="md:col-span-3">
                    <Field label="Ville" name="ville" defaultValue={espace.ville || ""} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BOUTON SAUVEGARDE */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-white/10 rounded-2xl">
                    <ShieldCheck className="text-indigo-400" size={28} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg">Mise à jour sécurisée</h3>
                    <p className="text-slate-400 text-sm font-medium">Les changements impacteront vos prochaines factures.</p>
                  </div>
                </div>
                
                <button type="submit" className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-900/50 group">
                  <Save size={20} className="group-hover:scale-110 transition-transform" /> Enregistrer les modifications
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

// Petit composant interne pour les champs pour éviter la répétition
function Field({ label, name, defaultValue, type = "text", icon }: any) {
  return (
    <div className="space-y-2 w-full">
      <label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2">
        {icon} {label}
      </label>
      <input 
        type={type}
        name={name} 
        defaultValue={defaultValue}
        className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold text-slate-700 transition-all border border-transparent focus:bg-white" 
      />
    </div>
  );
}