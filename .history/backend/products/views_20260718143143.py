from django.db.models import Q, Case, When, Value, IntegerField
from rest_framework import filters, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import Banner, Brand, Category, Offer, Product, ProductImage, ProductReview
from .serializers import (
    AdminProductWriteSerializer,
    BannerSerializer,
    BrandSerializer,
    CategorySerializer,
    OfferSerializer,
    ProductImageSerializer,
    ProductReviewModerationSerializer,
    ProductReviewSerializer,
    ProductSerializer,
)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class AdminPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related("category").prefetch_related(
        "gallery_images",
        "sizes",
    )
    authentication_classes = [JWTAuthentication]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description", "category__name", "category__slug"]
    ordering_fields = ["id", "name", "price", "stock"]
    ordering = ["-id"]
    pagination_class = StandardResultsSetPagination

    def paginate_queryset(self, queryset):
        if "page" not in self.request.query_params:
            return None
        return super().paginate_queryset(queryset)

    def get_permissions(self):
        if self.request.method in ("GET", "HEAD", "OPTIONS"):
            return [AllowAny()]
        return [IsAdminUser()]

    def get_serializer_class(self):
        if self.request.method in ("POST", "PUT", "PATCH"):
            return AdminProductWriteSerializer
        return ProductSerializer

    def get_serializer_context(self):
        return {"request": self.request}

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user or not (user.is_authenticated and user.is_staff):
            qs = qs.filter(category__is_active=True)
            qs = qs.filter(Q(brand__isnull=True) | Q(brand__is_active=True))

        category = self.request.query_params.get("category")
        search = self.request.query_params.get("search")
        brand = self.request.query_params.get("brand")
        is_trending = self.request.query_params.get("is_trending")
        is_new_arrival = self.request.query_params.get("is_new_arrival")
        is_deal_of_the_week = self.request.query_params.get("is_deal_of_the_week")
        is_best_seller = self.request.query_params.get("is_best_seller")
        min_price = self.request.query_params.get("min_price")
        max_price = self.request.query_params.get("max_price")
        exclude_banner_featured = self.request.query_params.get("exclude_banner_featured")

        if brand:
            qs = qs.filter(brand_id=brand)
        if min_price:
            qs = qs.filter(price__gte=min_price)
        if max_price:
            qs = qs.filter(price__lte=max_price)
        if exclude_banner_featured:
            try:
                banner = Banner.objects.get(id=exclude_banner_featured)
                qs = qs.exclude(id__in=banner.featured_products.values_list("id", flat=True))
            except Banner.DoesNotExist:
                pass
        if is_trending:
            qs = qs.filter(is_trending=is_trending.lower() in ("true", "1", "yes"))
        if is_new_arrival:
            qs = qs.filter(is_new_arrival=is_new_arrival.lower() in ("true", "1", "yes"))
        if is_deal_of_the_week:
            qs = qs.filter(is_deal_of_the_week=is_deal_of_the_week.lower() in ("true", "1", "yes"))
        if is_best_seller:
            qs = qs.filter(is_best_seller=is_best_seller.lower() in ("true", "1", "yes"))
        if category:
            raw = str(category).strip()
            normalized = raw.lower().replace("-", " ").replace("_", " ")
            normalized = " ".join(normalized.split())
            alias = {
                "cycling": "sports-cycle",
                "sports cycle": "sports-cycle",
                "sports cycles": "sports-cycle",
                "running": "sports-shoe",
                "sports shoe": "sports-shoe",
                "sports shoes": "sports-shoe",
                "tennis": "tennis",
                "basketball": "basketball",
                "volleyball": "volleyball",
                "volley ball": "volleyball",
            }
            slug_to_query = alias.get(normalized, normalized.replace(" ", "-"))
            qs = qs.filter(Q(category__slug__iexact=slug_to_query) | Q(category__name__iexact=normalized))
        if search:
            q = search.strip()
            qs = qs.filter(
                Q(name__icontains=q)
                | Q(description__icontains=q)
                | Q(category__slug__icontains=q)
                | Q(category__name__icontains=q)
            )
            qs = qs.annotate(
                relevance=Case(
                    When(name__iexact=q, then=Value(1)),
                    When(
                        Q(name__istartswith=q + ' ') | Q(name__iendswith=' ' + q) | Q(name__icontains=' ' + q + ' '),
                        then=Value(2)
                    ),
                    When(name__istartswith=q, then=Value(3)),
                    When(name__icontains=q, then=Value(4)),
                    default=Value(5),
                    output_field=IntegerField()
                )
            ).order_by("relevance", "-id")
        return qs

    def filter_queryset(self, queryset):
        qs = super().filter_queryset(queryset)
        search = self.request.query_params.get("search")
        if search:
            qs = qs.order_by("relevance", "-id")
        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        read = ProductSerializer(serializer.instance, context=self.get_serializer_context())
        headers = self.get_success_headers(read.data)
        return Response(read.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        read = ProductSerializer(serializer.instance, context=self.get_serializer_context())
        return Response(read.data)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[IsAdminUser],
        parser_classes=[MultiPartParser, FormParser],
    )
    def add_image(self, request, pk=None):
        product = self.get_object()
        upload = request.FILES.get("image")
        if not upload:
            return Response({"error": "image file is required"}, status=status.HTTP_400_BAD_REQUEST)
        img = ProductImage.objects.create(product=product, image=upload)
        return Response(
            ProductImageSerializer(img, context=self.get_serializer_context()).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["delete"], permission_classes=[IsAdminUser], url_path="remove-image")
    def remove_image(self, request, pk=None):
        product = self.get_object()
        image_id = request.query_params.get("image_id")
        if not image_id:
            return Response({"error": "image_id query parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
        deleted, _ = ProductImage.objects.filter(product=product, id=image_id).delete()
        if not deleted:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by("name")
    serializer_class = CategorySerializer
    authentication_classes = [JWTAuthentication]
    pagination_class = None
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "slug"]
    ordering_fields = ["id", "name", "slug", "created_at"]

    def get_permissions(self):
        if self.request.method in ("GET", "HEAD", "OPTIONS"):
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user and self.request.user.is_authenticated and self.request.user.is_staff:
            return qs
        return qs.filter(is_active=True)


class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    authentication_classes = [JWTAuthentication]
    pagination_class = None
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name"]
    ordering_fields = ["id", "name", "created_at"]
    ordering = ["name"]

    def get_permissions(self):
        if self.request.method in ("GET", "HEAD", "OPTIONS"):
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user and self.request.user.is_authenticated and self.request.user.is_staff:
            return qs
        return qs.filter(is_active=True)


class BannerViewSet(viewsets.ModelViewSet):
    queryset = Banner.objects.all()
    serializer_class = BannerSerializer
    authentication_classes = [JWTAuthentication]
    pagination_class = None
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "subtitle"]
    ordering_fields = ["id", "priority", "display_order", "created_at"]
    ordering = ["priority", "display_order", "-id"]

    def get_permissions(self):
        if self.request.method in ("GET", "HEAD", "OPTIONS"):
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        from django.utils import timezone
        qs = super().get_queryset()
        is_admin = self.request.user and self.request.user.is_authenticated and self.request.user.is_staff
        if not is_admin:
            now = timezone.now()
            qs = qs.filter(
                is_active=True
            ).filter(
                (Q(start_date__isnull=True) | Q(start_date__lte=now)) &
                (Q(end_date__isnull=True) | Q(end_date__gte=now))
            )
        return qs.order_by('priority', 'display_order', '-id')


