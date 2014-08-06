'''
Created on 05.08.2014

@author: Sascha
'''
from django.utils.translation import ugettext_lazy as _

from cosinnus.views.mixins.filters import CosinnusFilterSet
from cosinnus.forms.filters import AllObjectsFilter, SelectCreatorWidget,\
    SelectUserWidget, DropdownChoiceWidget, ForwardDateRangeFilter
from cosinnus_todo.models import TodoEntry, PRIORITY_CHOICES
from django_filters.filters import AllValuesFilter, ChoiceFilter

FILTER_PRIORITY_CHOICES = list(PRIORITY_CHOICES)

class TodoFilter(CosinnusFilterSet):
    creator = AllObjectsFilter(label=_('Created By'), widget=SelectCreatorWidget)
    assigned_to = AllObjectsFilter(label=_('Assigned To'), widget=SelectUserWidget)
    priority = ChoiceFilter(label=_('Priority'), choices=FILTER_PRIORITY_CHOICES, widget=DropdownChoiceWidget)
    due_date = ForwardDateRangeFilter(label=_('Due date'), widget=DropdownChoiceWidget)
    
    class Meta:
        model = TodoEntry
        fields = ['creator', 'assigned_to', 'priority', 'due_date']
        order_by = (
            ('-priority', _('Priority')),
            ('due_date', _('Soonest Due')),
            ('-created', _('Newest Created')),
        )
    
    def get_order_by(self, order_value):
        if order_value == '-priority':
            order_value = '-priority,due_date'
        return super(TodoFilter, self).get_order_by(order_value)
    
    
    