"use client";

import { useActionState, useState, useTransition, useEffect } from 'react';
import { LayoutDashboard, ArrowRight, AlertCircle, Loader2, Rocket, UserCircle2, Mail, Lock, Building2 } from 'lucide-react';
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { creerEspace } from './action/espace';

export default function PortailAcces() {
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggingIn, startLoginTransition] = useTransition();
  const [loginError, setLoginError] = useState<string | null>(null);
  const router = useRouter();

  // Action d'inscription
  const [state, formAction, isPending] = useActionState(creerEspace, null);

  // GESTION DU LOGIN (Client-side pour NextAuth)
  // GESTION DU LOGIN (Client-side pour NextAuth)
  const handleLogin = async (formData: FormData) => {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    startLoginTransition(async () => {
      setLoginError(null);

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // On gère la redirection manuellement pour éviter le rechargement complet
      });

      if (result?.error) {
        // Traduction de l'erreur pour l'utilisateur
        setLoginError("Email ou mot de passe incorrect.");
      } else {
        // Connexion réussie !
        // On redirige vers la route /dashboard sans ID.
        // Le fichier app/dashboard/page.tsx fera l'aiguillage vers l'ID réel.
        router.push("/dashboard");

        // Refresh est crucial pour que le serveur mette à jour la session 
        // et que les composants serveurs (comme le sidebar) détectent la connexion.
        router.refresh();
      }
    });
  };

  // Switcher de fonction selon le mode
  const handleSubmit = (formData: FormData) => {
    if (showLogin) {
      handleLogin(formData);
    } else {
      formAction(formData);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-700 relative">

      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://shared.jasonbase.com/grid.svg')] opacity-[0.05]" />
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-400/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-400/10 rounded-full blur-[100px]" />
      </div>

      <header className="p-6 max-w-6xl mx-auto w-full flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
            <LayoutDashboard className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-slate-900 text-lg">FZN <span className="text-blue-600">Dash</span></span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start md:justify-center p-4 md:p-8 z-10">

        <div className="text-center mb-8 space-y-2 animate-in fade-in slide-in-from-bottom-4 fill-mode-both">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
            {showLogin ? "Ravi de vous " : "Prêt à lancer votre "}
            <span className="text-blue-600">{showLogin ? "revoir !" : "projet ?"}</span>
          </h1>
          <p className="text-slate-500 font-medium">
            {showLogin ? "Connectez-vous à votre interface de gestion" : "Créez votre compte et votre premier espace en 60 secondes"}
          </p>
        </div>

        <div className="max-w-md w-full animate-in zoom-in duration-500 fill-mode-both pb-10">

          <div className="flex p-1.5 bg-slate-200/50 backdrop-blur-sm rounded-[2rem] mb-6 border border-slate-200 shadow-inner">
            <button
              type="button"
              onClick={() => { setShowLogin(false); setLoginError(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.6rem] font-bold text-sm transition-all ${!showLogin ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Rocket className="w-4 h-4" /> Inscription
            </button>
            <button
              type="button"
              onClick={() => { setShowLogin(true); setLoginError(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.6rem] font-bold text-sm transition-all ${showLogin ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <UserCircle2 className="w-4 h-4" /> Connexion
            </button>
          </div>

          <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/40 border border-white">

            <form action={handleSubmit} className="space-y-5">

              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    name="email"
                    type="email"
                    placeholder="Email professionnel"
                    className="w-full bg-slate-50 px-5 py-4 pl-12 rounded-2xl border-2 border-transparent focus:border-blue-400 focus:bg-white transition-all outline-none"
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    name="password"
                    type="password"
                    placeholder="Mot de passe"
                    className="w-full bg-slate-50 px-5 py-4 pl-12 rounded-2xl border-2 border-transparent focus:border-blue-400 focus:bg-white transition-all outline-none"
                    required
                  />
                </div>
              </div>

              {!showLogin && (
                <div className="space-y-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      name="nomEspace"
                      placeholder="Nom de votre société"
                      className="w-full bg-slate-50 px-5 py-4 pl-12 rounded-2xl border-2 border-transparent focus:border-blue-400 focus:bg-white transition-all outline-none"
                      required={!showLogin}
                    />
                  </div>
                  <input
                    name="siret"
                    placeholder="N° SIRET (14 chiffres)"
                    className={`w-full bg-slate-50 px-5 py-4 rounded-2xl border-2 ${state?.error && !showLogin ? 'border-red-400 bg-red-50' : 'border-transparent focus:border-blue-400'} transition-all outline-none`}
                    required={!showLogin}
                  />
                </div>
              )}

              {/* Erreurs groupées */}
              {(state?.error || loginError) && (
                <div className="flex items-center gap-2 text-red-500 text-sm font-bold p-4 bg-red-50 rounded-2xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p>{state?.error || loginError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isPending || isLoggingIn}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:bg-slate-300 disabled:shadow-none"
              >
                {(isPending || isLoggingIn) ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  <>
                    {showLogin ? "Se connecter" : "Initialiser l'espace"}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-slate-400 text-xs font-bold uppercase tracking-widest opacity-60">
        © {new Date().getFullYear()} FZN Dashboard System
      </footer>
    </div>
  );
}