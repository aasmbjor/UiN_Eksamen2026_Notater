import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../../helpers/sanityClient';

/**
 * Komponent for å vise en liste over alle bøker, med mulighet for å 
 * filtrere på sjanger. Henter både bøker og sjangere fra Sanity.
 */
const Books = () => {
  // --- Datatilstand ---
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  
  // --- Filtreringstilstand ---
  // Holder styr på hvilken sjanger-ID brukeren har valgt å filtrere på. 
  // 'null' betyr at ingen sjanger er valgt (viser alle).
  const [selectedGenre, setSelectedGenre] = useState(null);
  
  // --- UI-tilstand ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // En sammensatt GROQ-spørring som henter to lister samtidig (books og genres).
        const query = `{
          "books": *[_type == "book"]{
            _id,
            title,
            publishedYear,
            isbn,
            // Henter navnet fra forfatter-referansen
            "author": author->name,
            // Henter den faktiske URL-en til bildet, ikke bare en referanse-ID
            "coverUrl": cover.asset->url,
            // Henter ID og tittel for hver sjanger i sjanger-arrayen
            "genres": genres[]->{ _id, title },
            // Sjekker om boken er utlånt:
            // Teller hvor mange "order"-dokumenter som refererer til akkurat denne boken (^._id).
            // Hvis antallet er større enn 0, er boken utlånt (returnerer true/false).
            "borrowed": count(*[_type == "order" && references(^._id)]) > 0
          } | order(title asc), // Sorterer bøkene alfabetisk etter tittel
          
          "genres": *[_type == "genre"] | order(title asc){ _id, title }
        }`;
        
        const result = await client.fetch(query);
        setBooks(result.books);
        setGenres(result.genres);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading books...</div>;
  if (error) return <div>Error: {error}</div>;

  // --- Filtreringslogikk ---
  // Hvis en sjanger er valgt (selectedGenre er ikke null), filtrerer vi bok-arrayen.
  const filteredBooks = selectedGenre
    ? books.filter(book =>
        // Optional chaining (?.) sikrer at koden ikke krasjer hvis book.genres er null/undefined.
        // .some() går gjennom sjangerne til boken og sjekker om minst én av dem
        // matcher ID-en til sjangeren brukeren har trykket på.
        book.genres?.some(genre => genre._id === selectedGenre)
      )
    : books; // Hvis ingen sjanger er valgt, vises alle bøkene som vanlig.

  return (
    <div>
      <h1>Books</h1>

      {/* Navigasjonsmeny for å filtrere bøker etter sjanger */}
      <nav className="book-filters">
        <p>Filter:</p>
        
        {/* Knapp for å nullstille filtreringen (vis alle) */}
        <button
          onClick={() => setSelectedGenre(null)}
          style={{ fontWeight: selectedGenre === null ? 'bold' : 'normal' }}
        >
          All
        </button>
        
        {/* Genererer dynamisk én knapp for hver sjanger vi hentet fra Sanity */}
        {genres.map(genre => (
          <button
            key={genre._id}
            onClick={() => setSelectedGenre(genre._id)}
            style={{ fontWeight: selectedGenre === genre._id ? 'bold' : 'normal' }}
          >
            {genre.title}
          </button>
        ))}
      </nav>

      <ul>
        {filteredBooks.map((book) => (
          <li key={book._id}>
            {/* Omslagsbilde med fallback til en placeholder hvis bilde mangler */}
            <img
              src={book.coverUrl || `https://placehold.co/40x60?text=${encodeURIComponent(book.title)}`}
              alt={`Cover of ${book.title}`}
              style={{ width: 40, height: 60, objectFit: 'cover', verticalAlign: 'middle', marginRight: 8 }}
            />
            
            <Link to={`/books/${book._id}`}>
              <strong>{book.title}</strong>
            </Link>{' '}
            
            {/* Visuell indikator på om boken er tilgjengelig eller ikke, 
                basert på det smarte "borrowed"-feltet fra GROQ-spørringen */}
            {book.borrowed ? (
              <span style={{ color: 'red', marginLeft: '0.5rem' }}>📕 Borrowed</span>
            ) : (
              <span style={{ color: 'green', marginLeft: '0.5rem' }}>✅ Available</span>
            )}
            
            <div>
              by {book.author} ({book.publishedYear}) - ISBN: {book.isbn}
              
              {/* Viser sjangere kun hvis boken faktisk har noen registrerte sjangere */}
              {book.genres?.length > 0 && (
                <span> — {book.genres.map(g => g.title).join(', ')}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Books;