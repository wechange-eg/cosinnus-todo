# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin

from cosinnus_todo.models import TodoEntry, TodoList
from cosinnus.admin import BaseTaggableAdminMixin


class TodoEntryAdmin(BaseTaggableAdminMixin, admin.ModelAdmin):
    list_display = BaseTaggableAdminMixin.list_display + ['priority', 'completed_date', 'assigned_to', 'todolist']
    list_filter = BaseTaggableAdminMixin.list_filter + ['priority', ]
    search_fields = BaseTaggableAdminMixin.search_fields + ['note',]


admin.site.register(TodoEntry, TodoEntryAdmin)

admin.site.register(TodoList)
