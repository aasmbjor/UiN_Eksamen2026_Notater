import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../../helpers/sanityClient';

const Book = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const query = `*[_type == "book" && _id == $id]{title, author->{name}, publishedYear, isbn, "coverUrl": cover.asset->url}[0]`;
        const result = await client.fetch(query, { id });

        if (!result) {
          throw new Error('Book not found');
        }

        setBook(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  if (loading) return <div>Loading book details...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>{book.title}</h1>
      <img
        src={book.coverUrl || `https://placehold.co/240x360?text=${encodeURIComponent(book.title)}`}
        alt={`Cover of ${book.title}`}
        style={{ maxWidth: 240 }}
      />
      <p>
        <strong>Author:</strong> {book.author?.name || 'Unknown'}
      </p>
      <p>
        <strong>Published Year:</strong> {book.publishedYear || 'N/A'}
      </p>
      <p>
        <strong>ISBN:</strong> {book.isbn || 'N/A'}
      </p>
      <Link to="/books">Back to book list</Link>
    </div>
  );
};

export default Book;
