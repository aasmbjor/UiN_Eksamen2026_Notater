import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../../helpers/sanityClient';

const BorrowerProfile = () => {
  const { id } = useParams();
  const [borrower, setBorrower] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBorrower = async () => {
      const query = `{
        "borrower": *[_type == "borrower" && _id == $id][0]{
          _id, name, email
        },
        "orders": *[_type == "order" && borrower._ref == $id] | order(orderDate desc){
          _id,
          orderDate,
          "books": books[]->{ _id, title, "author": author->name }
        }
      }`;
      const result = await client.fetch(query, { id });
      setBorrower(result.borrower);
      setOrders(result.orders);
      setLoading(false);
    };
    fetchBorrower();
  }, [id]);

  if (loading) return <div>Loading borrower profile...</div>;
  if (!borrower) return <div>Borrower not found.</div>;

  const allBooks = orders.flatMap(order => order.books || []);
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
              {' — '}{order.books?.length ?? 0} book{order.books?.length === 1 ? '' : 's'}
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
              {book.author && ` — ${book.author}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BorrowerProfile;
