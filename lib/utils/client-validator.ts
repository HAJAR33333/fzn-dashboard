export function isClientComplet(client: any) {
  const champsObligatoires = [
    'nom', 'formeJuridique', 'contactPrenom', 'contactNom', 
    'adresse', 'codePostal', 'ville', 'pays', 
    'siret', 'email', 'telephone', 'statutClient'
  ];
  
  return champsObligatoires.every(champ => 
    client[champ] !== null && client[champ] !== undefined && client[champ].toString().trim() !== ""
  );
}