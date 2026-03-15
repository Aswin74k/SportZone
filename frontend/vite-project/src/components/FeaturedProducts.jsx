import Slider from "react-slick";
import "./FeaturedProducts.css";
import ProductCard from "./ProductCard";

const featuredProducts = [
  {
    id: 101,
    name: "Match Day Football",
    price: 1200,
    categoryLabel: "Football Equipment",
    image:
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 102,
    name: "Pro Cricket Bat",
    price: 4500,
    categoryLabel: "Cricket Gear",
    image:
      "https://images.unsplash.com/photo-1593341646782-e0b495cff86d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 103,
    name: "Lightweight Sports Shoes",
    price: 3299,
    categoryLabel: "Footwear",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 104,
    name: "Carbon Badminton Racket",
    price: 2499,
    categoryLabel: "Badminton Equipment",
    image:
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 105,
    name: "Indoor / Outdoor Basketball",
    price: 1899,
    categoryLabel: "Basketball Gear",
    image:
      "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: 106,
    name: "Leather Cricket Ball",
    price: 799,
    categoryLabel: "Cricket Gear",
    image:
      "https://images.unsplash.com/photo-1612776166701-835f7e4f6008?auto=format&fit=crop&w=1200&q=80",
  },
];

function FeaturedProducts() {
  const settings = {
    dots: false,
    arrows: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <section className="featured-section">
      <div className="container">
        <div className="featured-header">
          <div>
            <p className="featured-kicker">FEATURED • THIS WEEK</p>
            <h2 className="featured-title">Featured Products</h2>
          </div>
        </div>

        <Slider {...settings} className="featured-slider">
          {featuredProducts.map((product) => (
            <div className="featured-slide" key={product.id}>
              <div className="featured-card-wrapper">
                <ProductCard product={product} />
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
}

export default FeaturedProducts;

