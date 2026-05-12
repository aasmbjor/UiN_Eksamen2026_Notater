import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import client from '../../helpers/sanityClient';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) {
      setResults([]);
      return;
    }
    const fetchResults = async () => {
      setLoading(true);
      const query = `*[_type == "book" && (
        title match $term || author->name match $term
      )]{
        _id, title, "author": author->name, publishedYear
      } | order(title asc)`;
      const data = await client.fetch(query, { term: `*${q}*` });
      setResults(data);
      setLoading(false);
    };
    fetchResults();
  }, [q]);

  return (
    <div>
      <h1>Search results for "{q}"</h1>
      {loading ? (
        <p>Searching...</p>
      ) : results.length === 0 ? (
        <p>No books found.</p>
      ) : (
        <ul>
          {results.map(book => (
            <li key={book._id}>
              <Link to={`/books/${book._id}`}>{book.title}</Link>
              {book.author && ` — ${book.author}`}
              {book.publishedYear && ` (${book.publishedYear})`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchResults;
