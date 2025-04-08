import csv
from django.core.management.base import BaseCommand
from django.db import transaction
from golfquote.models import (
    ProductType, Make, Model, 
    Shaft, Condition, Dexterity, Price
)

class Command(BaseCommand):
    help = 'Import prices from CSV file'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Path to the CSV file')

    def handle(self, *args, **options):
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

                        # Create Price entry
                        Price.objects.create(
                            product_type=product_type,
                            make=make,
                            model=model,
                            shaft=shaft,
                            condition=condition,
                            dexterity=dexterity,
                            value=row['Price']
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