-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('DEVIS', 'FACTURE');

-- CreateEnum
CREATE TYPE "StatutFacture" AS ENUM ('BROUILLON', 'VALIDE', 'PAYE', 'ANNULE');

-- CreateTable
CREATE TABLE "Facture" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL DEFAULT 'DEVIS',
    "statut" "StatutFacture" NOT NULL DEFAULT 'BROUILLON',
    "dateEmission" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateEcheance" TIMESTAMP(3),
    "montantHT" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tva" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "espaceId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "exerciceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Facture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LigneFacture" (
    "id" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "quantite" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "prixUnitaire" DOUBLE PRECISION NOT NULL,
    "factureId" TEXT NOT NULL,

    CONSTRAINT "LigneFacture_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Facture" ADD CONSTRAINT "Facture_espaceId_fkey" FOREIGN KEY ("espaceId") REFERENCES "Espace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Facture" ADD CONSTRAINT "Facture_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Facture" ADD CONSTRAINT "Facture_exerciceId_fkey" FOREIGN KEY ("exerciceId") REFERENCES "Exercice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LigneFacture" ADD CONSTRAINT "LigneFacture_factureId_fkey" FOREIGN KEY ("factureId") REFERENCES "Facture"("id") ON DELETE CASCADE ON UPDATE CASCADE;
