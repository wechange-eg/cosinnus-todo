# -*- coding: utf-8 -*-
"""
Created on 08.07.2014

@author: Sascha Narr
"""
from __future__ import unicode_literals

from cosinnus.utils.renderer import BaseRenderer


class TodoEntryRenderer(BaseRenderer):

    template = 'cosinnus_todo/attached_todos.html'
    template_single = 'cosinnus_todo/single_todo.html'

    @classmethod
    def render(cls, context, myobjs):
        return super(TodoEntryRenderer, cls).render(context, todos=myobjs)
