import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../../helpers/sanityClient';

const Orders = ({ loggedInUser }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
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

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Orders</h1>
      <p><Link className="button" to="/orders/new">+ New order</Link></p>
      <ul>
        {orders.map((order) => {
          const isYours = loggedInUser && order.borrowerId === loggedInUser._id;
          return (
            <li key={order._id}>
              <Link to={`/orders/${order._id}`}>
                <strong>Order #{order._id}</strong><br />
              </Link>
              {order.borrower?.name || 'Unknown borrower'}
              {isYours && <span style={{ marginLeft: '0.5rem', color: 'green' }}>(yours)</span>}
              {' — '}
              {order.books?.length ?? 0} book{order.books?.length === 1 ? '' : 's'}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Orders;
