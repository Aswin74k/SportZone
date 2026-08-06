export const PRODUCT_FILTERS = {
  BEST_SELLER: { is_best_seller: "true", page_size: 6 },
  PREMIUM: { is_premium: "true", page_size: 6 },
  IN_DEMAND: { is_in_demand: "true", page_size: 6 },
  UNDER_999: { max_price: 999, page_size: 6 },
  NEWEST: { ordering: "-id", page_size: 6 },
};

export default PRODUCT_FILTERS;
