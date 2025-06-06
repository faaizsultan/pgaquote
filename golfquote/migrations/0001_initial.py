# Generated by Django 4.2.16 on 2025-04-04 20:11

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Condition',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(choices=[('Good', 'Good'), ('New', 'New'), ('Poor', 'Poor')], max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name='Dexterity',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(choices=[('Left', 'Left'), ('Right', 'Right')], max_length=10)),
            ],
        ),
        migrations.CreateModel(
            name='Make',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='Model',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('make', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='golfquote.make')),
            ],
        ),
        migrations.CreateModel(
            name='ProductType',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='Shaft',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(choices=[('Graphite', 'Graphite'), ('Steel', 'Steel')], max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name='Price',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('value', models.DecimalField(decimal_places=2, max_digits=10)),
                ('condition', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='golfquote.condition')),
                ('dexterity', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='golfquote.dexterity')),
                ('make', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='golfquote.make')),
                ('model', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='golfquote.model')),
                ('product_type', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='golfquote.producttype')),
                ('shaft', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='golfquote.shaft')),
            ],
        ),
        migrations.AddField(
            model_name='make',
            name='product_type',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='golfquote.producttype'),
        ),
    ]
