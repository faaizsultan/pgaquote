from django.urls import path
from . import views

urlpatterns = [
    path('', views.quote_form, name='quote_form'),
    path('get-makes/', views.get_makes, name='get_makes'),
    path('get-models/', views.get_models, name='get_models'),
    path('get-shafts/', views.get_shafts, name='get_shafts'),
    # path('get-conditions/', views.get_conditions, name='get_conditions'),
    # path('get-dexterities/', views.get_dexterities, name='get_dexterities'),
    path('get-price/', views.get_price, name='get_price'),
]
 