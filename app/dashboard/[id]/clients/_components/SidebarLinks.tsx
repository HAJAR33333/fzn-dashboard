"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CreditCard, Settings } from "lucide-react";

export default function SidebarLinks({ id }: { id: string }) {
  const pathname = usePathname();

  const links = [
    { href: `/dashboard/${id}`, label: "Vue d'ensemble", icon: <LayoutDashboard size={20} /> },
    { href: `/dashboard/${id}/clients`, label: "Clients", icon: <Users size={20} /> },
    { href: `/dashboard/${id}/gestion`, label: "Facturation", icon: <CreditCard size={20} /> },
    { href: `/dashboard/${id}/settings`, label: "Paramètres", icon: <Settings size={20} /> },
  ];

  return (
    <>
      {links.map((link) => {
        const isActive = pathname === link.href || (link.href !== `/dashboard/${id}` && pathname.startsWith(link.href));
        
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`
              relative flex items-center justify-between group p-4 rounded-2xl transition-all duration-300
              ${isActive 
                ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 translate-x-1' 
                : 'text-slate-500 hover:bg-white hover:shadow-md hover:translate-x-1'
              }
            `}
          >
            <div className="flex items-center gap-4">
              <span className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-indigo-600'}`}>
                {link.icon}
              </span>
              <span className="font-bold tracking-tight">{link.label}</span>
            </div>
            
            {isActive && (
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full shadow-[0_0_10px_rgba(129,140,248,0.8)]"></div>
            )}
          </Link>
        );
      })}
    </>
  );
}