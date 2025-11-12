import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function NotFound() {
  return (
    <div className="relative min-h-[60vh] grid place-items-center p-12 text-center">
      <SEO title="404 – Page Not Found" noindex />
      <div>
        <h1 className="text-3xl font-semibold text-white mb-3">Page Not Found</h1>
        <p className="text-white/70 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="btn-primary">
            Go Home
          </Link>
          <Link to="/gallery" className="btn-secondary">
            Browse Gallery
          </Link>
        </div>
      </div>
    </div>
  );
}
