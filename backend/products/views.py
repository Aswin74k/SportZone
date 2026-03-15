from rest_framework.viewsets import ModelViewSet
from .models import Product
from .serializers import ProductSerializer

class ProductViewSet(ModelViewSet):

    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_queryset(self):

        category = self.request.query_params.get("category")

        if category:
            return Product.objects.filter(category=category)

        return Product.objects.all()