# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.conf.urls import patterns, url

from cosinnus_todo.views import TodoListView, TodoEntryDeleteView, \
    TodoEntryEditView, TodoEntryDetailView, TodoEntryAddView, TodoListDetailView


cosinnus_group_patterns = patterns('cosinnus_todo.views',

    #url(r'^api/users/$', UserList.as_view(), name='user-list'),
    #url(r'^api/users/(?P<username>[0-9a-zA-Z_-]+)$', UserDetail.as_view(), name='user-detail'),

    url(r'^api/todolist/list/(?P<pk>[0-9a-zA-Z_-]+)/$', TodoListDetailView.as_view(is_ajax_request_url=True), name='json-todolist-get'),


    url(r'^api/todos/list/$', TodoListView.as_view(is_ajax_request_url=True), name='json-list'),
    url(r'^api/todos/add/$', TodoEntryAddView.as_view(is_ajax_request_url=True), name='json-add'),
    url(r'^api/todos/list/(?P<pk>[0-9a-zA-Z_-]+)/$', TodoEntryDetailView.as_view(is_ajax_request_url=True), name='json-get'),
    url(r'^api/todos/delete/(?P<pk>[0-9a-zA-Z_-]+)/$', TodoEntryDeleteView.as_view(is_ajax_request_url=True), name='json-delete'),
    url(r'^api/todos/update/(?P<pk>[0-9a-zA-Z_-]+)/$', TodoEntryEditView.as_view(is_ajax_request_url=True), name='json-update'),


    url(r'^$', 'index_view', name='index'),
    url(r'^list/$', 'list_view', name='list'),
    url(r'^list/(?P<tag>[^/]+)/$', 'list_view', name='list-filtered'),

    url(r'^add/$', 'entry_add_view', name='entry-add'),
    url(r'^export/$', 'export_view', name='export'),
    url(r'^list/(?P<slug>[^/]+)/delete/$', 'todolist_delete', name='todolist-delete'),
    url(r'^(?P<slug>[^/]+)/$', 'entry_detail_view', name='entry-detail'),
    url(r'^(?P<slug>[^/]+)/edit/$', 'entry_edit_view', name='entry-edit'),
    url(r'^(?P<slug>[^/]+)/delete/$', 'entry_delete_view', name='entry-delete'),
    url(r'^(?P<slug>[^/]+)/assign/$', 'entry_assign_view', name='entry-assign'),
    url(r'^(?P<slug>[^/]+)/assign/me/$', 'entry_assign_me_view', name='entry-assign-me'),
    url(r'^(?P<slug>[^/]+)/unassign/$', 'entry_unassign_view', name='entry-unassign'),
    url(r'^(?P<slug>[^/]+)/complete/$', 'entry_complete_view', name='entry-complete'),
    url(r'^(?P<slug>[^/]+)/complete/me/$', 'entry_complete_me_view', name='entry-complete-me'),
    url(r'^(?P<slug>[^/]+)/incomplete/$', 'entry_incomplete_view', name='entry-incomplete'),
)


cosinnus_root_patterns = patterns(None)
urlpatterns = cosinnus_group_patterns + cosinnus_root_patterns
