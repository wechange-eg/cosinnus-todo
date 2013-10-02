# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.utils.timezone import now

from django import template

register = template.Library()


@register.filter
def is_past(dt):
    return dt and dt < now()
