import client from "./sanityClient.js";
import { v4 as uuid } from "uuid";

// Helper to create a plain reference (for single-reference fields)
const ref = (id) => ({
  _type: "reference",
  _ref: id
});

// Helper to create a keyed reference (for items inside an array of references)
const keyedRef = (id) => ({
  _type: "reference",
  _ref: id,
  _key: uuid()
});

async function seed() {
  console.log("🧹 Tømmer databasen...");

  // --- DELETE EXISTING DATA (kun disse typene) ---
  await client.delete({
    query: '*[_type in ["author", "book", "borrower", "order", "genre"]]'
  });

  console.log("✅ Databasen er tømt");
  console.log("🌱 Seeder testdata...");

  // --- GENRES ---
  const genres = [
    { _id: `genre-${uuid()}`, _type: "genre", title: "Fantasy" },
    { _id: `genre-${uuid()}`, _type: "genre", title: "Mystery" },
    { _id: `genre-${uuid()}`, _type: "genre", title: "Horror" },
    { _id: `genre-${uuid()}`, _type: "genre", title: "Literary Fiction" },
    { _id: `genre-${uuid()}`, _type: "genre", title: "Young Adult" }
  ];
  const [fantasy, mystery, horror, literary, ya] = genres;

  // --- AUTHORS ---
  const authors = [
    { _id: `author-${uuid()}`, _type: "author", name: "J.K. Rowling" },
    { _id: `author-${uuid()}`, _type: "author", name: "George R.R. Martin" },
    { _id: `author-${uuid()}`, _type: "author", name: "Haruki Murakami" },
    { _id: `author-${uuid()}`, _type: "author", name: "Agatha Christie" },
    { _id: `author-${uuid()}`, _type: "author", name: "Stephen King" },
    { _id: `author-${uuid()}`, _type: "author", name: "Neil Gaiman" },
    { _id: `author-${uuid()}`, _type: "author", name: "Brandon Sanderson" }
  ];

  // --- BOOKS ---
  const books = [
    {
      _id: `book-${uuid()}`,
      _type: "book",
      title: "Harry Potter and the Philosopher's Stone",
      isbn: "9780747532699",
      publishedYear: 1997,
      author: ref(authors[0]._id),
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

  // --- BORROWERS ---
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

  // --- ORDERS ---
  const orders = [
    {
      _id: `order-${uuid()}`,
      _type: "order",
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

  const allDocs = [...genres, ...authors, ...books, ...borrowers, ...orders];

  // --- COMMIT ---
  const tx = client.transaction();

  allDocs.forEach((doc) => {
    tx.create(doc);
  });

  await tx.commit();

  console.log("🎉 Seeding fullført!");
}

seed().catch((err) => {
  console.error("❌ Seeding feilet:", err);
  process.exit(1);
});
