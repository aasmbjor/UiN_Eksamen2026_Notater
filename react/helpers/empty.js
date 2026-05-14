import client from "./sanityClient.js";

/**
 * Et verktøyscript for å tømme Sanity-databasen.
 * Henter alle relevante dokumenter og sletter dem effektivt i én enkelt transaksjon.
 * Dette er typisk et script man kjører i terminalen under utvikling (f.eks. med 'node clearDb.js').
 */
async function clearDatabase() {
  console.log("Fetching all documents...");

  // GROQ-spørring: Henter KUN '_id'-feltet for alle dokumenter.
  // Vi trenger bare ID-en for å slette dem, så ved å utelate andre felt 
  // sparer vi masse båndbredde og minne hvis databasen er stor.
  // (Merk: '_type != "system"' filtrerer bort dokumenter av denne spesifikke typen).
  const docs = await client.fetch(`*[_type != "system"]{ _id }`);

  // Sjekker om databasen allerede er tom for å unngå å sende en tom transaksjon til Sanity
  if (docs.length === 0) {
    console.log("No documents to delete.");
    return;
  }

  console.log(`Deleting ${docs.length} documents...`);

  // Starter en ny Sanity-transaksjon. 
  // En transaksjon lar oss samle flere operasjoner (som opprettelse, endring eller sletting) 
  // i én enkelt API-forespørsel. Dette er mye raskere enn å slette ett og ett dokument.
  const tx = client.transaction();

  // Går gjennom alle dokumentene vi fant, og legger til en slette-operasjon 
  // for hver av dem i transaksjonen.
  docs.forEach(doc => {
    tx.delete(doc._id);
  });

  // Sender hele pakken (transaksjonen) til Sanity for utførelse.
  // Siden vi bruker 'await', venter koden her til Sanity bekrefter at alt er slettet.
  await tx.commit();

  console.log("Database cleared!");
}

// Starter funksjonen.
// .catch() på slutten fanger opp eventuelle feil (f.eks. nettverksbrudd eller manglende rettigheter i Sanity).
clearDatabase().catch(err => {
  console.error("En feil oppstod under sletting:", err);
  
  // process.exit(1) forteller terminalen/operativsystemet at scriptet avsluttet med en feil.
  // Dette er veldig nyttig hvis scriptet kjøres som en del av en større prosess (som CI/CD).
  process.exit(1);
});