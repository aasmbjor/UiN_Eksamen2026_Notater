import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * Enkel og gjenbrukbar søkekomponent.
 * Fanger opp brukerens input og oppdaterer nettadressen (URL) 
 * slik at søkeresultatsiden kan plukke opp søkeordet.
 */
const Search = () => {
  const navigate = useNavigate();
  
  // Henter ut eventuelle søkeparametere fra URL-en (f.eks. ?q=Harry+Potter)
  const [searchParams] = useSearchParams();
  
  // Setter startverdien i søkefeltet til 'q'-parameteren fra URL-en hvis den finnes.
  // Hvis ikke, starter feltet som en tom streng (''). 
  // Dette gjør at søkeordet ikke forsvinner hvis brukeren oppdaterer siden.
  const [query, setQuery] = useState(searchParams.get('q') || '');

  const handleSubmit = (event) => {
    // Forhindrer at hele nettsiden laster på nytt, som er standardoppførselen til HTML-skjemaer
    event.preventDefault();
    
    // .trim() fjerner eventuelle mellomrom i starten og slutten av søketeksten.
    // Hvis feltet bare inneholder mellomrom, eller er tomt, vil if-sjekken være 'falsy' 
    // og ingenting skjer (vi unngår unødvendige tomme søk).
    if (query.trim()) {
      // encodeURIComponent er viktig! Den konverterer spesialtegn og mellomrom 
      // til et format som er trygt å bruke i en URL (f.eks. omgjøres mellomrom til %20).
      // Navigerer deretter til SearchResults-komponenten (via ruten /search).
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={query}
        // Oppdaterer 'query'-tilstanden hver gang brukeren skriver en bokstav
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search books..."
      />
      <button type="submit">Search</button>
    </form>
  );
};

export default Search;