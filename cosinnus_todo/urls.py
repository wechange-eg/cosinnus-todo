# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.conf.urls import patterns, url

cosinnus_group_patterns = patterns('cosinnus_todo.views',
    url(r'^$', 'index_view', name='index'),
    url(r'^list/$', 'list_view', name='list'),
    url(r'^list/(?P<tag>[^/]+)/$', 'list_view', name='list-filtered'),

    url(r'^add/$',
        'entry_add_view',
        {'form_view': 'add'},
        name='entry-add'),

    url(r'^(?P<slug>[^/]+)/$',
        'entry_detail_view',
        name='entry-detail'),

    url(r'^(?P<slug>[^/]+)/edit/$',
        'entry_edit_view',
        {'form_view': 'edit'},
        name='entry-edit'),

    url(r'^(?P<slug>[^/]+)/delete/$',
        'entry_delete_view',
        name='entry-delete'),

    url(r'^(?P<slug>[^/]+)/assign/$',
        'entry_assign_view',
        {'form_view': 'assign'},
        name='entry-assign'),

    url(r'^(?P<slug>[^/]+)/assign/me/$',
        'entry_assign_no_field_view',
        {'form_view': 'assign-me'},
        name='entry-assign-me'),

    url(r'^(?P<slug>[^/]+)/unassign/$',
        'entry_assign_no_field_view',
        {'form_view': 'unassign'},
        name='entry-unassign'),

    url(r'^(?P<slug>[^/]+)/complete/$',
        'entry_complete_view',
        {'form_view': 'complete'},
        name='entry-complete'),

    url(r'^(?P<slug>[^/]+)/complete/me/$',
        'entry_complete_no_field_view',
        {'form_view': 'complete-me'},
        name='entry-complete-me'),

    url(r'^(?P<slug>[^/]+)/incomplete/$',
        'entry_complete_no_field_view',
        {'form_view': 'incomplete'},
        name='entry-incomplete'),
)


cosinnus_root_patterns = patterns(None)
urlpatterns = cosinnus_group_patterns + cosinnus_root_patterns
