"use client";

import { signOut } from "next-auth/react";
import { LogOut, ChevronRight } from 'lucide-react';

export default function LogoutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center justify-between group p-3 rounded-2xl bg-slate-50 hover:bg-red-50 transition-all active:scale-[0.98]"
        >
            <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg shadow-sm group-hover:text-red-600 transition-colors text-slate-400 border border-slate-100 group-hover:border-red-100">
                    <LogOut size={18} />
                </div>
                <span className="font-bold text-sm text-slate-600 group-hover:text-red-600">
                    Quitter l'espace
                </span>
            </div>
            <ChevronRight size={14} className="text-slate-300 group-hover:text-red-300" />
        </button>
    );
}