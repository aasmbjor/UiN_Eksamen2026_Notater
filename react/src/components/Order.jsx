import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../../helpers/sanityClient';

/**
 * Komponent for å vise en enkeltstående ordre i detalj.
 * Henter ordre-ID fra URL, gjør oppslag mot Sanity, og nøster ut
 * referanser til både låntaker og bøker (inkludert forfattere).
 */
const Order = () => {
  // Henter ID-en til ordren fra nettadressen (eks: /orders/12345)
  const { id } = useParams();
  
  // --- Tilstander ---
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // Avansert GROQ-spørring med "dyp utpakking" (nested dereferencing):
        // 1. Finner riktig ordre basert på $id
        // 2. borrower->{name} henter navnet på låntakeren direkte
        // 3. books[]->{...} går gjennom alle bok-referansene og henter ut tittel...
        // 4. ...og inni der igjen: author->{name} gjør et ekstra oppslag for å hente forfatternavnet.
        // [0] på slutten sikrer at vi får tilbake selve objektet, ikke en array med ett objekt.
        const query = `*[_type == "order" && _id == $id]{_id, borrower->{name}, books[]->{title, author->{name}}, orderDate}[0]`;
        const result = await client.fetch(query, { id });

        // Kaster en feil hvis oppslaget returnerer tomt (f.eks. ved feil URL).
        // Dette fanges opp av catch-blokken rett under.
        if (!result) {
          throw new Error('Order not found');
        }

        setOrder(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]); // Avhengighets-arrayen sikrer at vi henter data på nytt hvis ID-en i URL-en endrer seg

  // --- Tidlig retur ("Early returns") ---
  // Stopper rendringen av hovedkomponenten hvis vi fortsatt laster eller fikk feil.
  // Dette forhindrer at koden under prøver å lese data fra 'order' før den finnes (som ville gitt krasj).
  if (loading) return <div>Loading order details...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2 className="text-sm">Order #{order._id}</h2>
      
      <p>
        {/* ?. (optional chaining) sikrer at det ikke krasjer hvis borrower er slettet eller mangler.
            || 'Unknown' gir en fallback-tekst hvis venstresiden er falsy. */}
        <strong>Borrower:</strong> {order.borrower?.name || 'Unknown'}
      </p>
      
      <p>
        {/* Konverterer ISO-datostrengen (f.eks. "2023-10-25T14:30:00Z") fra Sanity 
            til et mer brukervennlig og lokalt format basert på brukerens nettleser */}
        <strong>Order date:</strong> {order.orderDate ? new Date(order.orderDate).toLocaleString() : 'N/A'}
      </p>
      
      <p>
        {/* ?? (nullish coalescing) er valgt her i stedet for ||. 
            Det sikrer at vi får 0 kun hvis lengden faktisk er null eller undefined, 
            og at den ikke blander inn andre feil verdier. */}
        <strong>Books:</strong> {order.books?.length ?? 0}
      </p>
      
      <ul>
        {order.books?.map((book) => (
          // Bruker book.title som fallback-nøkkel, siden '_id' ikke ble bedt om for bøkene i GROQ-spørringen over
          <li key={book._id || book.title}>
            {book.title} by {book.author?.name ?? 'Unknown author'}
          </li>
        ))}
      </ul>
      
      <Link to="/orders">Back to orders</Link>
    </div>
  );
};

export default Order;