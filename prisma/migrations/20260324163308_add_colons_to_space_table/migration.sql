/*
  Warnings:

  - You are about to drop the column `tva` on the `Facture` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Espace" ADD COLUMN     "adresse" TEXT,
ADD COLUMN     "codePostal" TEXT,
ADD COLUMN     "dirigeantNom" TEXT,
ADD COLUMN     "dirigeantPrenom" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "formeJuridique" TEXT,
ADD COLUMN     "pays" TEXT DEFAULT 'France',
ADD COLUMN     "telephone" TEXT,
ADD COLUMN     "ville" TEXT;

-- AlterTable
ALTER TABLE "Facture" DROP COLUMN "tva",
ADD COLUMN     "montantTVA" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalTTC" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "LigneFacture" ADD COLUMN     "remise" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "tva" DOUBLE PRECISION NOT NULL DEFAULT 20;
