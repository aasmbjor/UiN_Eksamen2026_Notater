import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import client from '../../helpers/sanityClient';

/**
 * Komponent for å vise søkeresultater.
 * Henter søkeordet ("q") fra URL-en, gjør et søk mot Sanity (både på boktittel og forfatter),
 * og lister opp resultatene.
 */
const SearchResults = () => {
  // Henter søkeparametere fra URL-en (f.eks. ?q=ringenes+herre)
  const [searchParams] = useSearchParams();
  
  // Henter ut selve søkeordet. Hvis det ikke finnes, settes det til en tom streng.
  const q = searchParams.get('q') || '';
  
  // --- Datatilstand og UI-tilstand ---
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Tidlig retur ("Early return"): Hvis det ikke er noe søkeord, tømmer vi 
    // eventuelle tidligere resultater og avbryter hele funksjonen. 
    // Da slipper vi å gjøre unødvendige og tomme kall til API-et.
    if (!q) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      
      try {
        // GROQ-spørring for fritekstsøk:
        // 'match'-operatoren brukes for å søke etter tekst. 
        // Vi sjekker om søkeordet ($term) finnes i ELLER (||) bokens tittel 
        // ELLER i forfatterens navn (som vi gjør et oppslag på via author->name).
        const query = `*[_type == "book" && (
          title match $term || author->name match $term
        )]{
          _id, title, "author": author->name, publishedYear
        } | order(title asc)`;
        
        // Vi pakker inn søkeordet 'q' i stjerner (*). Dette fungerer som et "wildcard".
        // Det betyr at hvis brukeren søker på "pot", vil den finne "Harry Potter", 
        // fordi stjernene tillater tekst både før og etter søkeordet.
        const data = await client.fetch(query, { term: `*${q}*` });
        
        setResults(data);
      } catch (error) {
        // En god praksis er å alltid ha en try/catch rundt API-kall, 
        // selv om du kanskje ikke viser feilmeldingen til brukeren her akkurat nå.
        console.error("Feil ved henting av søkeresultater:", error);
      } finally {
        // Skrur av lasteskjermen uansett om kallet gikk bra eller feilet
        setLoading(false);
      }
    };

    fetchResults();
  }, [q]); // useEffect kjører på nytt hver gang søkeordet i URL-en (q) endrer seg

  return (
    <div>
      <h1>Search results for "{q}"</h1>
      
      {/* 
        Håndterer de tre ulike tilstandene appen kan være i under et søk:
        1. Venter på svar (loading)
        2. Fikk svar, men fant ingen bøker (results.length === 0)
        3. Fikk svar og fant bøker (viser listen)
      */}
      {loading ? (
        <p>Searching...</p>
      ) : results.length === 0 ? (
        <p>No books found.</p>
      ) : (
        <ul>
          {results.map(book => (
            <li key={book._id}>
              <Link to={`/books/${book._id}`}>{book.title}</Link>
              
              {/* Bruker '&&' for å kun vise forfatter og årstall hvis dataen faktisk eksisterer i Sanity */}
              {book.author && ` — ${book.author}`}
              {book.publishedYear && ` (${book.publishedYear})`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchResults;