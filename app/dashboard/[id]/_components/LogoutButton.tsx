"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { LogOut, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function LogoutButton() {
    const [showConfirm, setShowConfirm] = useState(false);
    const [mounted, setMounted] = useState(false);

    // 1. Gérer le blocage du bouton retour
    useEffect(() => {
        setMounted(true);

        // On injecte une entrée factice dans l'historique
        window.history.pushState(null, "", window.location.href);

        const handlePopState = (e: PopStateEvent) => {
            // Empêche le navigateur de revenir réellement en arrière
            window.history.pushState(null, "", window.location.href);
            // On affiche notre modal à la place
            setShowConfirm(true);
        };

        // On écoute le bouton retour du système
        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, []);

    const handleLogout = async () => {
        // Remplacer l'historique pour éviter que l'utilisateur ne revienne ici
        window.history.replaceState(null, "", "/");

        await signOut({
            callbackUrl: "/",
            redirect: true
        });

        // Hard reload pour vider la mémoire vive du navigateur
        window.location.href = "/";
    };

    if (!mounted) return null;

    return (
        <>
            <button
                onClick={() => setShowConfirm(true)}
                className="flex items-center gap-3 text-slate-400 hover:text-red-600 transition-all font-bold group"
            >
                <div className="bg-white p-2.5 rounded-2xl border border-slate-200 group-hover:border-red-100 shadow-sm">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                </div>
                <div className="flex flex-col items-start leading-tight text-left">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Session</span>
                    <span className="text-sm text-slate-600 group-hover:text-red-600">Quitter l'espace</span>
                </div>
            </button>

            {showConfirm && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                    {/* Overlay avec clic pour fermer (optionnel) */}
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />

                    <div className="relative bg-white p-10 rounded-[3rem] shadow-2xl max-w-sm w-full border border-white animate-in zoom-in duration-300">
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-red-50 p-5 rounded-full text-red-600 mb-6">
                                <AlertTriangle size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Sécurité</h3>
                            <p className="text-slate-500 font-bold text-xs mt-4">
                                Pour protéger vos données, la déconnexion est obligatoire pour quitter cet espace.
                            </p>
                            <div className="grid grid-cols-1 gap-3 w-full mt-8">
                                <button
                                    onClick={handleLogout}
                                    className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black shadow-lg transition-all uppercase text-xs flex items-center justify-center gap-2"
                                >
                                    <LogOut size={16} /> Confirmer la déconnexion
                                </button>
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="w-full py-4 rounded-2xl bg-slate-100 text-slate-500 font-black uppercase text-xs"
                                >
                                    Rester ici
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}