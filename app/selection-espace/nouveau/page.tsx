"use client";

import { ajouterSocieteAction } from "@/app/action/espace";
import { useRouter } from "next/navigation"; // Import pour le retour
import { Building2, Plus, ArrowLeft, LayoutDashboard, Hash, Loader2, AlertCircle } from 'lucide-react';
import { useActionState } from "react";

export default function NouveauEspace() {
    const router = useRouter(); // Initialisation du router
    const [state, formAction, isPending] = useActionState(ajouterSocieteAction, null);

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background décoratif omis pour la clarté... */}

            <div className="max-w-xl w-full space-y-8 relative">

                {/* ✅ Bouton Retour Corrigé : Il utilise maintenant l'historique */}
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-4 md:absolute md:-left-24 md:top-2"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-semibold text-sm">Retour</span>
                </button>

                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 mb-2">
                        <LayoutDashboard className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nouvelle Organisation</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        Créer une <span className="text-blue-600">société</span>
                    </h1>
                </div>

                {/* Formulaire Card */}
                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/50">
                    {state?.error && (
                        <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold">
                            <AlertCircle className="w-4 h-4" />
                            {state.error}
                        </div>
                    )}

                    <form action={formAction} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="nomEspace" className="block text-sm font-bold text-slate-700 mb-2">Nom de la structure</label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
                                    <input
                                        type="text"
                                        id="nomEspace"
                                        name="nomEspace"
                                        required
                                        disabled={isPending}
                                        placeholder="Ex: Entreprise Dupont..."
                                        className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium disabled:opacity-50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="siret" className="block text-sm font-bold text-slate-700 mb-2">Numéro SIRET</label>
                                <div className="relative">
                                    <Hash className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
                                    <input
                                        type="text"
                                        id="siret"
                                        name="siret"
                                        required
                                        disabled={isPending}
                                        maxLength={14}
                                        pattern="[0-9]{14}"
                                        placeholder="14 chiffres"
                                        className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium disabled:opacity-50"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full mt-8 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex justify-center items-center gap-2 group"
                        >
                            {isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                            )}
                            {isPending ? "Création en cours..." : "Ajouter la configuration"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}