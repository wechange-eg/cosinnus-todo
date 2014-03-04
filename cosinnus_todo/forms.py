# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django import forms
from django.forms import ValidationError
from django.utils.translation import ugettext_lazy as _

from cosinnus.forms.widgets import DateTimeL10nPicker
from cosinnus.models import MEMBER_STATUS

from cosinnus_todo.models import TodoEntry, TodoList


class TodoEntryForm(forms.ModelForm):

    new_list = forms.CharField(label='New list name', required=False)

    class Meta:
        model = TodoEntry
        fields = ('title', 'due_date', 'new_list', 'todolist', 'assigned_to',
                  'completed_by', 'completed_date', 'priority', 'note', 'tags',
                  'media_tag')
        widgets = {
            'due_date': DateTimeL10nPicker(),
            'completed_date': DateTimeL10nPicker(),
        }

    def __init__(self, *args, **kwargs):
        group = kwargs.pop('group', None)
        self.user = kwargs.pop('user', None)
        super(TodoEntryForm, self).__init__(*args, **kwargs)

        field = self.fields.get('todolist', None)
        if field:
            field.queryset = TodoList.objects.filter(group_id=group.id).all()

        field = self.fields.get('assigned_to', None)
        if field:
            field.queryset = group.users.all()
            instance = getattr(self, 'instance', None)
            if instance and instance.pk:
                can_assign = instance.can_user_assign(self.user)
                if not can_assign:
                    field.widget.attrs['disabled'] = 'disabled'

        field = self.fields.get('completed_by', None)
        if field:
            field.queryset = group.users.all()

    def clean_assigned_to(self):
        assigned_to = self.cleaned_data['assigned_to']
        instance = getattr(self, 'instance', None)
        if not instance or not instance.pk:
            return assigned_to

        if instance.can_user_assign(self.user):
            return assigned_to

        if assigned_to != instance.assigned_to:  # trying to cheat!
            raise ValidationError(
                _('You are not allowed to assign this Todo entry.'),
                code='can_not_assign'
            )
        return assigned_to

    def clean(self):
        new_list = self.cleaned_data.get('new_list', None)
        todolist = self.cleaned_data.get('todolist', None)
        if new_list and todolist:
            del self.cleaned_data['todolist']  # A new list name has been defined
        return self.cleaned_data


class TodoEntryAddForm(TodoEntryForm):

    class Meta:
        model = TodoEntry
        fields = ('title', 'due_date', 'assigned_to', 'priority',
                  'note', 'tags', 'media_tag')
        widgets = {
            'due_date': DateTimeL10nPicker(),
            'completed_date': DateTimeL10nPicker(),
        }

    def __init__(self, *args, **kwargs):
        group = kwargs.pop('group', None)
        self.user = kwargs.pop('user', None)
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
            'completed_date': DateTimeL10nPicker(),
        }


class TodoEntryNoFieldForm(TodoEntryForm):

    class Meta:
        model = TodoEntry
        fields = ()
