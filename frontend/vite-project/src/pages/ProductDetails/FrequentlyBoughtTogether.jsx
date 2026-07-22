import React from "react";
import { mediaUrl } from "../../utils/mediaUrl";

export default function FrequentlyBoughtTogether({
  product,
  fbtItems,
  fbtCheckedItems,
  fbtPricing,
  handleFbtToggle,
  addBundleToCart,
  bundleLoading,
  sizeSectionRef
}) {
  if (fbtItems.length < 2) return null;

  return (
    <div className="mt-3">
      <div className="sz-fbt-container">
        <h3 className="sz-fbt-title">Frequently Bought Together</h3>
        
        <div className="sz-fbt-grid">
          
          {/* Item 1: Main product */}
          <div className="sz-fbt-product-image-box">
            <img src={mediaUrl(product.image) || "/no-image.png"} alt={product.name} />
          </div>

          <span className="sz-fbt-plus-sign">+</span>

          {/* Item 2: Complementary 1 */}
          <div className="sz-fbt-product-image-box">
            <img src={mediaUrl(fbtItems[0].image) || "/no-image.png"} alt={fbtItems[0].name} />
          </div>

          <span className="sz-fbt-plus-sign">+</span>

          {/* Item 3: Complementary 2 */}
          <div className="sz-fbt-product-image-box">
            <img src={mediaUrl(fbtItems[1].image) || "/no-image.png"} alt={fbtItems[1].name} />
          </div>

          {/* Checked lists of FBT */}
          <div className="sz-fbt-items-list px-lg-3 mt-3 mt-lg-0">
            <div className="sz-fbt-item-checkbox-row">
              <input type="checkbox" className="sz-fbt-checkbox" checked={true} disabled />
              <label className="text-dark font-medium">
                <b>This Item:</b> {product.name} &nbsp; 
                <span className="text-primary font-bold">₹{Number(product.price).toLocaleString("en-IN")}</span>
              </label>
            </div>

            <div className="sz-fbt-item-checkbox-row">
              <input
                type="checkbox"
                className="sz-fbt-checkbox"
                checked={fbtCheckedItems[0]}
                onChange={() => handleFbtToggle(0)}
              />
              <label className="text-muted cursor-pointer" onClick={() => handleFbtToggle(0)}>
                <b>Add:</b> {fbtItems[0].name} &nbsp; 
                <span className="text-dark font-bold">₹{Number(fbtItems[0].price).toLocaleString("en-IN")}</span>
              </label>
            </div>

            <div className="sz-fbt-item-checkbox-row">
              <input
                type="checkbox"
                className="sz-fbt-checkbox"
                checked={fbtCheckedItems[1]}
                onChange={() => handleFbtToggle(1)}
              />
              <label className="text-muted cursor-pointer" onClick={() => handleFbtToggle(1)}>
                <b>Add:</b> {fbtItems[1].name} &nbsp; 
                <span className="text-dark font-bold">₹{Number(fbtItems[1].price).toLocaleString("en-IN")}</span>
              </label>
            </div>
          </div>

          {/* FBT checkout action */}
          <div className="sz-fbt-checkout-card mt-3 mt-lg-0">
            <div className="small text-muted font-semibold">Total Price:</div>
            <div className="sz-fbt-total-price">
              ₹{fbtPricing.current.toLocaleString("en-IN")}
            </div>
            {fbtPricing.discount > 0 && (
              <div className="sz-fbt-savings">
                Bundle Discount: {fbtPricing.discount}% Off (Save ₹{fbtPricing.savings.toLocaleString("en-IN")})
              </div>
            )}
            <button
              type="button"
              className="btn sz-purchase-btn buy-now mt-3 py-2"
              onClick={() => addBundleToCart(sizeSectionRef)}
              disabled={bundleLoading}
            >
              {bundleLoading ? "Adding Bundle..." : "Add All 3 Items to Cart"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
