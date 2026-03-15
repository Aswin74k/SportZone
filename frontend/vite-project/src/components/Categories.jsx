import { useNavigate } from "react-router-dom";
import "./Categories.css";

function Categories() {
  const navigate = useNavigate();

  const categories = [
    {
      id: "football",
      title: "Football",
      description: "Elite boots, balls and gear for every pitch.",
      image:
        "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "cricket",
      title: "Cricket",
      description: "Bats, pads and accessories for big hitters.",
      image:
        "https://images.unsplash.com/photo-1594623930572-7a19e14c81b7?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "badminton",
      title: "Badminton",
      description: "Feather-light rackets and pro-grade shuttles.",
      image:
        "https://images.unsplash.com/photo-1626489127698-0d1657e3f43a?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "gym",
      title: "Gym & Training",
      description: "Strength, conditioning and recovery essentials.",
      image:
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  const goCategory = (category) => {
    navigate(`/category/${category}`);
  };

  return (
    <section className="categories-section">
      <div className="container">
        <h2 className="categories-title">Shop by Sport</h2>

        <div className="row g-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="col-lg-3 col-md-6 col-sm-6"
              onClick={() => goCategory(cat.id)}
            >
              <div className="category-card">
                <img src={cat.image} alt={cat.title} />

                <div className="category-overlay">
                  <h3>{cat.title}</h3>
                  <p className="mb-3 text-center px-3">{cat.description}</p>
                  <button className="btn btn-warning btn-sm">
                    Explore {cat.title}
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