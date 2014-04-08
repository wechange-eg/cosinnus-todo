# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django import forms
from django.forms import ValidationError
from django.utils.translation import ugettext_lazy as _

from cosinnus.forms.group import GroupKwargModelFormMixin
from cosinnus.forms.tagged import TagObjectFormMixin
from cosinnus.forms.widgets import DateL10nPicker, DateTimeL10nPicker

from cosinnus_todo.models import TodoEntry, TodoList


class TodoEntryForm(GroupKwargModelFormMixin, forms.ModelForm):

    class Meta:
        model = TodoEntry
        fields = ('title', 'due_date', 'assigned_to', 'completed_by',
                  'completed_date', 'priority', 'note', 'tags')
        widgets = {
            'due_date': DateTimeL10nPicker(),
            'completed_date': DateTimeL10nPicker(),
        }

    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super(TodoEntryForm, self).__init__(*args, **kwargs)

        field = self.fields.get('todolist', None)
        if field:
            field.queryset = TodoList.objects.filter(group_id=self.group.id).all()

        field = self.fields.get('assigned_to', None)
        if field:
            field.queryset = self.group.users.all()
            instance = getattr(self, 'instance', None)
            if instance and instance.pk:
                can_assign = instance.can_user_assign(self.user)
                if not can_assign:
                    field.widget.attrs['disabled'] = 'disabled'

        field = self.fields.get('completed_by', None)
        if field:
            field.queryset = self.group.users.all()

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


class TodoEntryAddForm(TagObjectFormMixin, TodoEntryForm):

    new_list = forms.CharField(label='New list name', required=False)

    class Meta:
        model = TodoEntry
        fields = ('title', 'due_date', 'new_list', 'todolist', 'assigned_to',
                  'priority', 'note', 'tags')
        widgets = {
            'due_date': DateTimeL10nPicker(),
            'completed_date': DateTimeL10nPicker(),
        }


class TodoEntryUpdateForm(TodoEntryAddForm):

    class Meta:
        model = TodoEntry
        fields = ('title', 'due_date', 'new_list', 'todolist', 'assigned_to',
                  'completed_by', 'completed_date', 'priority', 'note', 'tags')
        widgets = {
            'due_date': DateL10nPicker(),
            'completed_date': DateTimeL10nPicker(),
        }


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


class TodoListForm(GroupKwargModelFormMixin, forms.ModelForm):

    class Meta:
        model = TodoList
        fields = ('title', 'slug', )
