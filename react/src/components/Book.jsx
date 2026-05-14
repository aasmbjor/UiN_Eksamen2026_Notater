import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../../helpers/sanityClient';

/**
 * Komponent for å vise detaljer om en spesifikk bok.
 * Henter bok-ID fra nettadressen (URL) og gjør et oppslag mot Sanity
 * for å hente ut tittel, forfatter, publiseringsår, ISBN og omslagsbilde.
 */
const Book = () => {
  // Henter "id"-parameteren fra URL-en (f.eks. fra /books/:id)
  const { id } = useParams();
  
  // --- Datatilstand ---
  const [book, setBook] = useState(null);
  
  // --- UI-tilstand (brukergrensesnitt) ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Kjører funksjonen for å hente data hver gang komponenten lastes inn,
  // eller hvis 'id'-en i URL-en endrer seg.
  useEffect(() => {
    const fetchBook = async () => {
      try {
        // GROQ-spørring for en enkelt bok:
        // - Inkluderer kun dokumenter av typen "book" der _id matcher $id
        // - 'author->{name}' utvider forfatterreferansen for å hente navnet
        // - 'cover.asset->url' henter den faktiske bilde-URLen fra Sanity
        // - '[0]' på slutten sørger for at vi får returnert selve objektet, ikke en array med ett element
        const query = `*[_type == "book" && _id == $id]{title, author->{name}, publishedYear, isbn, "coverUrl": cover.asset->url}[0]`;
        
        // Sender med 'id' som et parameter til spørringen (sikrere og bedre for caching)
        const result = await client.fetch(query, { id });

        if (!result) {
          throw new Error('Book not found');
        }

        setBook(result);
      } catch (err) {
        setError(err.message);
      } finally {
        // Vi setter alltid loading til false til slutt, uansett om kallet 
        // gikk bra eller feilet. På den måten unngår vi at brukeren blir 
        // sittende fast på lasteskjermen.
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  // 'Early returns': Sjekk for lasting eller feil før vi prøver å vise dataen.
  // Dette forhindrer feilmeldinger som "Cannot read properties of null (reading 'title')"
  // siden 'book' er null helt til dataen er ferdig innlastet.
  if (loading) return <div>Loading book details...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>{book.title}</h1>
      
      {/* Viser omslagsbilde fra Sanity. Hvis boken mangler bilde (coverUrl er undefined/null),
          brukes placehold.co for å generere et midlertidig bilde med bokens tittel som tekst. */}
      <img
        src={book.coverUrl || `https://placehold.co/240x360?text=${encodeURIComponent(book.title)}`}
        alt={`Cover of ${book.title}`}
        style={{ maxWidth: 240 }}
      />
      
      <p>
        {/* Bruker '?' (optional chaining) for sikkerhets skyld, i tilfelle boken mangler forfatter */}
        <strong>Author:</strong> {book.author?.name || 'Unknown'}
      </p>
      <p>
        <strong>Published Year:</strong> {book.publishedYear || 'N/A'}
      </p>
      <p>
        <strong>ISBN:</strong> {book.isbn || 'N/A'}
      </p>
      
      <Link to="/books">Back to book list</Link>
    </div>
  );
};

export default Book;