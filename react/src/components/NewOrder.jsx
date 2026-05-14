import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../helpers/sanityClient';

/**
 * Komponent for å opprette en ny bokbestilling (ordre).
 * Henter tilgjengelige låntakere og bøker fra Sanity, 
 * håndterer brukervalg, og sender inn et nytt bestillingsdokument.
 */
const NewOrder = () => {
  const navigate = useNavigate();

  // --- Datatilstand (hentet fra CMS) ---
  const [borrowers, setBorrowers] = useState([]);
  const [books, setBooks] = useState([]);

  // --- Tilstand for skjema (brukerinput) ---
  const [borrowerId, setBorrowerId] = useState('');
  const [selectedBookIds, setSelectedBookIds] = useState([]);
  
  // --- UI-tilstand (brukergrensesnitt) ---
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Henter initiell data når komponenten lastes inn
  useEffect(() => {
    const fetchData = async () => {
      // GROQ-spørring for å effektivt hente både låntakere og bøker i én enkelt forespørsel
      const query = `{
        "borrowers": *[_type == "borrower"] | order(name asc){ _id, name },
        "books": *[_type == "book"] | order(title asc){ _id, title, "author": author->name }
      }`;
      const result = await client.fetch(query);
      
      setBorrowers(result.borrowers);
      setBooks(result.books);
    };
    
    // TODO: Vurder å legge til try/catch her for å håndtere potensielle feil ved datahenting
    fetchData();
  }, []);

  /**
   * Bytter (toggler) valgt-statusen til en bok.
   * Hvis boken allerede finnes i arrayen, fjernes den. Hvis ikke, legges den til.
   * 
   * @param {string} bookId - Sanity-dokument-ID-en til boken.
   */
  const toggleBook = (bookId) => {
    setSelectedBookIds(prev =>
      prev.includes(bookId)
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  /**
   * Validerer skjemaet og sender inn et nytt bestillingsdokument til Sanity.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    // Grunnleggende skjemavalidering for å sikre at vi ikke sender inn ufullstendige bestillinger
    if (!borrowerId) {
      setError('Please choose a borrower.');
      return;
    }
    if (selectedBookIds.length === 0) {
      setError('Please select at least one book.');
      return;
    }

    setSubmitting(true);
    
    try {
      // Bygger opp dokumentstrukturen (payload) som skal sendes til Sanity
      const newOrder = await client.create({
        _type: 'order',
        
        // Oppretter en sterk referanse til det valgte låntakerdokumentet
        borrower: { _type: 'reference', _ref: borrowerId },
        
        // Mapper valgte bok-ID-er til en array med Sanity-referanser.
        // Merk: Sanity krever at elementer i en array har en unik _key-egenskap.
        books: selectedBookIds.map(id => ({
          _type: 'reference',
          _ref: id,
          _key: crypto.randomUUID() 
        })),
        orderDate: new Date().toISOString()
      });
      
      // Omdirigerer brukeren til detaljsiden for den nyopprettede bestillingen
      navigate(`/orders/${newOrder._id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1>New order</h1>
      <form onSubmit={handleSubmit}>
        <p>
          <label>
            Borrower:{' '}
            <select
              value={borrowerId}
              onChange={(e) => setBorrowerId(e.target.value)}
              disabled={submitting}
            >
              <option value="">— choose borrower —</option>
              {borrowers.map(b => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          </label>
        </p>

        <fieldset disabled={submitting}>
          <legend>Books</legend>
          {books.length === 0 ? (
            <p>Loading books…</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {books.map(book => (
                <li key={book._id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedBookIds.includes(book._id)}
                      onChange={() => toggleBook(book._id)}
                    />
                      {' '}{book.title}{book.author && ` — ${book.author}`}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </fieldset>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <p>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create order'}
          </button>
        </p>
      </form>
    </div>
  );
};

export default NewOrder;