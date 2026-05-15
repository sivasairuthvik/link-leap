import { Link } from "react-router-dom";
import "../styles/Landing.css";

export default function Landing() {
  return (
    <div className="landing">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-icon">🔗</span>
            <span className="logo-text">link-leap</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it Works</a>
            <Link to="/dashboard" className="nav-btn">Dashboard</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Next-Generation Link<br />Management for <span className="highlight">Everyone</span>
          </h1>
          <p className="hero-subtitle">
            Transform your long URLs into powerful marketing tools with smart link shortening, 
            custom aliases, expiry dates, and real-time click analytics.
          </p>
          
          <div className="hero-cta">
            <Link to="/dashboard" className="btn-primary">
              Get Started Now
            </Link>
            <button className="btn-secondary">Learn More</button>
          </div>

          <div className="trust-badges">
            <span>✓ No credit card required</span>
            <span>✓ Free to start</span>
            <span>✓ Easy to use</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="feature-card">
            <h4>⚡ Lightning Fast</h4>
            <p>Shorten any URL instantly</p>
          </div>
          <div className="feature-card">
            <h4>📊 Track Clicks</h4>
            <p>Real-time analytics</p>
          </div>
          <div className="feature-card">
            <h4>🎯 Custom Alias</h4>
            <p>Branded short links</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="section-header">
          <h2>Powerful Features for Link Management</h2>
          <p>Everything you need to create, manage, and track your links</p>
        </div>

        <div className="features-grid">
          <div className="feature-box">
            <div className="feature-icon">⚡</div>
            <h3>Lightning Fast Shortening</h3>
            <p>Generate short links instantly. Our optimized service ensures your links are created in milliseconds.</p>
          </div>

          <div className="feature-box">
            <div className="feature-icon">📊</div>
            <h3>Click Analytics</h3>
            <p>Track every click on your links with real-time analytics. Understand your audience better.</p>
          </div>

          <div className="feature-box">
            <div className="feature-icon">🎯</div>
            <h3>Custom Branding</h3>
            <p>Use custom aliases to create branded short links that are memorable and professional.</p>
          </div>

          <div className="feature-box">
            <div className="feature-icon">⏰</div>
            <h3>Link Expiration</h3>
            <p>Set expiry dates on your links. Perfect for time-sensitive campaigns and limited offers.</p>
          </div>

          <div className="feature-box">
            <div className="feature-icon">🔗</div>
            <h3>Unlimited Links</h3>
            <p>Create as many short links as you want. No limits on the number of links you can generate.</p>
          </div>

          <div className="feature-box">
            <div className="feature-icon">🛡️</div>
            <h3>Permanent or Temporary</h3>
            <p>Choose between permanent links or set expiry dates. Complete control over your links.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works" id="how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Three simple steps to shorten your URLs</p>
        </div>

        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Paste Your URL</h3>
            <p>Enter any long URL you want to shorten in the input field.</p>
          </div>

          <div className="step-arrow">→</div>

          <div className="step">
            <div className="step-number">2</div>
            <h3>Customize (Optional)</h3>
            <p>Add a custom alias or set an expiry date for your link.</p>
          </div>

          <div className="step-arrow">→</div>

          <div className="step">
            <div className="step-number">3</div>
            <h3>Share & Track</h3>
            <p>Copy your short link and share it. Track clicks in real-time.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="final-cta">
        <h2>Stop Using Long, Complex URLs</h2>
        <p>Start creating smart, short links today. It's free and takes just seconds.</p>
        <Link to="/dashboard" className="btn-primary-lg">
          Create Your First Link Now
        </Link>
        <p className="cta-subtitle">No credit card required • Start free, upgrade later</p>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>link-leap</h4>
            <p>Smart URL shortening for everyone.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How it Works</a></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 link-leap. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
