import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderToStream } from "@react-pdf/renderer";
import React from "react";
import InvoiceTemplate from "@/app/dashboard/[id]/_components/pdf/InvoiceTemplate";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const doc = await prisma.facture.findUnique({
    where: { id: id },
    include: { 
      client: true, 
      lignes: true, 
      espace: true 
    }
  });

  if (!doc) return new NextResponse("Document non trouvé", { status: 404 });

  try {
    // La correction magique : on passe par 'any' pour casser la validation stricte de DocumentProps
    // qui rentre en conflit avec les types standards de React Element
    const element = React.createElement(InvoiceTemplate, { data: doc }) as any;

    const stream = await renderToStream(element);
    
    return new NextResponse(stream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${doc.numero}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Erreur PDF:", error);
    return new NextResponse("Erreur génération PDF", { status: 500 });
  }
}