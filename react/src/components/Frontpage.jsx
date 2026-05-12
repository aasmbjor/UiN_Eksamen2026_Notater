import { useState, useEffect } from 'react';
import client from '../../helpers/sanityClient';

export default function Frontpage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const query = `*[_type == "order"]{books}`;
        const result = await client.fetch(query);
        setOrders(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const activeOrders = orders.length;
  const booksBorrowed = orders.reduce((count, order) => count + (order.books?.length || 0), 0);

  return (
    <div>
      <h1>Welcome to the Library System</h1>
      <p>Explore our collection of books and manage your library experience.</p>

      <section>
        <h2>Order summary</h2>
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