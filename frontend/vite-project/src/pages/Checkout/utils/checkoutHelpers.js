export const DELIVERY_ESTIMATE_DAYS = 4;

export function getEstimatedDeliveryDate() {
  return new Date(Date.now() + DELIVERY_ESTIMATE_DAYS * 24 * 60 * 60 * 1000);
}

export function formatLine1({ houseName = "", area = "", landmark = "" }) {
  let constructed = houseName.trim();
  if (area.trim()) constructed += `, ${area.trim()}`;
  if (landmark.trim()) constructed += ` (${landmark.trim()})`;
  return constructed;
}

export const RAZORPAY_METHOD_MAP = {
  Card: { upi: false, card: true, netbanking: false, wallet: false, paylater: false },
  NetBanking: { upi: false, card: false, netbanking: true, wallet: false, paylater: false },
};

export const UPI_UNAVAILABLE = true;
