"use client";
import { useState } from "react";
import { X, Send, AlertCircle, CheckCircle2 } from "lucide-react";

const ROLES = [
  { id: "COLLABORATEUR", label: "Collaborateur", desc: "Accès Standard" }, 
  { id: "MANAGER", label: "Manager", desc: "Droits Étendus" },
];

export default function InviteUserModal({ espaceId }: { espaceId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("COLLABORATEUR");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. Appel à l'API d'invitation
      const response = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            email: email.toLowerCase().trim(), 
            espaceId: espaceId, 
            role: selectedRole 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // 2. Si l'utilisateur existe déjà ou erreur, on affiche le message
        setErrorMessage(data.error || "Une erreur est survenue");
        return;
      }

      // 3. Succès
      setIsOpen(false);
      setEmail("");
      window.location.reload(); 

    } catch (err) {
      setErrorMessage("Impossible de contacter le serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return (
    <button onClick={() => setIsOpen(true)} className="flex items-center gap-3 bg-slate-950 text-white px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200">
      <Send size={16} /> Inviter
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
      <div className="bg-white w-full max-w-lg rounded-[3rem] p-12 relative shadow-2xl border border-white animate-in fade-in zoom-in duration-300">
        <button onClick={() => { setIsOpen(false); setErrorMessage(null); }} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors">
          <X size={24} />
        </button>
        
        <h2 className="text-3xl font-black italic uppercase mb-10 text-slate-950 leading-tight">
            Nouvelle <span className="text-slate-300 block">Invitation</span>
        </h2>
        
        <form onSubmit={handleInvite} className="space-y-6">
          <div className="space-y-2">
            <input 
              required 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="EMAIL DU COLLABORATEUR"
              className={`w-full bg-slate-50 h-16 px-8 rounded-full text-[11px] font-bold uppercase outline-none border transition-all ${
                errorMessage ? 'border-red-200 focus:border-red-500 bg-red-50/30' : 'border-transparent focus:border-indigo-200'
              }`}
            />
            
            {/* AFFICHAGE DE L'ERREUR D'EXISTENCE */}
            {errorMessage && (
              <div className="flex items-center gap-2 px-6 text-red-600 animate-pulse">
                <AlertCircle size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">{errorMessage}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRole(r.id)}
                className={`flex flex-col text-left p-6 rounded-[2rem] border transition-all duration-300 ${
                  selectedRole === r.id 
                    ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-50/50' 
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <span className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${
                  selectedRole === r.id ? 'text-indigo-950' : 'text-slate-400'
                }`}>
                  {r.label}
                </span>
                <span className="text-[8px] text-slate-400 uppercase italic leading-none">{r.desc}</span>
              </button>
            ))}
          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full bg-slate-950 text-white h-16 rounded-full font-black uppercase tracking-[0.2em] text-[11px] hover:bg-indigo-600 transition-all shadow-xl disabled:bg-slate-200 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Traitement...
              </>
            ) : "Envoyer l'accès"}
          </button>
        </form>
      </div>
    </div>
  );
}