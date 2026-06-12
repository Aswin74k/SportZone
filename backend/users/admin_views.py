from django.contrib.auth.models import User
from rest_framework import filters, mixins, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from orders.models import Order
from orders.serializers import OrderSerializer

from .serializers import AdminUserSerializer


class AdminPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class AdminUserViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    queryset = User.objects.select_related("profile").order_by("-date_joined")
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]
    authentication_classes = [JWTAuthentication]
    pagination_class = AdminPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["email", "username", "first_name"]
    ordering_fields = ["id", "date_joined", "is_active"]

    @action(detail=True, methods=["get"], url_path="orders")
    def user_orders(self, request, pk=None):
        user = self.get_object()
        orders = Order.objects.filter(user=user).order_by("-created_at")[:200]
        return Response(
            OrderSerializer(orders, many=True, context={"request": request}).data,
        )
