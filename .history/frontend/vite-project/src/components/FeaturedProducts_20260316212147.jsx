import React from 'react';
import Slider from 'react-slick';
import ProductCard from './ProductCard';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './FeaturedProducts.css';

const NextArrow = ({ onClick }) => (
  <button className="carousel-arrow next-arrow shadow" onClick={onClick}>
    <FaChevronRight />
  </button>
);

const PrevArrow = ({ onClick }) => (
  <button className="carousel-arrow prev-arrow shadow" onClick={onClick}>
    <FaChevronLeft />
  </button>
);

// Sample product data reused here. In a real app this would be fetched or passed via props/context.
export const sampleProducts = [
  {
    id: 1,
    name: 'Pro Series Football',
    price: 35.99,
    category: 'Football',
    image: 'https://images.unsplash.com/photo-1614632537190-23e4146777db?q=80&w=2000&auto=format&fit=crop',
    description: 'FIFA quality pro match ball with seamless surface.'
  },
  {
    id: 2,
    name: 'Premium English Willow Bat',
    price: 199.99,
    category: 'Cricket',
    image: 'https://images.unsplash.com/photo-1593341646782-e0b495cff86d?q=80&w=2000&auto=format&fit=crop',
    description: 'Grade 1 English willow for explosive power and balance.'
  },
  {
    id: 3,
    name: 'Air Zoom Running Shoes',
    price: 129.50,
    category: 'Sports Shoes',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop',
    description: 'Lightweight responsive cushioning for maximum speed.'
  },
  {
    id: 4,
    name: 'Carbon Fiber Badminton Racket',
    price: 85.00,
    category: 'Badminton',
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=2070&auto=format&fit=crop',
    description: 'Ultra-light frame for fast swings and smashes.'
  },
  {
    id: 5,
    name: 'Official Game Basketball',
    price: 59.90,
    category: 'Basketball',
    image: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?q=80&w=2071&auto=format&fit=crop',
    description: 'Deep channel design for excellent grip and control.'
  },
  {
    id: 6,
    name: 'Pro Cricket Ball 5.5oz',
    price: 24.99,
    category: 'Cricket',
    image: 'https://images.unsplash.com/photo-1531415074968-03611b678137?q=80&w=2069&auto=format&fit=crop',
    description: 'Alum tanned leather core with pronounced seam.'
  }
];

const FeaturedProducts = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          arrows: false
        }
      }
    ]
  };

  return (
    <section className="py-5 bg-light featured-products-section">
      <div className="container py-lg-4">
        <div className="text-center mb-5">
          <span className="text-primary fw-bold text-uppercase tracking-wide small">Top Picks</span>
          <h2 className="display-6 fw-bold mb-3">Featured Products</h2>
          <p className="text-muted mx-auto max-w-600">
            Discover our handpicked selection of top-rated sports equipment loved by professionals.
          </p>
        </div>
        
        <div className="row px-2 px-md-4 position-relative">
          <Slider {...settings} className="product-slider pb-5">
            {sampleProducts.map(product => (
              <div key={product.id} className="p-3">
                <ProductCard product={product} />
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
