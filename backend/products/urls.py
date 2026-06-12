from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AdminProductReviewViewSet,
    BannerViewSet,
    BrandViewSet,
    CategoryViewSet,
    OfferViewSet,
    ProductReviewViewSet,
    ProductViewSet,
)

router = DefaultRouter()
router.register(r"products", ProductViewSet)
router.register(r"categories", CategoryViewSet)
router.register(r"brands", BrandViewSet)
router.register(r"banners", BannerViewSet)
router.register(r"offers", OfferViewSet)
router.register(r"reviews", ProductReviewViewSet, basename="reviews")
router.register(r"admin/reviews", AdminProductReviewViewSet, basename="admin-reviews")

urlpatterns = [
    path("", include(router.urls)),
]
