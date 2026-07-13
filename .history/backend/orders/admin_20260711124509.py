from django.contrib import admin
from .models import Cart, Order, OrderItem


# 🔥 Show order items inside order
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


# 🔥 Customize Order admin
class OrderAdmin(admin.ModelAdmin):
    inlines = [OrderItemInline]


admin.site.register(Cart)
admin.site.register(Order, OrderAdmin)  # IMPORTANT CHANGE
admin.site.register(OrderItem)