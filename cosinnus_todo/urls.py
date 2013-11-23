# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.conf.urls import patterns, url

from cosinnus_todo.views import (TodoIndexView, TodoAddView, TodoListView,
    TodoEntryView, TodoEntryEditView, TodoEntryDeleteView, TodoEntryAssignView,
    TodoEntryCompleteView, TodoEntryNoFieldView)

cosinnus_group_patterns = patterns('',
    url(r'^$',
        TodoIndexView.as_view(),
        name='index'),

    url(r'^add/$',
        TodoAddView.as_view(),
        {'form_view': 'add'},
        name='add'),

    url(r'^list/$',
        TodoListView.as_view(),
        name='list'),

    url(r'^list/(?P<tag>[^/]+)/$',
        TodoListView.as_view(),
        name='list-filtered'),

    url(r'^(?P<todo>[^/]+)/$',
        TodoEntryView.as_view(),
        name='entry'),

    url(r'^(?P<todo>[^/]+)/edit/$',
        TodoEntryEditView.as_view(),
        {'form_view': 'edit'},
        name='entry-edit'),

    url(r'^(?P<todo>[^/]+)/delete/$',
        TodoEntryDeleteView.as_view(),
        {'form_view': 'delete'},
        name='entry-delete'),

    url(r'^(?P<todo>[^/]+)/assign/$',
        TodoEntryAssignView.as_view(),
        {'form_view': 'assign'},
        name='entry-assign'),

    url(r'^(?P<todo>[^/]+)/assign/me/$',
        TodoEntryNoFieldView.as_view(),
        {'form_view': 'assign-me'},
        name='entry-assign-me'),

    url(r'^(?P<todo>[^/]+)/unassign/$',
        TodoEntryNoFieldView.as_view(),
        {'form_view': 'unassign'},
        name='entry-unassign'),

    url(r'^(?P<todo>[^/]+)/complete/$',
        TodoEntryCompleteView.as_view(),
        {'form_view': 'complete'},
        name='entry-complete'),

    url(r'^(?P<todo>[^/]+)/complete/me/$',
        TodoEntryNoFieldView.as_view(),
        {'form_view': 'complete-me'},
        name='entry-complete-me'),

    url(r'^(?P<todo>[^/]+)/incomplete/$',
        TodoEntryNoFieldView.as_view(),
        {'form_view': 'incomplete'},
        name='entry-incomplete'),
)


cosinnus_root_patterns = patterns(None)
urlpatterns = cosinnus_group_patterns + cosinnus_root_patterns
