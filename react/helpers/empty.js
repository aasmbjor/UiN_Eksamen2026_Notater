import client from "./sanityClient.js";

async function clearDatabase() {
  console.log("Fetching all documents...");

  // Hent alle dokumenter unntatt system-dokumenter
  const docs = await client.fetch(`*[_type != "system"]{ _id }`);

  if (docs.length === 0) {
    console.log("No documents to delete.");
    return;
  }

  console.log(`Deleting ${docs.length} documents...`);

  const tx = client.transaction();

  docs.forEach(doc => {
    tx.delete(doc._id);
  });

  await tx.commit();

  console.log("Database cleared!");
}

clearDatabase().catch(err => {
  console.error(err);
  process.exit(1);
});
