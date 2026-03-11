-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nom" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Espace" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "siret" TEXT NOT NULL,
    "couleur" TEXT DEFAULT '#3b82f6',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "Espace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercice" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "isActif" BOOLEAN NOT NULL DEFAULT false,
    "espaceId" TEXT NOT NULL,

    CONSTRAINT "Exercice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT,
    "espaceId" TEXT NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Espace_siret_key" ON "Espace"("siret");

-- CreateIndex
CREATE UNIQUE INDEX "Exercice_code_espaceId_key" ON "Exercice"("code", "espaceId");

-- AddForeignKey
ALTER TABLE "Espace" ADD CONSTRAINT "Espace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercice" ADD CONSTRAINT "Exercice_espaceId_fkey" FOREIGN KEY ("espaceId") REFERENCES "Espace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_espaceId_fkey" FOREIGN KEY ("espaceId") REFERENCES "Espace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
