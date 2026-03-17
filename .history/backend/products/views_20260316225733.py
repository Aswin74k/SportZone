from rest_framework.generics import ListAPIView
from .models import Product
from .serializers import ProductSerializer

class ProductList(ListAPIView):

    serializer_class = ProductSerializer

    def get_queryset(self):

        queryset = Product.objects.all()
        category = self.request.query_params.get('category')

        if category:
            queryset = queryset.filter(category=category)

        return queryset