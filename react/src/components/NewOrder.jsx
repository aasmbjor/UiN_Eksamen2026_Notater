import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../helpers/sanityClient';

const NewOrder = () => {
  const navigate = useNavigate();

  const [borrowers, setBorrowers] = useState([]);
  const [books, setBooks] = useState([]);

  const [borrowerId, setBorrowerId] = useState('');
  const [selectedBookIds, setSelectedBookIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const query = `{
        "borrowers": *[_type == "borrower"] | order(name asc){ _id, name },
        "books": *[_type == "book"] | order(title asc){ _id, title, "author": author->name }
      }`;
      const result = await client.fetch(query);
      setBorrowers(result.borrowers);
      setBooks(result.books);
    };
    fetchData();
  }, []);

  const toggleBook = (bookId) => {
    setSelectedBookIds(prev =>
      prev.includes(bookId)
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

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
      const newOrder = await client.create({
        _type: 'order',
        borrower: { _type: 'reference', _ref: borrowerId },
        books: selectedBookIds.map(id => ({
          _type: 'reference',
          _ref: id,
          _key: crypto.randomUUID()
        })),
        orderDate: new Date().toISOString()
      });
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
