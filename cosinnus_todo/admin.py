# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin

from cosinnus_todo.models import TodoEntry


class TodoEntryAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_date', 'created_by', 'due_date',
                    'assigned_to', 'priority', 'group', 'completed_date',
                    'completed_by')
    search_fields = ('name', 'note')


admin.site.register(TodoEntry, TodoEntryAdmin)
