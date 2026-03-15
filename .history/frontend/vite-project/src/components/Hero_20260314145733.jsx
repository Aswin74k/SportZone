import "./Hero.css";

function Hero() {
  return (
    <section className="hero-section">

      <div className="hero-overlay">

        <div className="hero-content container">

          <h1 className="hero-title">
            Upgrade Your Game With <span>SportZone</span>
          </h1>

          <p className="hero-subtitle">
            Discover premium sports equipment for football, cricket,
            badminton, basketball and more. Built for champions.
          </p>

          <div className="hero-buttons">
            <button className="btn btn-warning btn-lg me-3">
              Shop Now
            </button>

            <button className="btn btn-outline-light btn-lg">
              Explore Products
            </button>
          </div>

        </div>

      </div>

    </section>
  );
}

export default Hero;