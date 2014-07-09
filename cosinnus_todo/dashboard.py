# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from collections import defaultdict

from django import forms
from django.template.loader import render_to_string
from django.utils.translation import ugettext_lazy as _

from cosinnus.utils.dashboard import DashboardWidget, DashboardWidgetForm

from cosinnus_todo.models import TodoEntry
import six


class MyTodosForm(DashboardWidgetForm):
    amount = forms.IntegerField(label="Amount", initial=5, min_value=0,
        help_text="0 means unlimited", required=False)
    amount_subtask = forms.IntegerField(label="Amount of Subtasks", initial=2, min_value=0,
        help_text="0 means unlimited", required=False)
    

class MyTodos(DashboardWidget):

    app_name = 'todo'
    form_class = MyTodosForm
    model = TodoEntry
    title = _('My Todos')
    user_model_attr = 'assigned_to'
    widget_name = 'mine'

    def get_data(self, offset=0):
        if self.request.user.is_authenticated():
            count = int(self.config['amount'])
            count_subtask = int(self.config['amount_subtask'])
            qs = self.get_queryset().select_related('group').filter(is_completed=False)
            
            # sort subtaks by their container (main task)
            grouped_tasks = defaultdict(list)
            for task in qs:
                grouped_tasks[task.todolist.title].append(task)
                if count != 0 and len(grouped_tasks) >= count:
                    break
            if count_subtask != 0:
                for subtasks in grouped_tasks.values():
                    if len(subtasks) > count_subtask:
                        more_field = {
                            'more_field': True, 
                            'count': len(subtasks)-count_subtask
                        }
                        subtasks[:] = subtasks[:count_subtask]
                        subtasks.append(more_field)
        else:
            grouped_tasks = []
        data = {
            'grouped_tasks': dict(grouped_tasks),
            'group': self.config.group,
            'no_data': _('No todos'),
            'user': self.request.user,
        }
        return (render_to_string('cosinnus_todo/widgets/my_todos.html', data), 0)

    def get_queryset_filter(self, **kwargs):
        return super(MyTodos, self).get_queryset_filter(assigned_to=self.request.user)
