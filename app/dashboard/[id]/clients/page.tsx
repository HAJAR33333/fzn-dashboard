import { prisma } from "@/lib/prisma";
import { UserPlus, Mail, Building2, Search, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import EditClientModal from "./_components/EditClientModal";

// Fonction pour vérifier si le dossier client est complet
function isClientComplet(client: any) {
  const champsObligatoires = [
    'formeJuridique', 'contactPrenom', 'contactNom', 
    'adresse', 'codePostal', 'ville', 'siret', 
    'telephone', 'statutClient'
  ];
  return champsObligatoires.every(champ => 
    client[champ] && client[champ].toString().trim() !== ""
  );
}

export default async function ClientsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const clients = await prisma.client.findMany({
    where: { espaceId: id },
    orderBy: { nom: 'asc' }
  });

  return (
    <div className="p-6 md:p-10 bg-[#F8FAFF] min-h-screen space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
            Portefeuille Clients
          </h1>
          <p className="text-slate-500 font-bold">{clients.length} client(s) enregistré(s)</p>
        </div>

        <div className="flex gap-3">
          <div className="relative hidden lg:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un client..." 
              className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 w-64 font-medium transition-all"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FORMULAIRE D'AJOUT RAPIDE */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white sticky top-10">
            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <UserPlus className="text-indigo-600" /> Nouveau Client
            </h2>
            
            <form action={async (formData) => {
              "use server";
              const nom = formData.get("nom") as string;
              const email = formData.get("email") as string;
              
              await prisma.client.create({
                data: { nom, email, espaceId: id }
              });
              revalidatePath(`/dashboard/${id}/clients`);
            }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nom / Entreprise</label>
                <input name="nom" required className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold transition-all" placeholder="SARL Exemple" />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Email de contact</label>
                <input name="email" type="email" required className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold transition-all" placeholder="contact@client.com" />
              </div>

              <button type="submit" className="w-full bg-slate-900 hover:bg-indigo-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-200">
                Enregistrer le client
              </button>
            </form>
          </div>
        </div>

        {/* LISTE DES CLIENTS AVEC BLOCAGE */}
        <div className="lg:col-span-2 space-y-4">
          {clients.length > 0 ? (
            clients.map((client) => {
              const complet = isClientComplet(client);

              return (
                <div key={client.id} className={`bg-white p-6 rounded-[2rem] shadow-sm border transition-all flex items-center justify-between group ${complet ? 'border-slate-100' : 'border-amber-200 bg-amber-50/20'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${complet ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-100 text-amber-600'}`}>
                      {client.nom.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{client.nom}</h3>
                      <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                        <span className="flex items-center gap-1"><Mail size={14} /> {client.email}</span>
                        {complet ? (
                           <span className="text-emerald-600 flex items-center gap-1 text-[10px] font-black uppercase">
                             <CheckCircle2 size={14} /> Dossier OK
                           </span>
                        ) : (
                          <span className="text-amber-600 flex items-center gap-1 text-[10px] font-black uppercase">
                            <AlertCircle size={14} /> Incomplet
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* SI COMPLET : LIEN DEVIS | SI INCOMPLET : BOUTON MODAL */}
                  {complet ? (
                    <Link 
                      href={`/dashboard/${id}/gestion/nouveau?clientId=${client.id}`}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all"
                    >
                      Nouveau devis
                    </Link>
                  ) : (
                    <EditClientModal client={client} id={id} />
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-white p-20 rounded-[2.5rem] border-2 border-dashed border-slate-100 text-center">
              <Building2 className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-slate-400 font-bold">Aucun client pour le moment.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}