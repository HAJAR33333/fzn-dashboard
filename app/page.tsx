"use client";

import { useActionState, useState, useTransition, useEffect, useMemo } from 'react';
import {
  LayoutDashboard, ArrowRight, AlertCircle, Loader2, Rocket,
  UserCircle2, Mail, Lock, Building2, ShieldCheck, CheckCircle2, XCircle,
  Eye, EyeOff
} from 'lucide-react';
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { creerEspace } from './action/espace';

export default function PortailAcces() {
  const [showLogin, setShowLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // État pour l'oeil
  const [isLoggingIn, startLoginTransition] = useTransition();
  const [loginError, setLoginError] = useState<string | null>(null);
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(creerEspace, null);

  const [password, setPassword] = useState("");
  const [siret, setSiret] = useState("");

  // Sécurité Anti-Retour
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const stopBack = () => window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", stopBack);
    return () => window.removeEventListener("popstate", stopBack);
  }, []);

  // Logique de validation
  const pwdMetrics = useMemo(() => ({
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    isLongEnough: password.length >= 6,
    isPerfect: password.length > 8
  }), [password]);

  const isPasswordValid = pwdMetrics.hasUpper && pwdMetrics.hasLower && pwdMetrics.hasSpecial && pwdMetrics.isLongEnough;
  const isSiretValid = siret.length === 14;

  const handleLogin = async (formData: FormData) => {
    const email = formData.get("email") as string;
    const pwd = formData.get("password") as string;

    startLoginTransition(async () => {
      setLoginError(null);
      const result = await signIn("credentials", { email, password: pwd, redirect: false });
      if (result?.error) setLoginError("Email ou mot de passe incorrect.");
      else {
        router.replace("/dashboard");
        router.refresh();
      }
    });
  };

  const handleSubmit = (formData: FormData) => {
    if (showLogin) handleLogin(formData);
    else {
      if (!isPasswordValid || !isSiretValid) return;
      formAction(formData);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col font-sans text-slate-200 relative overflow-hidden">
      {/* BACKGROUND */}
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
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">SSL v3 Securing</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 z-10">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          <div className="space-y-8 text-center lg:text-left">
            <h1 className="text-5xl md:text-6xl font-black text-white leading-[1.1] tracking-tighter">
              {showLogin ? "Accès " : "Nouveau "}
              <span className="text-blue-500 block">{showLogin ? "Sécurisé." : "Départ."}</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-md mx-auto lg:mx-0">
              {showLogin ? "Heureux de vous revoir sur votre plateforme de gestion." : "Rejoignez l'écosystème FZN et boostez votre activité."}
            </p>
          </div>

          <div className="relative">
            <div className="relative bg-white rounded-[3rem] shadow-2xl overflow-hidden p-8 md:p-12">

              {/* TABS */}
              <div className="flex p-1.5 bg-slate-100 rounded-[2rem] mb-10 border border-slate-200">
                <button type="button" onClick={() => { setShowLogin(false); setLoginError(null); }} className={`flex-1 py-3.5 rounded-[1.6rem] font-black text-[11px] uppercase tracking-widest transition-all ${!showLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>Inscription</button>
                <button type="button" onClick={() => { setShowLogin(true); setLoginError(null); }} className={`flex-1 py-3.5 rounded-[1.6rem] font-black text-[11px] uppercase tracking-widest transition-all ${showLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>Connexion</button>
              </div>

              <form action={handleSubmit} className="space-y-5">
                {/* EMAIL */}
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                    <input name="email" type="email" placeholder="admin@fzn.com" className="w-full bg-slate-50 px-5 py-4 pl-12 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold text-slate-700" required />
                  </div>
                </div>

                {/* PASSWORD AVEC OPTION VOIR/CACHER */}
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 px-5 py-4 pl-12 pr-12 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold text-slate-700"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  {/* Indicateurs de force (Inscription seulement) */}
                  {!showLogin && password.length > 0 && (
                    <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-black uppercase ${isPasswordValid ? 'text-green-600' : 'text-orange-500'}`}>
                          {pwdMetrics.isPerfect ? 'Force: Parfait' : isPasswordValid ? 'Force: Acceptable' : 'Force: Insuffisant'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <ValidationItem label="Majuscule" valid={pwdMetrics.hasUpper} />
                        <ValidationItem label="Minuscule" valid={pwdMetrics.hasLower} />
                        <ValidationItem label="Spécial" valid={pwdMetrics.hasSpecial} />
                        <ValidationItem label="Min. 6 car." valid={pwdMetrics.isLongEnough} />
                      </div>
                    </div>
                  )}
                </div>

                {!showLogin && (
                  <>
                    <div className="group">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Structure</label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                        <input name="nomEspace" placeholder="Nom de l'entreprise" className="w-full bg-slate-50 px-5 py-4 pl-12 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold text-slate-700" required />
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 flex justify-between">
                        N° SIRET <span>{siret.length}/14</span>
                      </label>
                      <input
                        name="siret"
                        maxLength={14}
                        value={siret}
                        onChange={(e) => setSiret(e.target.value.replace(/\D/g, ''))}
                        placeholder="14 chiffres requis"
                        className={`w-full bg-slate-50 px-5 py-4 rounded-2xl border-2 transition-all outline-none font-bold text-slate-700 ${siret.length > 0 && !isSiretValid ? 'border-orange-300 bg-orange-50' : 'border-transparent focus:border-blue-500'}`}
                        required
                      />
                    </div>
                  </>
                )}

                {(state?.error || loginError) && (
                  <div className="flex items-center gap-3 text-red-600 text-[11px] font-black p-4 bg-red-50 rounded-2xl border border-red-100 uppercase">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p>{state?.error || loginError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPending || isLoggingIn || (!showLogin && (!isPasswordValid || !isSiretValid))}
                  className="w-full bg-blue-600 hover:bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:bg-slate-400 uppercase tracking-[0.2em] text-xs active:scale-95"
                >
                  {(isPending || isLoggingIn) ? <Loader2 className="animate-spin w-5 h-5" /> : (
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
          © {new Date().getFullYear()} FZN System — Cybersecurity Division
        </p>
      </footer>
    </div>
  );
}

function ValidationItem({ label, valid }: { label: string; valid: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 ${valid ? 'text-green-600' : 'text-slate-400'}`}>
      {valid ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
      <span className="text-[9px] font-bold uppercase tracking-tight">{label}</span>
    </div>
  );
}