from django.db import models

class Shaft(models.Model):
    name = models.CharField(max_length=50, choices=[('Graphite', 'Graphite'), ('Steel', 'Steel')])

    def __str__(self):
        return self.name

class Condition(models.Model):
    name = models.CharField(max_length=50, choices=[('Good', 'Good'), ('New', 'New'), ('Poor', 'Poor')])

    def __str__(self):
        return self.name

class Dexterity(models.Model):
    name = models.CharField(max_length=10, choices=[('Left', 'Left'), ('Right', 'Right')])

    def __str__(self):
        return self.name

class ProductType(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Make(models.Model):
    product_type = models.ForeignKey(ProductType, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Model(models.Model):
    make = models.ForeignKey(Make, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name



class Price(models.Model):
    product_type = models.ForeignKey(ProductType, on_delete=models.CASCADE)
    make = models.ForeignKey(Make, on_delete=models.CASCADE)
    model = models.ForeignKey(Model, on_delete=models.CASCADE)
    shaft = models.ForeignKey(Shaft, on_delete=models.CASCADE,null=True, blank=True)
    condition = models.ForeignKey(Condition, on_delete=models.CASCADE)
    dexterity = models.ForeignKey(Dexterity, on_delete=models.CASCADE)
    value = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.product_type} - {self.make} - {self.model} - {self.shaft} - {self.condition} - {self.dexterity}: ${self.value}"
