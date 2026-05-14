import { Link, Outlet } from 'react-router-dom';
import Search from './Search';
import './Layout.css';

/**
 * Layout-komponent som fungerer som en felles "innpakning" (wrapper) for hele applikasjonen.
 * Sørger for at header, navigasjonsmeny og footer forblir synlige på tvers av alle undersider.
 * 
 * @param {Object} loggedInUser - Objekt med info om den innloggede brukeren (sendes ned som prop fra App.jsx)
 */
const Layout = ({ loggedInUser }) => {
  return (
    <div>
      <header className="layout-header">
        <h1>Library system</h1>
        
        {/* Frittstående søkekomponent injisert direkte i headeren */}
        <Search />
        
        <p>
          Welcome,{' '}
          {/* 
            Viser navnet på den innloggede brukeren til høyre i headeren.
            Hvis en bruker er logget inn, lages det en dynamisk lenke til profilen deres.
            Ternary operator (?) sørger for en fallback ('No user loaded') hvis brukerdata mangler.
          */}
          {loggedInUser
            ? <Link to={`/borrower/${loggedInUser._id}`}>{loggedInUser.name}</Link>
            : 'No user loaded'}
        </p>
      </header>

      {/* Hovedmeny for navigasjon mellom de ulike visningene i applikasjonen */}
      <nav className="layout-nav">
        <Link to="/">Home</Link>
        {' | '}
        <Link to="/books">Books</Link>
        {' | '}
        <Link to="/orders">Orders</Link>
        {' | '}
        <Link to="/orders/new">New Order</Link>
      </nav>

      <main>
        {/* 
          <Outlet /> er kjernekonseptet for nestet ruting i React Router. 
          Dette fungerer som en plassholder der selve innholdet fra undersidene 
          (som <Frontpage />, <Books /> eller <NewOrder />) blir skrevet ut, 
          basert på hvilken nettadresse (URL) brukeren besøker.
        */}
        <Outlet />
      </main>

      <footer className="layout-footer">
        <p><Link to="/privacy">Privacy</Link></p>
      </footer>
    </div>
  );
};

export default Layout;