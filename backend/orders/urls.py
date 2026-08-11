from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CartViewSet, OrderViewSet, wishlist_list, AdminOrderViewSet

router = DefaultRouter()
router.register(r'cart', CartViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'admin/orders', AdminOrderViewSet, basename='admin-orders')

urlpatterns = [
    path('', include(router.urls)),
    path('wishlist/', wishlist_list),
]