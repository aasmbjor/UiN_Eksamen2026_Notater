import client from "./sanityClient.js";
import { v4 as uuid } from "uuid";

// Hjelpefunksjon for å opprette en standard Sanity-referanse.
// Brukes for enkeltstående referansefelt (for eksempel én forfatter på én bok).
const ref = (id) => ({
  _type: "reference",
  _ref: id
});

// Hjelpefunksjon for å opprette en Sanity-referanse som skal ligge i en array.
// Sanity krever at alle elementer i en array (som en liste med sjangere eller bøker)
// har en unik '_key'-egenskap. Her bruker vi uuid() for å generere den automatisk.
const keyedRef = (id) => ({
  _type: "reference",
  _ref: id,
  _key: uuid()
});

/**
 * Hovedfunksjon for å "seede" (fylle) databasen med initial testdata.
 * Den sletter først alt gammelt innhold av bestemte typer, og oppretter 
 * deretter et komplett, ferdig koblet nettverk av forfattere, bøker, sjangere og ordrer.
 */
async function seed() {
  console.log("🧹 Tømmer databasen...");

  // --- SLETTING AV EKSISTERENDE DATA ---
  // Bruker en direkte slette-spørring mot Sanity. Dette sletter KUN de spesifiserte 
  // dokumenttypene, slik at vi ikke ved et uhell sletter andre viktige ting i Sanity 
  // (som f.eks. "system"-dokumenter eller bilde-assets).
  await client.delete({
    query: '*[_type in ["author", "book", "borrower", "order", "genre"]]'
  });

  console.log("✅ Databasen er tømt");
  console.log("🌱 Seeder testdata...");

  // --- OPPRETTELSE AV TESTDATA ---
  // Vi genererer UUID-er for alle dokumenter allerede her i koden.
  // Grunnen til det er at vi trenger å vite ID-en til for eksempel en "genre" 
  // slik at vi kan peke på den (referere til den) når vi oppretter en "book" litt lenger nede, 
  // FØR noen av dem faktisk er lagret i Sanity.

  // --- GENRES (Sjangere) ---
  const genres = [
    { _id: `genre-${uuid()}`, _type: "genre", title: "Fantasy" },
    { _id: `genre-${uuid()}`, _type: "genre", title: "Mystery" },
    { _id: `genre-${uuid()}`, _type: "genre", title: "Horror" },
    { _id: `genre-${uuid()}`, _type: "genre", title: "Literary Fiction" },
    { _id: `genre-${uuid()}`, _type: "genre", title: "Young Adult" }
  ];
  // Dekonstruerer (destructuring) arrayen for å enkelt kunne henvise til spesifikke sjangere senere
  const [fantasy, mystery, horror, literary, ya] = genres;

  // --- AUTHORS (Forfattere) ---
  const authors = [
    { _id: `author-${uuid()}`, _type: "author", name: "J.K. Rowling" },
    { _id: `author-${uuid()}`, _type: "author", name: "George R.R. Martin" },
    { _id: `author-${uuid()}`, _type: "author", name: "Haruki Murakami" },
    { _id: `author-${uuid()}`, _type: "author", name: "Agatha Christie" },
    { _id: `author-${uuid()}`, _type: "author", name: "Stephen King" },
    { _id: `author-${uuid()}`, _type: "author", name: "Neil Gaiman" },
    { _id: `author-${uuid()}`, _type: "author", name: "Brandon Sanderson" }
  ];

  // --- BOOKS (Bøker) ---
  const books = [
    {
      _id: `book-${uuid()}`,
      _type: "book",
      title: "Harry Potter and the Philosopher's Stone",
      isbn: "9780747532699",
      publishedYear: 1997,
      // Bruker hjelpefunksjonen 'ref' for å koble boken til forfatterens ID (J.K. Rowling)
      author: ref(authors[0]._id),
      // Bruker 'keyedRef' siden genres er en array
      genres: [keyedRef(fantasy._id), keyedRef(ya._id)]
    },
    {
      _id: `book-${uuid()}`,
      _type: "book",
      title: "Harry Potter and the Chamber of Secrets",
      isbn: "9780747538493",
      publishedYear: 1998,
      author: ref(authors[0]._id),
      genres: [keyedRef(fantasy._id), keyedRef(ya._id)]
    },
    {
      _id: `book-${uuid()}`,
      _type: "book",
      title: "A Game of Thrones",
      isbn: "9780553103540",
      publishedYear: 1996,
      author: ref(authors[1]._id),
      genres: [keyedRef(fantasy._id)]
    },
    {
      _id: `book-${uuid()}`,
      _type: "book",
      title: "A Clash of Kings",
      isbn: "9780553108033",
      publishedYear: 1998,
      author: ref(authors[1]._id),
      genres: [keyedRef(fantasy._id)]
    },
    {
      _id: `book-${uuid()}`,
      _type: "book",
      title: "Kafka on the Shore",
      isbn: "9781400079278",
      publishedYear: 2002,
      author: ref(authors[2]._id),
      genres: [keyedRef(literary._id)]
    },
    {
      _id: `book-${uuid()}`,
      _type: "book",
      title: "Norwegian Wood",
      isbn: "9780375704024",
      publishedYear: 1987,
      author: ref(authors[2]._id),
      genres: [keyedRef(literary._id)]
    },
    {
      _id: `book-${uuid()}`,
      _type: "book",
      title: "Murder on the Orient Express",
      isbn: "9780062693662",
      publishedYear: 1934,
      author: ref(authors[3]._id),
      genres: [keyedRef(mystery._id)]
    },
    {
      _id: `book-${uuid()}`,
      _type: "book",
      title: "The Shining",
      isbn: "9780385121675",
      publishedYear: 1977,
      author: ref(authors[4]._id),
      genres: [keyedRef(horror._id)]
    },
    {
      _id: `book-${uuid()}`,
      _type: "book",
      title: "It",
      isbn: "9780450411434",
      publishedYear: 1986,
      author: ref(authors[4]._id),
      genres: [keyedRef(horror._id)]
    },
    {
      _id: `book-${uuid()}`,
      _type: "book",
      title: "American Gods",
      isbn: "9780062572233",
      publishedYear: 2001,
      author: ref(authors[5]._id),
      genres: [keyedRef(fantasy._id), keyedRef(literary._id)]
    },
    {
      _id: `book-${uuid()}`,
      _type: "book",
      title: "Mistborn: The Final Empire",
      isbn: "9780765350381",
      publishedYear: 2006,
      author: ref(authors[6]._id),
      genres: [keyedRef(fantasy._id)]
    }
  ];

  // --- BORROWERS (Låntakere) ---
  const borrowers = [
    {
      _id: `borrower-${uuid()}`,
      _type: "borrower",
      name: "Ola Nordmann",
      email: "ola@example.com"
    },
    {
      _id: `borrower-${uuid()}`,
      _type: "borrower",
      name: "Kari Nordmann",
      email: "kari@example.com"
    },
    {
      _id: `borrower-${uuid()}`,
      _type: "borrower",
      name: "Per Hansen",
      email: "per.hansen@example.com"
    },
    {
      _id: `borrower-${uuid()}`,
      _type: "borrower",
      name: "Lise Johansen",
      email: "lise.j@example.com"
    }
  ];

  // --- ORDERS (Utlån/Ordrer) ---
  const orders = [
    {
      _id: `order-${uuid()}`,
      _type: "order",
      // Kobler ordren til spesifikke låntakere og bøker
      borrower: ref(borrowers[0]._id),
      books: [keyedRef(books[0]._id), keyedRef(books[2]._id)],
      orderDate: new Date("2024-01-10").toISOString()
    },
    {
      _id: `order-${uuid()}`,
      _type: "order",
      borrower: ref(borrowers[1]._id),
      books: [keyedRef(books[3]._id), keyedRef(books[4]._id)],
      orderDate: new Date("2024-02-03").toISOString()
    },
    {
      _id: `order-${uuid()}`,
      _type: "order",
      borrower: ref(borrowers[2]._id),
      books: [keyedRef(books[6]._id)],
      orderDate: new Date("2024-03-15").toISOString()
    },
    {
      _id: `order-${uuid()}`,
      _type: "order",
      borrower: ref(borrowers[3]._id),
      books: [
        keyedRef(books[1]._id),
        keyedRef(books[8]._id),
        keyedRef(books[10]._id)
      ],
      orderDate: new Date("2024-04-01").toISOString()
    },
    {
      _id: `order-${uuid()}`,
      _type: "order",
      borrower: ref(borrowers[0]._id),
      books: [keyedRef(books[9]._id)],
      orderDate: new Date("2024-04-20").toISOString()
    }
  ];

  // Slår sammen alle arrayene til én stor felles array ved hjelp av "spread"-operatoren (...)
  const allDocs = [...genres, ...authors, ...books, ...borrowers, ...orders];

  // --- COMMIT TIL DATABASEN ---
  // Starter en transaksjon slik at alle dokumentene opprettes i Sanity samtidig.
  // Dette er raskere og sikrere: Hvis ett dokument feiler, blir ingenting lagret.
  const tx = client.transaction();

  allDocs.forEach((doc) => {
    tx.create(doc);
  });

  // Sender transaksjonen til Sanity
  await tx.commit();

  console.log("🎉 Seeding fullført!");
}

// Kjører funksjonen, med feilhåndtering i tilfelle Sanity-kallet krasjer (f.eks. manglende API-nøkkel)
seed().catch((err) => {
  console.error("❌ Seeding feilet:", err);
  process.exit(1);
});