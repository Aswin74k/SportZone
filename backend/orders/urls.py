from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CartViewSet, OrderViewSet, wishlist_list, wishlist_add, wishlist_remove

router = DefaultRouter()
router.register(r'cart', CartViewSet)
router.register(r'orders', OrderViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('wishlist/', wishlist_list),
    path('wishlist/add/', wishlist_add),
    path('wishlist/remove/', wishlist_remove),
]