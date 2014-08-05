'''
Created on 05.08.2014

@author: Sascha
'''
from django.utils.translation import ugettext_lazy as _

from cosinnus.views.mixins.filters import CosinnusFilterSet
from cosinnus.forms.filters import AllObjectsFilter, SelectCreatorWidget
from cosinnus_todo.models import TodoEntry


class TodoFilter(CosinnusFilterSet):
    creator = AllObjectsFilter(label=_('Created By'), widget=SelectCreatorWidget)
    
    class Meta:
        model = TodoEntry
        fields = ['creator']
        order_by = (
            ('-created', _('Newest Created')),
            ('title', _('Title')),
        )
    
    def get_order_by(self, order_value):
        return super(TodoFilter, self).get_order_by(order_value)
    