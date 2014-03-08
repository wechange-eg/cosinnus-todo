# -*- coding: utf-8 -*-


def register():
    # Import here to prevent import side effects
    from django.utils.translation import ugettext_lazy as _

    from cosinnus.core.registries import (app_registry, url_registry,
        widget_registry)

    app_registry.register('cosinnus_todo', 'todo', _('Todos'))
    url_registry.register_urlconf('cosinnus_todo', 'cosinnus_todo.urls')
    widget_registry.register('todo', 'cosinnus_todo.dashboard.MyTodos')
