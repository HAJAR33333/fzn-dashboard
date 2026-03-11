"use client";

import { useActionState, useState, useTransition, useEffect } from 'react'; // Ajout de useEffect
import { LayoutDashboard, ArrowRight, AlertCircle, Loader2, Rocket, UserCircle2, Mail, Lock, Building2, ShieldCheck } from 'lucide-react';
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { creerEspace } from './action/espace';

export default function PortailAcces() {
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggingIn, startLoginTransition] = useTransition();
  const [loginError, setLoginError] = useState<string | null>(null);
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(creerEspace, null);

  // --- SÉCURITÉ ANTI-RETOUR (CACHE & HISTORIQUE) ---
  useEffect(() => {
    // 1. On injecte un nouvel état dans l'historique immédiatement
    window.history.pushState(null, "", window.location.href);

    const stopBack = () => {
      // 2. Si l'utilisateur clique sur "retour", on le force à rester ici
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", stopBack);

    return () => {
      window.removeEventListener("popstate", stopBack);
    };
  }, []);
  // --------------------------------------------------

  const handleLogin = async (formData: FormData) => {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    startLoginTransition(async () => {
      setLoginError(null);
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setLoginError("Email ou mot de passe incorrect.");
      } else {
        // Utilisation de replace pour ne pas laisser de trace de la page login dans la pile
        router.replace("/dashboard");
        router.refresh();
      }
    });
  };

  const handleSubmit = (formData: FormData) => {
    if (showLogin) handleLogin(formData);
    else formAction(formData);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col font-sans text-slate-200 relative overflow-hidden">
      {/* BACKGROUND DYNAMIQUE */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://shared.jasonbase.com/grid.svg')] opacity-[0.03]" />
      </div>

      <header className="p-8 max-w-7xl mx-auto w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-2xl shadow-xl shadow-blue-500/20">
            <LayoutDashboard className="text-white w-6 h-6" />
          </div>
          <span className="font-black text-white text-xl tracking-tighter uppercase italic">
            FZN <span className="text-blue-500">Dash</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Accès Sécurisé SSL</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 z-10">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* COLONNE GAUCHE */}
          <div className="space-y-8 text-center lg:text-left animate-in slide-in-from-left-8 duration-700">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Version 2.0 SaaS</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white leading-[1.1] tracking-tighter">
              {showLogin ? "Content de vous " : "Pilotez votre "}
              <span className="text-blue-500 block">{showLogin ? "revoir." : "business."}</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-md mx-auto lg:mx-0">
              {showLogin
                ? "Accédez à votre tableau de bord en temps réel et gérez vos flux financiers."
                : "Créez votre compte et déployez votre premier espace de gestion en moins de 60 secondes."}
            </p>
          </div>

          {/* COLONNE DROITE : Formulaire */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-white rounded-[3rem] shadow-2xl overflow-hidden p-8 md:p-12">

              {/* Toggle */}
              <div className="flex p-1.5 bg-slate-100 rounded-[2rem] mb-10 border border-slate-200 shadow-inner">
                <button
                  type="button"
                  onClick={() => { setShowLogin(false); setLoginError(null); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[1.6rem] font-black text-[11px] uppercase tracking-widest transition-all ${!showLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Rocket className="w-4 h-4" /> Inscription
                </button>
                <button
                  type="button"
                  onClick={() => { setShowLogin(true); setLoginError(null); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[1.6rem] font-black text-[11px] uppercase tracking-widest transition-all ${showLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <UserCircle2 className="w-4 h-4" /> Connexion
                </button>
              </div>

              <form action={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Email Pro</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                      <input
                        name="email"
                        type="email"
                        placeholder="nom@entreprise.com"
                        className="w-full bg-slate-50 px-5 py-4 pl-12 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-slate-700"
                        required
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Mot de passe</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                      <input
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-slate-50 px-5 py-4 pl-12 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-slate-700"
                        required
                      />
                    </div>
                  </div>
                </div>

                {!showLogin && (
                  <div className="space-y-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="group">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Nom de la structure</label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                        <input
                          name="nomEspace"
                          placeholder="Ex: Agence Digital..."
                          className="w-full bg-slate-50 px-5 py-4 pl-12 rounded-2xl border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-slate-700"
                          required={!showLogin}
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">N° SIRET</label>
                      <input
                        name="siret"
                        placeholder="14 chiffres obligatoires"
                        className={`w-full bg-slate-50 px-5 py-4 rounded-2xl border-2 ${state?.error && !showLogin ? 'border-red-400 bg-red-50' : 'border-transparent focus:border-blue-500'} transition-all outline-none font-bold text-slate-700`}
                        required={!showLogin}
                      />
                    </div>
                  </div>
                )}

                {(state?.error || loginError) && (
                  <div className="flex items-center gap-3 text-red-600 text-[11px] font-black p-4 bg-red-50 rounded-2xl border border-red-100 uppercase tracking-tighter">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p>{state?.error || loginError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPending || isLoggingIn}
                  className="w-full bg-blue-600 hover:bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:bg-slate-300 uppercase tracking-[0.2em] text-xs"
                >
                  {(isPending || isLoggingIn) ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    <>
                      {showLogin ? "Connexion" : "Lancer l'aventure"}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-8 text-center border-t border-white/5 bg-black/20">
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
          © {new Date().getFullYear()} FZN System — Protection des données biométriques & Isolation SaaS
        </p>
      </footer>
    </div>
  );
}