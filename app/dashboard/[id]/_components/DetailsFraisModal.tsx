"use client";

import { useState } from "react";
import { FileText, Printer, X, MapPin, Calendar, User, Car } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function DetailsFraisModal({ frais }: { frais: any }) {
  const [isOpen, setIsOpen] = useState(false);

  const genererPDF = () => {
    const doc = new jsPDF();
    
    // Header du PDF
    doc.setFontSize(20);
    doc.text("NOTE DE FRAIS KILOMÉTRIQUES", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Généré le ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 30);

    // Tableau des détails
    autoTable(doc, {
      startY: 40,
      head: [['Désignation', 'Détails']],
      body: [
        ['Collaborateur', `${frais.user.prenom} ${frais.user.nom}`],
        ['Date du trajet', format(new Date(frais.date), "dd MMMM yyyy", { locale: fr })],
        ['Client / Projet', frais.clientNom || "Non spécifié"],
        ['Distance parcourue', `${frais.distance} KM`],
        ['Taux appliqué', `${frais.taux} €/km`],
        ['Montant total', `${frais.montant.toFixed(2)} €`],
        ['Statut actuel', frais.statut],
      ],
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42] } // Couleur Slate-900
    });

    doc.save(`Frais_${frais.user.nom}_${format(new Date(frais.date), "yyyyMMdd")}.pdf`);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-indigo-50 rounded-xl text-slate-300 hover:text-indigo-600 transition-all"
      >
        <FileText size={18} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase italic leading-none">Détails du Frais</h2>
                  <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-widest">Récapitulatif complet</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20}/></button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <DetailBox icon={<Calendar size={16}/>} label="Date" value={format(new Date(frais.date), "dd/MM/yyyy")} />
                <DetailBox icon={<User size={16}/>} label="Collaborateur" value={`${frais.user.prenom} ${frais.user.nom}`} />
                <DetailBox icon={<MapPin size={16}/>} label="Client" value={frais.clientNom} />
                <DetailBox icon={<Car size={16}/>} label="Distance" value={`${frais.distance} km`} />
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase italic">Montant à rembourser</p>
                  <p className="text-3xl font-black text-slate-900 italic">{frais.montant.toFixed(2)} €</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase italic">Taux IK</p>
                    <p className="font-bold text-slate-600">{frais.taux} €/km</p>
                </div>
              </div>

              <button 
                onClick={genererPDF}
                className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black uppercase italic flex items-center justify-center gap-3 hover:bg-indigo-600 transition-colors shadow-lg shadow-slate-200"
              >
                <Printer size={20} />
                Imprimer en PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DetailBox({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="border border-slate-100 p-4 rounded-2xl">
      <div className="flex items-center gap-2 text-slate-400 mb-1 italic">
        {icon}
        <span className="text-[10px] font-black uppercase">{label}</span>
      </div>
      <p className="font-bold text-slate-900 truncate uppercase text-xs">{value || "---"}</p>
    </div>
  );
}