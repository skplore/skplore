import Link from 'next/link';

export const metadata = {
  title: "404 — Page Not Found | Skplore",
  description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
  return (
    <section className="not-found-page" id="not-found">
      {/* Background effects */}
      <div className="not-found-bg" />
      <div className="not-found-noise" />

      <div className="not-found-content">
        {/* Giant "404" */}
        <div className="not-found-code">
          <span className="not-found-4">4</span>
          <span className="not-found-0">0</span>
          <span className="not-found-4 not-found-4-last">4</span>
        </div>

        {/* Decorative line */}
        <div className="not-found-divider" />

        <h1 className="not-found-title">PAGE NOT FOUND</h1>
        <p className="not-found-subtitle">
          The page you&apos;re looking for has wandered off the runway.
          <br />
          Let&apos;s get you back to the collection.
        </p>

        <div className="not-found-actions">
          <Link href="/" className="btn-magnetic" id="go-home-btn">
            BACK TO HOME
          </Link>
          <Link
            href="/clothing"
            className="btn-magnetic btn-magnetic--outline"
            style={{ borderColor: '#B8860B', color: '#B8860B' }}
            id="explore-btn"
          >
            EXPLORE CLOTHING
          </Link>
        </div>

        {/* Floating brand watermark */}
        <div className="not-found-watermark">
          SKPLORE
        </div>
      </div>
    </section>
  );
}
