import { prisma } from "@/lib/prisma";
import { 
  Users, RefreshCcw, 
  Download, Search, 
  Mail, Calendar 
} from "lucide-react";
import InviteUserModal from "../_components/InviteUserModal";
import UserRowActions from "../_components/UserRowActions";

const getRoleDetails = (role: string) => {
  switch (role) {
    case 'OWNER': 
      return { label: 'Propriétaire', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' };
    case 'MANAGER': 
      return { label: 'Manager', color: 'text-slate-900 bg-slate-100 border-slate-200' };
    case 'COLLABORATEUR': 
      return { label: 'Collaborateur', color: 'text-slate-400 bg-slate-50 border-slate-100' };
    default: 
      return { label: role, color: 'text-slate-400 bg-slate-50 border-slate-100' };
  }
};

export default async function UsersManagementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const users = await prisma.user.findMany({
    where: { espaceId: id },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-[#FBFBFC] p-8 md:p-16 font-sans antialiased text-slate-900">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-16">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600/60">Human Resources</span>
            <h1 className="text-5xl font-black tracking-tight text-slate-950 italic uppercase leading-none">
              Utilisateurs <span className="text-slate-300">Collaborateurs</span>
            </h1>
            <p className="text-sm text-slate-400 font-medium mt-2 italic">Gérez les accès de votre équipe.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-4 bg-white border border-slate-100 rounded-full text-slate-400 hover:shadow-xl transition-all"><RefreshCcw size={18} /></button>
            <button className="p-4 bg-white border border-slate-100 rounded-full text-slate-400 hover:shadow-xl transition-all"><Download size={18} /></button>
            <InviteUserModal espaceId={id} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-10">
        {/* FILTRES */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white/50 backdrop-blur-md p-2 rounded-[3rem] border border-white shadow-sm">
            <div className="relative flex items-center">
               <Search className="absolute left-6 text-slate-300" size={16} />
               <input type="text" placeholder="RECHERCHER..." className="w-full bg-white h-14 pl-14 pr-6 rounded-full text-[10px] font-black uppercase outline-none focus:border-indigo-100 transition-all" />
            </div>
            <FilterSelect label="Statut" options={["Tous", "Actifs", "En attente"]} />
            <FilterSelect label="Rôle" options={["Tous", "Manager", "Collaborateur"]} />
            <FilterSelect label="Affichage" options={["10 lignes", "25 lignes"]} />
        </div>

        {/* TABLEAU - Note: overflow-visible est crucial ici */}
        <div className="bg-white border border-slate-100 rounded-[3rem] shadow-sm overflow-visible">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Collaborateur</th>
                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Permissions</th>
                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Date d'ajout</th>
                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Contact</th>
                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user) => {
                const badge = getRoleDetails(user.role);
                return (
                  <tr key={user.id} className="group hover:bg-[#FBFBFC] transition-all">
                    <td className="p-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-indigo-600 font-black border border-white shadow-sm">
                          {user.nom?.charAt(0) || "U"}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-slate-950 uppercase italic group-hover:text-indigo-600">{user.nom}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Team Member</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-8 text-center">
                      <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="p-8">
                      <span className="text-sm font-bold text-slate-600 flex items-center gap-2">
                        <Calendar size={14} className="opacity-30" />
                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </td>
                    <td className="p-8">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                         <Mail size={14} className="text-indigo-400" /> {user.email}
                      </span>
                    </td>
                    <td className="p-8 text-right">
                      {/* L'ACTION EST BIEN DANS SA PROPRE TD SANS BOUTON PARENT */}
                      <UserRowActions userId={user.id} userEmail={user.email} currentRole={user.role} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {/* Espace supplémentaire en bas pour éviter que le menu du dernier user touche le bord de l'écran */}
          <div className="h-24"></div> 
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ label, options }: { label: string, options: string[] }) {
  return (
    <div className="relative">
       <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[9px] font-black text-indigo-600 uppercase tracking-widest pointer-events-none">{label}</div>
       <select className="w-full bg-white h-14 pl-20 pr-6 rounded-full text-[10px] font-black uppercase outline-none border border-transparent focus:border-indigo-100 appearance-none cursor-pointer">
          {options.map(opt => <option key={opt}>{opt}</option>)}
       </select>
    </div>
  );
}