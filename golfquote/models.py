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
    
class MakeUp(models.Model):
    name = models.CharField(
        max_length=100,
        choices=[
            ('11', '11 Irons All Types'),
            ('10', '10 Irons All Types'),
            ('9', '9 Irons All Types'),
            ('8', '8 Irons All Types'),
            ('7', '7 Irons All Types'),
            ('6', '6 Irons All Types'),
            ('5', '5 Irons All Types'),
        ],
    )
   
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
    makeups = models.ForeignKey(MakeUp, on_delete=models.CASCADE,null=True, blank=True)
    condition = models.ForeignKey(Condition, on_delete=models.CASCADE)
    dexterity = models.ForeignKey(Dexterity, on_delete=models.CASCADE)
    value = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.product_type} - {self.make} - {self.model} - {self.shaft} - {self.makeups} - {self.condition} - {self.dexterity}: ${self.value}"
