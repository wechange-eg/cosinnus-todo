# Generated by Django 2.1.7 on 2019-10-17 19:38

import django.contrib.postgres.fields.jsonb
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cosinnus_todo', '0008_auto_20190527_1800'),
    ]

    operations = [
        migrations.AddField(
            model_name='todoentry',
            name='settings',
            field=django.contrib.postgres.fields.jsonb.JSONField(blank=True, default=dict, null=True),
        ),
    ]
