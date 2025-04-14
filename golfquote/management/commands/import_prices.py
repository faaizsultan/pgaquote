import csv
from django.core.management.base import BaseCommand
from django.db import transaction
from decimal import Decimal
from golfquote.models import (
    ProductType, Make, Model, 
    Shaft, Condition, Dexterity, Price,MakeUp
)

class Command(BaseCommand):
    help = 'Import prices from CSV file with optional ShaftType and MakeUp columns'

    def initialize_choice_models(self):
        """Create initial instances for all choice-based models"""
        with transaction.atomic():
            # Initialize Condition
            Condition.objects.get_or_create(id=1, name='Good')
            Condition.objects.get_or_create(id=2, name='New')
            Condition.objects.get_or_create(id=3, name='Poor')

            # Initialize Dexterity
            Dexterity.objects.get_or_create(id=1, name='Left')
            Dexterity.objects.get_or_create(id=2, name='Right')

            # Initialize Shaft
            Shaft.objects.get_or_create(id=1, name='Graphite')
            Shaft.objects.get_or_create(id=2, name='Steel')

            # Initialize MakeUp
            makeup_choices = [
                ('11', '11 Irons All Types'),
                ('10', '10 Irons All Types'),
                ('9', '9 Irons All Types'),
                ('8', '8 Irons All Types'),
                ('7', '7 Irons All Types'),
                ('6', '6 Irons All Types'),
                ('5', '5 Irons All Types'),
            ]
            for value, name in makeup_choices:
                MakeUp.objects.get_or_create(name=value)

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Path to the CSV file')

    def handle(self, *args, **options):

        # First ensure all choice-based models have their instances
        self.initialize_choice_models()

        csv_file_path = options['csv_file']
        
        # Mapping dictionaries
        condition_map = {'Good': 1, 'New': 2, 'Poor': 3}
        dexterity_map = {'Left': 1, 'Right': 2}
        shaft_map = {'Graphite': 1, 'Steel': 2}

        with open(csv_file_path, 'r') as csvfile:
            reader = csv.DictReader(csvfile)
            success_count = 0
            error_count = 0
            
            for row in reader:
                try:
                    with transaction.atomic():
                        # Get or create ProductType
                        product_type, _ = ProductType.objects.get_or_create(
                            name=row['ClubType']
                        )

                        # Get or create Make
                        make, _ = Make.objects.get_or_create(
                            product_type=product_type,
                            name=row['Make']
                        )

                        # Get or create Model
                        model, _ = Model.objects.get_or_create(
                            make=make,
                            name=row['Model']
                        )

                        # Get Condition
                        condition_id = condition_map.get(row['Condition'])
                        condition = Condition.objects.get(id=condition_id)

                        # Get Dexterity if exists
                        dexterity = None
                        if row['Dexterity']:
                            dexterity_id = dexterity_map.get(row['Dexterity'])
                            dexterity = Dexterity.objects.get(id=dexterity_id)

                        # Get Shaft if exists
                        shaft = None
                        if row['ShaftType']:
                            shaft_id = shaft_map.get(row['ShaftType'])
                            shaft = Shaft.objects.get(id=shaft_id)
                        
                                                # Get MakeUp if exists and is not empty
                        makeup = None
                        if row.get('MakeUp', '').strip():
                            try:
                                makeup = MakeUp.objects.get(name=row['MakeUp'].strip())
                                print("Makeup Got From Db",makeup)
                            except MakeUp.DoesNotExist:
                                raise ValueError(f"Invalid makeup value: {row['MakeUp']}")

                        # Create Price entry
                        price = Price.objects.create(
                            product_type=product_type,
                            make=make,
                            model=model,
                            shaft=shaft,
                            condition=condition,
                            dexterity=dexterity, 
                            makeups=makeup,
                            value=Decimal(row['Price'].strip())
                        )
                        
                            

                        success_count += 1
                        print(success_count)

                except KeyError as e:
                    self.stdout.write(self.style.ERROR(
                        f"Missing expected column in row {row}: {str(e)}"
                    ))
                    error_count += 1
                except Exception as e:
                    self.stdout.write(self.style.ERROR(
                        f"Error processing row {row}: {str(e)}"
                    ))
                    error_count += 1

        self.stdout.write(self.style.SUCCESS(
            f'Import completed: {success_count} successful, {error_count} failed'
        ))