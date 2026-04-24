"use client";

import { useState } from "react";
import { MoreHorizontal, Trash2, Mail, ShieldAlert, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserRowActions({ userId, userEmail, currentRole }: { userId: string, userEmail: string, currentRole: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (currentRole === 'OWNER') return;
    if (!confirm(`Supprimer définitivement l'accès de ${userEmail} ?`)) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error("Erreur de suppression");
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-white rounded-2xl transition-all shadow-sm active:scale-95 border border-transparent hover:border-slate-100"
      >
        {isDeleting ? <Loader2 size={20} className="animate-spin" /> : <MoreHorizontal size={20} />}
      </button>

      {isOpen && (
        <>
          {/* Overlay pour fermer le menu au clic extérieur */}
          <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
          
          {/* MENU DÉROULANT - Z-index 110 pour passer au dessus de l'overlay */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-50 z-[110] overflow-hidden p-2 animate-in fade-in slide-in-from-top-2">
            <button className="w-full flex items-center gap-4 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 rounded-2xl transition-colors text-left">
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                <Mail size={14} />
              </div>
              Renvoyer l'invitation
            </button>
            
            <button className="w-full flex items-center gap-4 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 rounded-2xl transition-colors text-left">
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                <ShieldAlert size={14} />
              </div>
              Modifier le rôle
            </button>

            <div className="h-px bg-slate-50 my-2 mx-4" />

            <button 
              onClick={handleDelete}
              disabled={currentRole === 'OWNER'}
              className="w-full flex items-center gap-4 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-2xl transition-colors text-left disabled:opacity-30 disabled:grayscale"
            >
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                <Trash2 size={14} />
              </div>
              Supprimer l'accès
            </button>
          </div>
        </>
      )}
    </div>
  );
}