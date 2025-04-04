from django.shortcuts import render
from django.http import JsonResponse
from .models import ProductType, Make, Model, Shaft, Condition, Dexterity, Price

def quote_form(request):
    product_types = ProductType.objects.all()
    return render(request, 'quote_form.html', {'product_types': product_types})

def get_makes(request):
    product_type_id = request.GET.get('product_type')
    if not product_type_id:
        return JsonResponse({'error': 'Missing product_type_id'}, status=400)
    makes = Make.objects.filter(product_type_id=product_type_id).values('id', 'name')
    return JsonResponse(list(makes), safe=False)

def get_models(request):
    make_id = request.GET.get('make')   
    if not make_id:
        return JsonResponse({'error': 'Missing make_id'}, status=400)
    models = Model.objects.filter(make_id=make_id).values('id', 'name')
    return JsonResponse(list(models), safe=False)

def get_shafts(request):
    model_id = request.GET.get('model')
    if not model_id:
        return JsonResponse({'error': 'Missing model_id'}, status=400)
    
    # Check if this model has any shafts associated in the Price table
    has_shafts = Price.objects.filter(model_id=model_id, shaft__isnull=False).exists()
    return JsonResponse(has_shafts, safe=False)

# def get_shafts(request):
#     model_id = request.GET.get('model')
#     if not model_id: 
#         return JsonResponse({'error': 'Missing model_id'}, status=400)
#     shafts = Shaft.objects.filter(model_id=model_id).values('id', 'name')
#     if not shafts:
#         return JsonResponse(False, safe=False)
#     return JsonResponse(list(shafts), safe=False)

# def get_conditions(request):
#     shaft_id = request.GET.get("shaft")
#     if shaft_id:
#         conditions = Condition.objects.filter(shaft_id=shaft_id)
#     else:
#         conditions = Condition.objects.filter(shaft__isnull=True).values('id', 'name')
#     return JsonResponse(list(conditions), safe=False)

# def get_dexterities(request):
#     condition_id = request.GET.get('condition')
#     if not condition_id:
#         return JsonResponse({'error': 'Missing condition_id'}, status=400)
#     dexterities = Dexterity.objects.filter(condition_id=condition_id).values('id', 'name')
#     return JsonResponse(list(dexterities), safe=False)

def get_price(request):
    required_params = ['product_type', 'make', 'model','condition', 'dexterity']
    if any(param not in request.GET for param in required_params):
        return JsonResponse({'error': 'Missing parameters'}, status=400)

    price = Price.objects.filter(
        product_type_id=request.GET['product_type'],
        make_id=request.GET['make'],
        model_id=request.GET['model'],
        shaft_id=request.GET['shaft'],
        condition_id=request.GET['condition'],
        dexterity_id=request.GET['dexterity']
    ).first()

    if price:
        return JsonResponse({'price': price.value})
    return JsonResponse({'error': 'Price not found'}, status=404)
