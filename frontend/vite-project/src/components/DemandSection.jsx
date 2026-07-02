import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { unwrapList } from "../utils/unwrapList";
import { mediaUrl } from "../utils/mediaUrl";
import "./DemandSection.css";

const DEMAND_ITEMS_CONFIG = [
  {
    id: 18,
    searchTerm: "Virat Kohli",
    label: "Top Rated",
    offer: "Virat Kohli Edition",
  },
  {
    id: 21,
    searchTerm: "Rohit Sharma",
    label: "Top Picks",
    offer: "Hitman Edition",
  },
  {
    id: 20,
    searchTerm: "World Cup 2026",
    label: "Top Deals",
    offer: "Special offer",
  },
  {
    id: 7,
    searchTerm: "ADIDAS Running Shoe",
    label: "Most Loved",
    offer: "From ₹7,799",
  },
];

export default function DemandSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchItems = async () => {
      try {
        setLoading(true);

        const fetchedItems = await Promise.all(
          DEMAND_ITEMS_CONFIG.map(async (config) => {
            let product = null;
            try {
              // Try directly by ID
              const res = await API.get(`products/${config.id}/`);
              product = res.data;
            } catch {
              console.warn(`Direct fetch failed for ID ${config.id}, falling back to search...`);
              try {
                const searchRes = await API.get("products/", {
                  params: { search: config.searchTerm }
                });
                const list = unwrapList(searchRes.data);
                if (list.length > 0) {
                  product = list[0];
                }
              } catch (subErr) {
                console.error(`Search failed for ${config.searchTerm}`, subErr);
              }
            }

            return product ? { ...config, product } : null;
          })
        );

        if (!isMounted) return;

        // Filter out any null entries
        setItems(fetchedItems.filter(Boolean));
      } catch (err) {
        console.error("Error fetching demand items:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchItems();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!loading && items.length === 0) {
    return null; // Don't render if no items could be fetched
  }

  return (
    <section className="sz-demand-section py-4">
      <div className="container-fluid container-xl">
        <div className="sz-demand-banner shadow-sm">
          {/* Section Title Row */}
          <div className="sz-demand-banner__title-row">
            <h2 className="sz-demand-banner__title">In demand</h2>
            <span className="sz-demand-banner__badge">⚡ TRENDING</span>
          </div>

          {/* Cards Glassmorphic Grid */}
          <div className="sz-demand-banner__card-grid">
            {loading ? (
              <div className="row g-3">
                {[1, 2, 3, 4].map((idx) => (
                  <div className="col-6 col-md-3" key={idx}>
                    <div className="sz-demand-card-skeleton">
                      <div className="sz-skeleton sz-demand-card-skeleton__img" />
                      <div className="sz-skeleton sz-demand-card-skeleton__line1 mt-3" />
                      <div className="sz-skeleton sz-demand-card-skeleton__line2 mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="row g-3 justify-content-center">
                {items.map((item) => {
                  const imageSrc = mediaUrl(item.product.image) || "/no-image.png";
                  return (
                    <div className="col-6 col-md-3" key={item.product.id}>
                      <div
                        className="sz-demand-card h-100"
                        onClick={() => navigate(`/product/${item.product.id}`)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && navigate(`/product/${item.product.id}`)}
                      >
                        {/* Dark Image Box */}
                        <div className="sz-demand-card__image-box">
                          <img
                            src={imageSrc}
                            alt={item.product.name}
                            className="sz-demand-card__img img-fluid"
                            onError={(e) => {
                              e.target.src = "/no-image.png";
                            }}
                          />
                        </div>
                        {/* Labels and Offer texts */}
                        <div className="sz-demand-card__content text-start">
                          <div className="sz-demand-card__label">{item.label}</div>
                          <div className="sz-demand-card__offer">{item.offer}</div>
                          <div className="sz-demand-card__name" title={item.product.name}>
                            {item.product.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
