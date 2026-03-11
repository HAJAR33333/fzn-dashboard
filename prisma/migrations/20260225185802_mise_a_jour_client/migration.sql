-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "adresse" TEXT,
ADD COLUMN     "codePostal" TEXT,
ADD COLUMN     "contactNom" TEXT,
ADD COLUMN     "contactPrenom" TEXT,
ADD COLUMN     "formeJuridique" TEXT,
ADD COLUMN     "pays" TEXT DEFAULT 'France',
ADD COLUMN     "siret" TEXT,
ADD COLUMN     "statutClient" TEXT,
ADD COLUMN     "telephone" TEXT,
ADD COLUMN     "ville" TEXT;
