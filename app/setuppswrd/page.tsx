"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";

export default function SetupPassword() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");
  const spaceId = searchParams.get("space");

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pwdMetrics = useMemo(() => ({
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    isLongEnough: password.length >= 8,
  }), [password]);

  const isPasswordValid = Object.values(pwdMetrics).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/setup-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, spaceId }),
      });

      if (res.ok) {
        // Redirection vers le login avec un message de succès
        router.push("/?activated=true");
      } else {
        const data = await res.json();
        setError(data.error || "Une erreur est survenue");
      }
    } catch (err) {
      setError("Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  };

  if (!email || !spaceId) return <div className="text-white text-center p-20">Lien invalide.</div>;

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="mb-8">
             <div className="bg-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="text-white w-6 h-6" />
             </div>
            <h1 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter">
              Activer <span className="text-blue-600">votre accès</span>
            </h1>
            <p className="text-slate-500 font-bold text-sm mt-2">Configurez votre mot de passe pour {email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nouveau Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 px-5 py-4 pl-12 pr-12 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold text-slate-700"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-100">
              <ValidationItem label="8 Caractères min." valid={pwdMetrics.isLongEnough} />
              <ValidationItem label="Majuscule & Minuscule" valid={pwdMetrics.hasUpper && pwdMetrics.hasLower} />
              <ValidationItem label="Caractère spécial" valid={pwdMetrics.hasSpecial} />
            </div>

            {error && (
              <div className="text-red-500 text-[11px] font-black uppercase bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2">
                <XCircle size={14} /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!isPasswordValid || loading}
              className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 uppercase tracking-widest text-xs"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Activer mon compte"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function ValidationItem({ label, valid }: { label: string; valid: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${valid ? 'text-green-600' : 'text-slate-400'}`}>
      {valid ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
      <span className="text-[10px] font-black uppercase tracking-tight">{label}</span>
    </div>
  );
}