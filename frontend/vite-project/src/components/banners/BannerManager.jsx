import FlashBanner from "./FlashBanner";
import LimitedOfferBanner from "./LimitedOfferBanner";
import CollectionBanner from "./CollectionBanner";

export default function BannerManager({ banner }) {
  if (!banner) return null;

  const type = banner.banner_type || banner.type;

  switch (type) {
    case "flash_sale":
    case "flash":
      return <FlashBanner banner={banner} />;
    case "limited_offer":
    case "limited":
      return <LimitedOfferBanner banner={banner} />;
    case "collection":
      return <CollectionBanner banner={banner} />;
    default:
      return null;
  }
}
