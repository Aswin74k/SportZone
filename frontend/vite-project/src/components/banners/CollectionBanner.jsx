import { useNavigate } from "react-router-dom";
import { mediaUrl } from "../../utils/mediaUrl";
import "./Banners.css";

export default function CollectionBanner({ banner }) {
  const navigate = useNavigate();

  if (!banner) return null;

  const handleClick = () => {
    if (banner.product || banner.product_id) {
      const prodId = banner.product?.id || banner.product_id;
      navigate(`/product/${prodId}`);
    } else if (banner.button_link) {
      if (banner.button_link.startsWith("http")) {
        window.open(banner.button_link, "_blank", "noopener,noreferrer");
      } else {
        navigate(banner.button_link);
      }
    } else {
      const slug = banner.category?.slug || banner.category_id || "";
      navigate(`/shop?category=${slug}`);
    }
  };

  const categoryName = banner.category?.name || "Sports";

  const customBgStyle = {
    backgroundColor: banner.background_color || "rgba(30, 27, 75, 0.75)",
  };

  const bgImg = banner.background_image || banner.desktop_image;
  const productImg = banner.collection_image || banner.product_image;

  return (
    <div className="sz-decathlon-card h-100" style={customBgStyle} onClick={handleClick}>
      {/* Full-bleed background photo */}
      {bgImg && (
        <div 
          className="sz-decathlon-card-backdrop"
          style={{ backgroundImage: `url(${mediaUrl(bgImg)})` }}
        />
      )}
      
      {/* High-contrast gradient overlay */}
      <div className="sz-decathlon-card-overlay"></div>

      <div className="sz-decathlon-card-content text-start">
        {/* Top badge */}
        <span className="sz-decathlon-badge mb-2 align-self-start">
          {categoryName.toUpperCase()}
        </span>

        {/* Contained foreground image (if uploaded) */}
        {productImg && (
          <div className="sz-decathlon-product-img-wrap my-2 flex-grow-1">
            <img 
              src={mediaUrl(productImg)} 
              alt={banner.title || `${categoryName} Gear`} 
              className="sz-decathlon-product-img"
              loading="lazy"
            />
          </div>
        )}

        {/* Bottom Details */}
        <div className="mt-auto d-flex flex-column gap-1">
          <h3 className="sz-decathlon-title">
            {banner.title || `${categoryName} Collection`}
          </h3>

          {banner.subtitle && (
            <h4 className="sz-decathlon-subtitle">
              {banner.subtitle}
            </h4>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="sz-decathlon-btn mt-2"
          >
            {banner.button_text || "Explore"}
          </button>
        </div>
      </div>
    </div>
  );
}
