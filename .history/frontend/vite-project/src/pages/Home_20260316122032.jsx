import React, { useEffect } from "react";
import Hero from "../components/Hero";
import Categories from "../components/Categories";
import FeaturedProducts from "../components/FeaturedProducts";
import Products from "../components/Products";
import Footer from "../components/Footer";

const Home = () => {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="home-page animate-fade-in">
      <Hero />
      <Categories />
      <FeaturedProducts />
      <Products />
      <Footer />
    </div>
  );
};

export default Home;