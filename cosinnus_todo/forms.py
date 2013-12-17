# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from bootstrap3_datetime.widgets import DateTimePicker
from django.forms.models import ModelForm

from cosinnus_todo.conf import settings
from cosinnus_todo.models import TodoEntry


class TodoEntryForm(ModelForm):

    class Meta:
        model = TodoEntry
        fields = ('title', 'due_date', 'assigned_to', 'completed_by',
                  'completed_date', 'priority', 'note', 'tags', 'media_tag')
        widgets = {
            'due_date': DateTimePicker(options={
                'format': settings.COSINNUS_TODO_DATETIME_PICK_FORMAT}),
            'completed_date': DateTimePicker(options={
                'format': settings.COSINNUS_TODO_DATETIME_PICK_FORMAT}),
        }

    def __init__(self, *args, **kwargs):
        group = kwargs.pop('group', None)
        super(TodoEntryForm, self).__init__(*args, **kwargs)

        if 'assigned_to' in self.fields:
            self.fields['assigned_to'].queryset = group.users.all()

        if 'completed_by' in self.fields:
            self.fields['completed_by'].queryset = group.users.all()


class TodoEntryAddForm(TodoEntryForm):

    class Meta:
        model = TodoEntry
        fields = ('title', 'due_date', 'assigned_to', 'priority',
                  'note', 'tags', 'media_tag')
        widgets = {
            'due_date': DateTimePicker(options={
                'format': settings.COSINNUS_TODO_DATETIME_PICK_FORMAT}),
            'completed_date': DateTimePicker(options={
                'format': settings.COSINNUS_TODO_DATETIME_PICK_FORMAT}),
        }

    def __init__(self, *args, **kwargs):
        group = kwargs.pop('group', None)
        # really use super of TodoEntryForm, not TodoEntryAddForm
        super(TodoEntryForm, self).__init__(*args, **kwargs)

        if 'assigned_to' in self.fields:
            self.fields['assigned_to'].queryset = group.users.all()


class TodoEntryAssignForm(TodoEntryForm):

    class Meta:
        model = TodoEntry
        fields = ('assigned_to',)


class TodoEntryCompleteForm(TodoEntryForm):

    class Meta:
        model = TodoEntry
        fields = ('completed_by', 'completed_date',)
        widgets = {
            'completed_date': DateTimePicker(options={
                'format': settings.COSINNUS_TODO_DATETIME_PICK_FORMAT}),
        }



class TodoEntryNoFieldForm(TodoEntryForm):

    class Meta:
        model = TodoEntry
        fields = ()
