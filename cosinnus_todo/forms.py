# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.forms.models import ModelForm
from django.forms.widgets import RadioSelect

#from bootstrap_toolkit.widgets import BootstrapDateInput
#from cosinnus.utils.forms import BootstrapTagWidget, BootstrapUserWidget

from cosinnus_todo.models import TodoEntry


class TodoEntryForm(ModelForm):

    class Meta:
        model = TodoEntry
        fields = ('title', 'due_date', 'assigned_to', 'completed_by',
                  'completed_date', 'priority', 'note', 'tags', 'media_tag')
        widgets = {
#            'assigned_to': BootstrapUserWidget(),
#            'completed_by': BootstrapUserWidget(),
#            'completed_date': BootstrapDateInput(),
#            'due_date': BootstrapDateInput(),
            'priority': RadioSelect(),
#            'tags': BootstrapTagWidget(),
        }

    def __init__(self, *args, **kwargs):
        group = kwargs.pop('group', None)
        super(TodoEntryForm, self).__init__(*args, **kwargs)

        if 'assigned_to' in self.fields:
            self.fields['assigned_to'].queryset = group.user_set.all()

        if 'completed_by' in self.fields:
            self.fields['completed_by'].queryset = group.user_set.all()


class TodoEntryCreateForm(TodoEntryForm):

    class Meta:
        model = TodoEntry
        fields = ('title', 'due_date', 'assigned_to', 'priority',
                  'note', 'tags', 'media_tag')
        widgets = {
#            'assigned_to': BootstrapUserWidget(),
#            'due_date': BootstrapDateInput(),
            'priority': RadioSelect(),
#            'tags': BootstrapTagWidget(),
        }

    def __init__(self, *args, **kwargs):
        group = kwargs.pop('group', None)
        super(TodoEntryForm, self).__init__(*args, **kwargs)

        if 'assigned_to' in self.fields:
            self.fields['assigned_to'].queryset = group.user_set.all()


class TodoEntryAssignForm(TodoEntryForm):

    class Meta:
        model = TodoEntry
        fields = ('assigned_to',)
#        widgets = {
#            'assigned_to': BootstrapUserWidget(),
#        }


class TodoEntryCompleteForm(TodoEntryForm):

    class Meta:
        model = TodoEntry
        fields = ('completed_by', 'completed_date',)
#        widgets = {
#            'completed_by': BootstrapUserWidget(),
#            'completed_date': BootstrapDateInput(),
#        }


class TodoEntryNoFieldForm(TodoEntryForm):

    class Meta:
        model = TodoEntry
        fields = ()
