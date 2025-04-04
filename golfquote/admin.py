from django.contrib import admin
from .models import ProductType, Make, Model, Shaft, Condition, Dexterity, Price

@admin.register(ProductType)
class ProductTypeAdmin(admin.ModelAdmin):
    list_display = ('name',)

@admin.register(Make)
class MakeAdmin(admin.ModelAdmin):
    list_display = ('name', 'product_type')

@admin.register(Model)
class ModelAdmin(admin.ModelAdmin):
    list_display = ('name', 'make')

@admin.register(Shaft)
class ShaftAdmin(admin.ModelAdmin):
    list_display = ('name',)

@admin.register(Condition)
class ConditionAdmin(admin.ModelAdmin):
    list_display = ('name',)

@admin.register(Dexterity)
class DexterityAdmin(admin.ModelAdmin):
    list_display = ('name',)

@admin.register(Price)
class PriceAdmin(admin.ModelAdmin):
    list_display = ('product_type', 'make', 'model', 'shaft', 'condition', 'dexterity', 'value')
