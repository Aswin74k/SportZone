import React from 'react';
import { Link } from 'react-router-dom';
import './Categories.css';

const categoriesData = [
  { id: 1, name: 'Football', image: 'https://images.unsplash.com/photo-1518605368461-1ee7e53b2313?q=80&w=2080&auto=format&fit=crop' },
  { id: 2, name: 'Cricket', image: 'https://nwscdn.com/media/catalog/product/cache/h900xw900/s/e/setcomp-main_1_47.jpg' },
  { id: 3, name: 'Basketball', image: 'https://images.unsplash.com/photo-1542652694-40abf526446e?q=80&w=2070&auto=format&fit=crop' },
  { id: 4, name: 'Badminton', image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=2070&auto=format&fit=crop' },
  { id: 5, name: 'Sports Shoes', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop' },
];

const Categories = () => {
  return (
    <section className="py-5 bg-white">
      <div className="container py-lg-4">
        <div className="d-flex justify-content-between align-items-end mb-5">
          <div>
            <span className="text-primary fw-bold text-uppercase tracking-wide small">Discover</span>
            <h2 className="display-6 fw-bold mb-0">Shop by Category</h2>
          </div>
          <Link to="/shop" className="btn btn-outline-primary d-none d-md-inline-block rounded-pill px-4">
            View All
          </Link>
        </div>
        
        <div className="row g-4">
          {categoriesData.map((category) => (
            <div key={category.id} className="col-12 col-sm-6 col-lg-4 col-xl custom-col">
              <Link to={`/shop?category=${category.name.toLowerCase()}`} className="text-decoration-none">
                <div className="category-card rounded-4 overflow-hidden position-relative shadow-sm h-100">
                  <div className="category-img-wrapper h-100">
                    <img src={category.image} alt={category.name} className="category-img w-100 h-100 object-fit-cover" />
                  </div>
                  <div className="category-overlay d-flex align-items-end p-4">
                    <h4 className="text-white fw-bold mb-0 position-relative z-1 category-title">
                      {category.name}
                    </h4>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-5 d-md-none">
          <Link to="/shop" className="btn btn-outline-primary rounded-pill px-5">
            View All Categories
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Categories;