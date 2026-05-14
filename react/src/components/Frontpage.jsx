import { useState, useEffect } from 'react';
import client from '../../helpers/sanityClient';

/**
 * Forside-komponent for bibliotekssystemet.
 * Viser en velkomstmelding og en rask oppsummering av aktiviteten i biblioteket
 * (antall aktive ordrer og totalt antall utlånte bøker).
 */
export default function Frontpage() {
  // --- Tilstand ---
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        // GROQ-spørring: Henter alle ordrer, men henter *kun* "books"-feltet.
        // Dette er god praksis for å spare båndbredde, siden vi bare trenger 
        // å telle bøkene her, ikke vite tittel, forfatter eller hvem som lånte dem.
        const query = `*[_type == "order"]{books}`;
        
        // Venter på svar fra Sanity API-et
        const result = await client.fetch(query);
        setOrders(result);
      } catch (err) {
        // Hvis API-kallet feiler, fanges feilen opp her og vi setter en 
        // egen feilmelding i tilstanden slik at brukeren får beskjed.
        setError(err.message);
      } finally {
        // Kjører uansett utfall når svaret fra API-et har kommet 
        // (enten det gikk bra eller feilet). Skrur av "loading"-statusen.
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  // --- Databehandling (Statistikk) ---
  
  // Antall aktive ordrer er rett og slett lengden på arrayen vi fikk tilbake
  const activeOrders = orders.length;
  
  // Beregner totalt antall utlånte bøker på tvers av alle ordrer.
  // Array.reduce "klemmer sammen" alle ordrene til én enkelt verdi (et tall).
  // 'count' starter på 0. For hver 'order' legger vi til antall bøker i den ordren.
  // (order.books?.length || 0) beskytter mot feil hvis en ordre tilfeldigvis mangler bøker.
  const booksBorrowed = orders.reduce((count, order) => count + (order.books?.length || 0), 0);

  return (
    <div>
      <h1>Welcome to the Library System</h1>
      <p>Explore our collection of books and manage your library experience.</p>

      <section>
        <h2>Order summary</h2>
        
        {/* 
          Håndterer de ulike visningstilstandene (loading, error, success)
          ved hjelp av kjedede ternary operators (if/else på én linje).
        */}
        {loading ? (
          <p>Loading order statistics...</p>
        ) : error ? (
          <p>Error loading summary: {error}</p>
        ) : (
          <div>
            <p>Active orders: {activeOrders}</p>
            <p>Books currently borrowed: {booksBorrowed}</p>
          </div>
        )}
      </section>
    </div>
  );
}