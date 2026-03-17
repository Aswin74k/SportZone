import React, { useEffect } from 'react';
import Hero from '../components/Hero';
import Categories from '../components/Categories';
// import FeaturedProducts from '../components/FeaturedProducts';

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="home-page animate-fade-in">
      <Hero />
      <Categories />
      <FeaturedProducts />
    </div>
  );
};

export default Home;