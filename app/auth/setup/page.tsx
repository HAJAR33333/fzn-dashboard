"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, CheckCircle2, Loader2, ArrowRight, AlertCircle } from "lucide-react";

function SetupForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Récupération des paramètres de l'URL (provenant du mail d'invitation)
  const email = searchParams.get("email");
  const spaceId = searchParams.get("space");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFinishSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 1. Validations de base
    // On vérifie que spaceId existe pour éviter la 404
    if (!spaceId) {
      setError("IDENTIFIANT D'ESPACE MANQUANT. VEUILLEZ UTILISER LE LIEN DU MAIL.");
      return;
    }

    if (password.length < 6) {
      setError("LE MOT DE PASSE DOIT CONTENIR AU MOINS 6 CARACTÈRES.");
      return;
    }

    if (password !== confirmPassword) {
      setError("LES MOTS DE PASSE NE CORRESPONDENT PAS.");
      return;
    }

    setIsLoading(true);

    try {
      // Appel à ton API de hachage et mise à jour
      const res = await fetch("/api/auth/setup-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email?.toLowerCase(), 
          password, 
          spaceId 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "ERREUR LORS DE LA CONFIGURATION");
      }

      // 2. État visuel de succès
      setIsSuccess(true);
      
      // 3. Redirection vers le dossier [id]
      // IMPORTANT : Comme ton dossier est app/dashboard/[id], 
      // router.push construira l'URL /dashboard/ton_id_ici
      setTimeout(() => {
        // On s'assure que spaceId est bien une string propre
        const targetId = String(spaceId).trim();
        router.push(`/dashboard/${targetId}`);
      }, 1500);

    } catch (err: any) {
      // Gestion des erreurs propre et en majuscules pour le style "Luxe"
      setError(err.message?.toUpperCase() || "ERREUR SERVEUR INCONNUE");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFC] flex items-center justify-center p-6 font-sans antialiased">
      <div className="w-full max-w-md">
        
        {/* HEADER */}
        <div className="flex flex-col items-center mb-12 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-all duration-700 shadow-2xl ${
            isSuccess ? "bg-emerald-500 text-white scale-110" : "bg-slate-950 text-white"
          }`}>
            {isSuccess ? <CheckCircle2 size={30} /> : <Lock size={24} strokeWidth={1.5} />}
          </div>
          
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-600/60 mb-2">
            {isSuccess ? "Accès activé" : "Finalisation"}
          </span>
          
          <h1 className="text-4xl font-black tracking-tighter text-slate-950 uppercase italic leading-none">
            {isSuccess ? "Bienvenue" : "Configurez"} <br/>
            <span className="text-slate-300 font-normal">{isSuccess ? "à bord" : "votre accès"}</span>
          </h1>
          
          <p className="mt-4 text-[11px] text-slate-400 font-bold uppercase tracking-widest bg-slate-100/50 px-4 py-1 rounded-full border border-slate-100">
            {email}
          </p>
        </div>

        {/* FORMULAIRE */}
        {!isSuccess ? (
          <form onSubmit={handleFinishSetup} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-[9px] font-black tracking-[0.2em] uppercase text-center border border-red-100 flex items-center justify-center gap-2 animate-shake">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative group">
                <input 
                  required
                  type="password"
                  placeholder="NOUVEAU MOT DE PASSE"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white h-16 px-8 rounded-full text-[11px] font-bold uppercase tracking-widest outline-none border border-slate-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all shadow-sm group-hover:shadow-md"
                />
              </div>
              <div className="relative group">
                <input 
                  required
                  type="password"
                  placeholder="CONFIRMER LE MOT DE PASSE"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white h-16 px-8 rounded-full text-[11px] font-bold uppercase tracking-widest outline-none border border-slate-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all shadow-sm group-hover:shadow-md"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-950 text-white h-16 rounded-full font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all duration-500 shadow-xl disabled:bg-slate-300 active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>ACTIVER MON COMPTE <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center animate-pulse">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              Redirection vers votre espace de travail...
            </p>
          </div>
        )}

        {/* FOOTER */}
        <p className="mt-12 text-center text-[10px] text-slate-300 font-medium uppercase tracking-[0.2em]">
          Design System &copy; 2026 — Secure Access
        </p>
      </div>
    </div>
  );
}

export default function SetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FBFBFC]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-indigo-600" size={32} strokeWidth={1} />
          <span className="uppercase text-[10px] font-black tracking-[0.4em] text-slate-300">
            Initialisation de la session sécurisée
          </span>
        </div>
      </div>
    }>
      <SetupForm />
    </Suspense>
  );
}