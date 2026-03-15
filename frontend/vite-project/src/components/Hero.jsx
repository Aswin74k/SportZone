import "./Hero.css";

function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-overlay">
        <div className="container">
          <div className="row align-items-center hero-row">
            <div className="col-lg-6">
              <div className="hero-content">
                <p className="hero-kicker">NEW SEASON • 2026 COLLECTION</p>

                <h1 className="hero-title">
                  Own Every <span>Play</span> With SportZone
                </h1>

                <p className="hero-subtitle">
                  Curated performance gear for football, cricket, badminton,
                  basketball, gym and more — trusted by athletes, built for
                  everyday players.
                </p>

                <div className="hero-buttons">
                  <button className="btn btn-warning btn-lg me-3 hero-primary-btn">
                    Shop Trending Gear
                  </button>

                  <button className="btn btn-outline-light btn-lg hero-secondary-btn">
                    Browse All Sports
                  </button>
                </div>

                <div className="hero-metrics">
                  <div>
                    <h4>500+</h4>
                    <p>Pro-grade products</p>
                  </div>
                  <div>
                    <h4>4.8★</h4>
                    <p>Average customer rating</p>
                  </div>
                  <div>
                    <h4>24h</h4>
                    <p>Express shipping</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6 d-none d-lg-block">
              <div className="hero-right-card">
                <div className="hero-tag">Featured Drop</div>
                <h3>Elite Matchday Pack</h3>
                <p>Match-ready boots, performance jersey and pro-quality ball.</p>

                <div className="hero-right-grid">
                  <div className="hero-pill">Lightweight</div>
                  <div className="hero-pill">Breathable</div>
                  <div className="hero-pill">Impact Ready</div>
                </div>

                <button className="btn btn-outline-light btn-sm mt-3">
                  View Pack Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;