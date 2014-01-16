# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django import forms
from django.template.loader import render_to_string
from django.utils.translation import ugettext_lazy as _

from cosinnus.utils.dashboard import DashboardWidget

from cosinnus_todo.models import TodoEntry


class MyTodosForm(forms.Form):
    amount = forms.IntegerField(label="Amount", initial=5, min_value=0,
        help_text="0 means unlimited")


class MyTodos(DashboardWidget):

    app_name = 'todo'
    form_class = MyTodosForm
    model = TodoEntry
    title = _('My Todos')
    user_model_attr = 'assigned_to'
    widget_name = 'mine'

    def get_data(self):
        if self.request.user.is_authenticated():
            count = int(self.config['amount'])
            qs = self.get_queryset().values_list('title', 'assigned_to', 'priority', 'group').all()
            if count != 0:
                qs = qs[:count]
        else:
            qs = []
        data = {
            'titles': (_('Title'), _('Assigned to'), _('Priority'), _('Group')),
            'rows': qs,
            'no_data': _('No todos'),
        }
        return render_to_string('cosinnus/widgets/table.html', data)

    def get_queryset_filter(self, **kwargs):
        return super(MyTodos, self).get_queryset_filter(assigned_to=self.request.user)
