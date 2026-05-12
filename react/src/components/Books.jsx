import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../../helpers/sanityClient';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const query = `{
          "books": *[_type == "book"]{
            _id,
            title,
            publishedYear,
            isbn,
            "author": author->name,
            "coverUrl": cover.asset->url,
            "genres": genres[]->{ _id, title },
            "borrowed": count(*[_type == "order" && references(^._id)]) > 0
          } | order(title asc),
          "genres": *[_type == "genre"] | order(title asc){ _id, title }
        }`;
        const result = await client.fetch(query);
        setBooks(result.books);
        setGenres(result.genres);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading books...</div>;
  if (error) return <div>Error: {error}</div>;

  const filteredBooks = selectedGenre
    ? books.filter(book =>
        book.genres?.some(genre => genre._id === selectedGenre)
      )
    : books;

  return (
    <div>
      <h1>Books</h1>

      <nav className="book-filters">
        <p>Filter:</p>
        <button
          onClick={() => setSelectedGenre(null)}
          style={{ fontWeight: selectedGenre === null ? 'bold' : 'normal' }}
        >
          All
        </button>
        {genres.map(genre => (
          <button
            key={genre._id}
            onClick={() => setSelectedGenre(genre._id)}
            style={{ fontWeight: selectedGenre === genre._id ? 'bold' : 'normal' }}
          >
            {genre.title}
          </button>
        ))}
      </nav>

      <ul>
        {filteredBooks.map((book) => (
          <li key={book._id}>
            <img
              src={book.coverUrl || `https://placehold.co/40x60?text=${encodeURIComponent(book.title)}`}
              alt={`Cover of ${book.title}`}
              style={{ width: 40, height: 60, objectFit: 'cover', verticalAlign: 'middle', marginRight: 8 }}
            />
            <Link to={`/books/${book._id}`}>
              <strong>{book.title}</strong>
            </Link>{' '}
            {book.borrowed ? (
              <span style={{ color: 'red', marginLeft: '0.5rem' }}>📕 Borrowed</span>
            ) : (
              <span style={{ color: 'green', marginLeft: '0.5rem' }}>✅ Available</span>
            )}
            <div>
              by {book.author} ({book.publishedYear}) - ISBN: {book.isbn}
              {book.genres?.length > 0 && (
                <span> — {book.genres.map(g => g.title).join(', ')}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Books;
