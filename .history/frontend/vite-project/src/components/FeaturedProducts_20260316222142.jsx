import React from "react";
import Slider from "react-slick";
import ProductCard from "./ProductCard";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "./FeaturedProducts.css";

function NextArrow(props) {
  const { onClick } = props;

  return (
    <div className="carousel-arrow next-arrow" onClick={onClick}>
      <FaChevronRight />
    </div>
  );
}

function PrevArrow(props) {
  const { onClick } = props;

  return (
    <div className="carousel-arrow prev-arrow" onClick={onClick}>
      <FaChevronLeft />
    </div>
  );
}

const sampleProducts = [
  {
    id: 1,
    name: "Pro Series Football",
    price: 35.99,
    category: "Football",
    image:
      "https://images.unsplash.com/photo-1614632537190-23e4146777db?q=80&w=2000",
    description: "FIFA quality pro match ball with seamless surface.",
  },
  {
    id: 2,
    name: "Premium English Willow Bat",
    price: 199.99,
    category: "Cricket",
    image:
      "https://images.unsplash.com/photo-1593341646782-e0b495cff86d?q=80&w=2000",
    description: "Grade 1 English willow bat.",
  },
  {
    id: 3,
    name: "Air Zoom Running Shoes",
    price: 129.5,
    category: "Sports Shoes",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070",
    description: "Lightweight responsive running shoes.",
  },
  {
    id: 4,
    name: "Carbon Fiber Badminton Racket",
    price: 85.0,
    category: "Badminton",
    image:
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=2070",
    description: "Ultra-light badminton racket.",
  },
  {
    id: 5,
    name: "Official Game Basketball",
    price: 59.9,
    category: "Basketball",
    image:
      "https://images.unsplash.com/photo-1519861531473-9200262188bf?q=80&w=2071",
    description: "Professional grip basketball.",
  },
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
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 1, arrows: false },
      },
    ],
  };

  return (
    <section className="py-5 bg-light featured-products-section">
      <div className="container py-lg-4">

        <div className="text-center mb-5">
          <h2 className="fw-bold">Featured Products</h2>
          <p className="text-muted">
            Discover our top sports equipment loved by professionals.
          </p>
        </div>

        <Slider {...settings}>
          {sampleProducts.map((product) => (
            <div key={product.id} className="p-3">
              <ProductCard product={product} />
            </div>
          ))}
        </Slider>

      </div>
    </section>
  );
};

export default FeaturedProducts;