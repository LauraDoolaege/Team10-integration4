import { Outlet, Link } from 'react-router-dom';
import './styles/index.css';

export default function Root() {
  return (
    <div className="app">
      <nav>
        <Link to="/">Home</Link>
        <Link to="/trips">Trips</Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
