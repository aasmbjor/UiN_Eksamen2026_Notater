import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../../helpers/sanityClient';

/**
 * Komponent for å vise profilen til en låntaker.
 * Henter låntakerens detaljer og all utlånshistorikk (ordrer).
 * Viser også en oppsummert liste over alle unike bøker personen har lånt.
 */
const BorrowerProfile = () => {
  // Henter ID-en til låntakeren fra URL-en
  const { id } = useParams();
  
  // --- Datatilstand ---
  const [borrower, setBorrower] = useState(null);
  const [orders, setOrders] = useState([]);
  
  // --- UI-tilstand ---
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBorrower = async () => {
      // En sammensatt GROQ-spørring som henter låntakeren og ordrene deres i ett kall
      const query = `{
        // Henter selve låntaker-dokumentet
        "borrower": *[_type == "borrower" && _id == $id][0]{
          _id, name, email
        },
        
        // Henter alle ordrer der referansen til låntakeren matcher ID-en vi ser på.
        // Sorterer slik at de nyeste ordrene kommer først (descending).
        "orders": *[_type == "order" && borrower._ref == $id] | order(orderDate desc){
          _id,
          orderDate,
          // Utvider bok-referansene i ordren for å få ut tittel og forfatternavn
          "books": books[]->{ _id, title, "author": author->name }
        }
      }`;
      
      const result = await client.fetch(query, { id });
      
      setBorrower(result.borrower);
      setOrders(result.orders);
      setLoading(false);
    };
    
    // TODO: Kan vurdere å legge til feilhåndtering (try/catch) her
    fetchBorrower();
  }, [id]);

  // Viser lasteskjerm eller feilmelding hvis låntakeren ikke finnes
  if (loading) return <div>Loading borrower profile...</div>;
  if (!borrower) return <div>Borrower not found.</div>;

  // --- Databehandling: Finne unike bøker på tvers av alle ordrer ---
  
  // 1. flatMap slår sammen (flatterer) alle arrayene med bøker fra de ulike ordrene
  // til én stor, flat array med bøker. (Bruk av || [] sikrer mot feil hvis en ordre mangler bøker).
  const allBooks = orders.flatMap(order => order.books || []);
  
  // 2. Filtrerer ut duplikater. Siden en Map krever at nøkler (keys) er unike, 
  // bruker vi bokens _id som nøkkel. Hvis samme bok dukker opp flere ganger, 
  // vil den bare overskrive den forrige på samme nøkkel. Til slutt henter vi 
  // ut bare verdiene (.values()) og gjør det tilbake til en array (Array.from).
  const uniqueBooks = Array.from(
    new Map(allBooks.map(book => [book._id, book])).values()
  );

  return (
    <div>
      <h1>{borrower.name}</h1>
      {borrower.email && <p>{borrower.email}</p>}

      <h2>Orders ({orders.length})</h2>
      {orders.length === 0 ? (
        <p>No orders.</p>
      ) : (
        <ul>
          {orders.map(order => (
            <li key={order._id}>
              <Link to={`/orders/${order._id}`}>
                Order on {new Date(order.orderDate).toLocaleDateString()}
              </Link>
              {' — '}
              {/* nullish coalescing (??) gir 0 hvis books er undefined. 
                  Ternary operator (?) brukes for å legge til 's' i 'books' hvis antallet ikke er nøyaktig 1. */}
              {order.books?.length ?? 0} book{order.books?.length === 1 ? '' : 's'}
            </li>
          ))}
        </ul>
      )}

      <h2>Books borrowed ({uniqueBooks.length})</h2>
      {uniqueBooks.length === 0 ? (
        <p>No books borrowed yet.</p>
      ) : (
        <ul>
          {uniqueBooks.map(book => (
            <li key={book._id}>
              <Link to={`/books/${book._id}`}>{book.title}</Link>
              {/* Viser forfatter kun hvis det finnes */}
              {book.author && ` — ${book.author}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BorrowerProfile;