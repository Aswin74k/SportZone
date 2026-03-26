from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from django.db.models import Q

from .models import Product
from .serializers import ProductSerializer


class ProductViewSet(viewsets.ModelViewSet):

    queryset = Product.objects.all().order_by('-id')  # 🔥 latest first
    serializer_class = ProductSerializer

    permission_classes = [AllowAny]      # ✅ PUBLIC API
    authentication_classes = []          # 🔥 disable auth for products

    # 🔥 IMPORTANT FOR IMAGE URL
    def get_serializer_context(self):
        return {"request": self.request}

    def get_queryset(self):
        queryset = Product.objects.all()

        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')

        if category:
            raw = str(category).strip()
            normalized = raw.lower().replace("-", " ").replace("_", " ")
            normalized = " ".join(normalized.split())

            # tolerate common label/plural variants from old frontend URLs
            alias = {
                "sports shoes": "sports shoe",
                "sports cycles": "sports cycle",
            }
            normalized = alias.get(normalized, normalized)

            queryset = queryset.filter(category__iexact=normalized)

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(category__icontains=search)
            )

        return queryset