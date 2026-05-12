import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../../helpers/sanityClient';

const Order = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const query = `*[_type == "order" && _id == $id]{_id, borrower->{name}, books[]->{title, author->{name}}, orderDate}[0]`;
        const result = await client.fetch(query, { id });

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
  }, [id]);

  if (loading) return <div>Loading order details...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2 className="text-sm">Order #{order._id}</h2>
      <p>
        <strong>Borrower:</strong> {order.borrower?.name || 'Unknown'}
      </p>
      <p>
        <strong>Order date:</strong> {order.orderDate ? new Date(order.orderDate).toLocaleString() : 'N/A'}
      </p>
      <p>
        <strong>Books:</strong> {order.books?.length ?? 0}
      </p>
      <ul>
        {order.books?.map((book) => (
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
