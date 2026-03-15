import Hero from "../components/Hero";
import Categories from "../components/Categories";
// import FeaturedProducts from "../components/FeaturedProducts";
import Products from "../components/Products";
import Footer from "../components/Footer";

function Home() {
  return (
    <>
      <Hero />
      <Categories />
      {/* <FeaturedProducts /> */}
      <Products />
      <Footer />
    </>
  );
}

export default Home;