class OfferViewSet(viewsets.ModelViewSet):
    queryset = Offer.objects.all()
    serializer_class = OfferSerializer
    authentication_classes = [JWTAuthentication]
    pagination_class = None
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description", "promo_code"]
    ordering_fields = ["id", "discount_percent", "created_at"]
    ordering = ["-id"]

    def get_permissions(self):
        if self.request.method in ("GET", "HEAD", "OPTIONS"):
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user and self.request.user.is_authenticated and self.request.user.is_staff:
            return qs
        return qs.filter(is_active=True)


class ProductReviewViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    queryset = ProductReview.objects.select_related("user", "product").order_by("-created_at")
    serializer_class = ProductReviewSerializer
    authentication_classes = [JWTAuthentication]
    pagination_class = None
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["comment"]
    ordering_fields = ["id", "created_at", "rating"]

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_queryset(self):
        qs = super().get_queryset()
        product_id = self.request.query_params.get("product")
        if product_id:
            qs = qs.filter(product_id=product_id)
        if self.request.user and self.request.user.is_authenticated and self.request.user.is_staff:
            return qs
        return qs.filter(is_approved=True)


class AdminProductReviewViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    queryset = ProductReview.objects.select_related("user", "product").order_by("-created_at")
    serializer_class = ProductReviewModerationSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminUser]
    pagination_class = AdminPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["comment", "user__email", "user__username", "product__name"]
    ordering_fields = ["id", "created_at", "rating", "is_approved"]

    def get_queryset(self):
        qs = super().get_queryset()
        approved = self.request.query_params.get("is_approved")
        if approved is not None:
            v = str(approved).lower()
            if v in ("1", "true", "yes"):
                qs = qs.filter(is_approved=True)
            elif v in ("0", "false", "no"):
                qs = qs.filter(is_approved=False)
        product_id = self.request.query_params.get("product")
        if product_id:
            qs = qs.filter(product_id=product_id)
        return qs
