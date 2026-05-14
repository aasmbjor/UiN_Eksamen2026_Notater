import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../../helpers/sanityClient';

/**
 * Komponent for å vise en liste over alle ordrer i systemet.
 * Viser også en egen visuell markering på de ordrene som tilhører 
 * den brukeren som for øyeblikket er logget inn.
 * 
 * @param {Object} loggedInUser - Informasjon om den innloggede brukeren (fra App.jsx)
 */
const Orders = ({ loggedInUser }) => {
  // --- Datatilstand og UI-tilstand ---
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // GROQ-spørring for ordrer:
        // Legg merke til at vi henter låntaker-info på to måter her:
        // 1. "borrowerId": borrower._ref -> Henter kun ID-en og lagrer den i variabelen borrowerId.
        //    Dette er supernyttig for å senere sjekke om ordren tilhører innlogget bruker, 
        //    uten å måtte grave dypt i objekter.
        // 2. borrower->{name} -> Henter selve dokumentet for å få tak i navnet til visning.
        const query = `*[_type == "order"]{
          _id,
          "borrowerId": borrower._ref,
          borrower->{name},
          books
        }`;
        
        const result = await client.fetch(query);
        setOrders(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Håndtering av laste- og feilstatus
  if (loading) return <div>Loading orders...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Orders</h1>
      
      {/* Knapp for å opprette ny ordre */}
      <p><Link className="button" to="/orders/new">+ New order</Link></p>
      
      <ul>
        {orders.map((order) => {
          // --- Logikk for utheving av egne ordrer ---
          // Sjekker først om loggedInUser faktisk finnes (er noen logget inn?).
          // Hvis ja, sjekker vi om ID-en til den innloggede brukeren er nøyaktig 
          // den samme som 'borrowerId'-en vi hentet ut i GROQ-spørringen.
          const isYours = loggedInUser && order.borrowerId === loggedInUser._id;
          
          return (
            <li key={order._id}>
              <Link to={`/orders/${order._id}`}>
                <strong>Order #{order._id}</strong><br />
              </Link>
              
              {/* Viser låntakerens navn, eller en fallback hvis navnet/låntakeren er slettet */}
              {order.borrower?.name || 'Unknown borrower'}
              
              {/* Hvis ordren tilhører den innloggede brukeren, legger vi på en grønn tekst */}
              {isYours && <span style={{ marginLeft: '0.5rem', color: 'green' }}>(yours)</span>}
              
              {' — '}
              
              {/* 
                Viser antall bøker i ordren.
                Ternary operator (?) sjekker om lengden er nøyaktig 1. 
                Hvis den er 1, legges det til en tom streng (''). 
                Hvis den er noe annet (0, 2, 3...), legges det til en 's' (for å få "books"). 
              */}
              {order.books?.length ?? 0} book{order.books?.length === 1 ? '' : 's'}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Orders;