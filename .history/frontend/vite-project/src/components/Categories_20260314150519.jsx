import "./Categories.css";

function Categories() {

  const categories = [
    {
      name: "Football",
      image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20"
    },
    {
      name: "Cricket",
      image: "https://images.unsplash.com/photo-1593341646782-e0b495cff86d"
    },
    {
      name: "Badminton",
      image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea"
    },
    {
      name: "Basketball",
      image: "https://images.unsplash.com/photo-1519861531473-9200262188bf"
    },
    {
      name: "Gym Equipment",
      image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e"
    },
    {
      name: "Running",
      image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5"
    }
  ];

  return (
    <section className="categories-section">

      <div className="container">

        <h2 className="categories-title">
          Shop By Category
        </h2>

        <div className="row">

          {categories.map((category, index) => (

            <div className="col-lg-4 col-md-6 col-sm-12 mb-4" key={index}>

              <div className="category-card">

                <img
                  src={category.image}
                  alt={category.name}
                />

                <div className="category-overlay">

                  <h3>{category.name}</h3>

                  <button className="btn btn-warning">
                    Explore
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}

export default Categories;