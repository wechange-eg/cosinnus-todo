# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.conf.urls import patterns, url

from cosinnus_todo.views import (TodoEntryIndexView, TodoEntryCreateView,
    TodoEntryDeleteView, TodoEntryDetailView, TodoEntryListView,
    TodoEntryUpdateView, TodoEntryAssignView, TodoEntryCompleteView,
    TodoEntryNoFieldView)

cosinnus_group_patterns = patterns('',
    url(r'^list/$',
        TodoEntryListView.as_view(),
        name='entry-list'),

    url(r'^list/(?P<tag>[^/]+)/$',
        TodoEntryListView.as_view(),
        name='entry-list-filtered'),

    url(r'^create/$',
        TodoEntryCreateView.as_view(),
        {'form_view': 'create'},
        name='entry-create'),

    url(r'^entry/(?P<todo>[^/]+)/$',
        TodoEntryDetailView.as_view(),
        name='entry-detail'),

    url(r'^entry/(?P<todo>[^/]+)/assign/$',
        TodoEntryAssignView.as_view(),
        {'form_view': 'assign'},
        name='entry-assign'),

    url(r'^entry/(?P<todo>[^/]+)/assign/me/$',
        TodoEntryNoFieldView.as_view(),
        {'form_view': 'assign-me'},
        name='entry-assign-me'),

    url(r'^entry/(?P<todo>[^/]+)/complete/$',
        TodoEntryCompleteView.as_view(),
        {'form_view': 'complete'},
        name='entry-complete'),

    url(r'^entry/(?P<todo>[^/]+)/complete/me/$',
        TodoEntryNoFieldView.as_view(),
        {'form_view': 'complete-me'},
        name='entry-complete-me'),

    url(r'^entry/(?P<todo>[^/]+)/delete/$',
        TodoEntryDeleteView.as_view(),
        {'form_view': 'delete'},
        name='entry-delete'),

    url(r'^entry/(?P<todo>[^/]+)/update/$',
        TodoEntryUpdateView.as_view(),
        {'form_view': 'update'},
        name='entry-update'),

    url(r'^entry/(?P<todo>[^/]+)/unassign/$',
        TodoEntryNoFieldView.as_view(),
        {'form_view': 'unassign'},
        name='entry-unassign'),

    url(r'^entry/(?P<todo>[^/]+)/uncomplete/$',
        TodoEntryNoFieldView.as_view(),
        {'form_view': 'uncomplete'},
        name='entry-uncomplete'),

    url(r'^$',
        TodoEntryIndexView.as_view(),
        name='entry-index'),
)


cosinnus_root_patterns = patterns(None)
urlpatterns = cosinnus_group_patterns + cosinnus_root_patterns
