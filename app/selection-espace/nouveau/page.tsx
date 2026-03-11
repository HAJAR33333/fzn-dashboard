"use client";

import { ajouterSocieteAction } from "@/app/action/espace";
import { useRouter } from "next/navigation";
import {
    Building2, Plus, ArrowLeft, LayoutDashboard,
    Hash, Loader2, AlertCircle, ShieldCheck, Globe
} from 'lucide-react';
import { useActionState } from "react";

export default function NouveauEspace() {
    const router = useRouter();
    const [state, formAction, isPending] = useActionState(ajouterSocieteAction, null);

    return (
        <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 md:p-10 font-sans">
            {/* Décoration d'arrière-plan - Sphères de couleur pour casser le côté "fade" */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[3rem] shadow-2xl overflow-hidden relative z-10 border border-white/20">

                {/* COLONNE GAUCHE : Branding & Infos SaaS (Remplit l'espace vide) */}
                <div className="bg-slate-900 p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500 rounded-full blur-[80px]" />
                    </div>

                    <div className="relative z-10">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-12 group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span className="font-bold text-sm">Retour</span>
                        </button>

                        <div className="space-y-6">
                            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <LayoutDashboard className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-4xl font-black leading-tight tracking-tighter">
                                Prêt à lancer votre <br />
                                <span className="text-blue-500 italic">nouvelle entité ?</span>
                            </h1>
                            <p className="text-slate-400 font-medium leading-relaxed max-w-sm">
                                Configurez votre espace de travail en quelques secondes et commencez à piloter votre activité.
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 space-y-4">
                        {/* Carte Info SaaS "Premium" */}
                        <div className="bg-white/5 border border-white/10 backdrop-blur-md p-6 rounded-[2rem]">
                            <div className="flex items-center gap-3 mb-3">
                                <ShieldCheck className="text-blue-400 w-5 h-5" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Standard SaaS Rule</span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                Un utilisateur unique est rattaché à une seule instance fiscale. Pour gérer plusieurs sociétés, contactez le support pour une offre <span className="text-white font-bold underline">Multi-Compte</span>.
                            </p>
                        </div>

                        <div className="flex items-center gap-4 text-slate-500 text-[10px] font-black uppercase tracking-widest px-2">
                            <div className="flex items-center gap-1"><Globe size={12} /> Cloud Sync</div>
                            <div className="flex items-center gap-1"><ShieldCheck size={12} /> Data Isolated</div>
                        </div>
                    </div>
                </div>

                {/* COLONNE DROITE : Formulaire */}
                <div className="p-12 lg:p-16 bg-white flex flex-col justify-center">
                    {state?.error && (
                        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-xl flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-xs font-bold">{state.error}</p>
                        </div>
                    )}

                    <form action={formAction} className="space-y-8">
                        <div className="space-y-6">
                            <div className="group">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-blue-600 transition-colors">
                                    Dénomination Sociale
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="text"
                                        name="nomEspace"
                                        required
                                        disabled={isPending}
                                        placeholder="Nom de la société"
                                        className="block w-full pl-8 pr-4 py-4 bg-transparent border-b-2 border-slate-100 focus:border-blue-600 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 disabled:opacity-50 text-lg"
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-blue-600 transition-colors">
                                    Identifiant SIRET
                                </label>
                                <div className="relative">
                                    <Hash className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="text"
                                        name="siret"
                                        required
                                        disabled={isPending}
                                        maxLength={14}
                                        pattern="[0-9]{14}"
                                        placeholder="14 chiffres"
                                        className="block w-full pl-8 pr-4 py-4 bg-transparent border-b-2 border-slate-100 focus:border-blue-600 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 disabled:opacity-50 text-lg"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full bg-blue-600 hover:bg-slate-900 text-white font-black py-5 px-8 rounded-2xl shadow-xl shadow-blue-500/20 hover:shadow-slate-900/20 transition-all flex justify-center items-center gap-3 group active:scale-[0.98]"
                            >
                                {isPending ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                                )}
                                <span className="uppercase tracking-widest text-sm">
                                    {isPending ? "Initialisation..." : "Activer l'Espace"}
                                </span>
                            </button>
                        </div>
                    </form>

                    <p className="mt-8 text-center text-[10px] text-slate-400 font-medium italic">
                        En validant, vous créez un nouvel exercice fiscal pour l'année {new Date().getFullYear()}.
                    </p>
                </div>
            </div>
        </div>
    );
}