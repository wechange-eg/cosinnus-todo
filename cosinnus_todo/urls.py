# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.conf.urls import patterns, url

from cosinnus.utils.url_patterns import api_patterns


cosinnus_group_patterns = patterns('cosinnus_todo.views',
    url(r'^$', 'index_view', name='index'),
    url(r'^list/$', 'todo_list_create_view', name='list'),
    url(r'^list/move_element/$', 'move_element_view', name='move-element'),
    url(r'^list/(?P<listslug>[^/]+)/$', 'todo_list_create_view', name='list-list'),
    url(r'^list/(?P<listslug>[^/]+)/show/(?P<todoslug>[^/]+)/$', 'todo_list_create_view', name='todo-in-list-list'),
    url(r'^delete/list/(?P<slug>[^/]+)/$', 'todolist_delete_view', name='todolist-delete'),
    
    url(r'^list/(?P<listslug>[^/]+)/add/$', 'entry_add_view', name='entry-add'),
    url(r'^export/$', 'export_view', name='export'),
    url(r'^todolist/list/$', 'todolist_list_view', name='todolist-list'),
    url(r'^todolist/add/$', 'todolist_add_view', name='todolist-add'),
    url(r'^(?P<slug>[^/]+)/$', 'entry_detail_view', name='entry-detail'),
    url(r'^(?P<slug>[^/]+)/edit/$', 'entry_edit_view', name='entry-edit'),
    url(r'^(?P<slug>[^/]+)/delete/$', 'entry_delete_view', name='entry-delete'),
    url(r'^(?P<slug>[^/]+)/assign/$', 'entry_assign_view', name='entry-assign'),
    url(r'^(?P<slug>[^/]+)/assign/me/$', 'entry_assign_me_view', name='entry-assign-me'),
    url(r'^(?P<slug>[^/]+)/unassign/$', 'entry_unassign_view', name='entry-unassign'),
    url(r'^(?P<slug>[^/]+)/complete/$', 'entry_complete_view', name='entry-complete'),
    url(r'^(?P<slug>[^/]+)/complete/me/$', 'entry_complete_me_view', name='entry-complete-me'),
    url(r'^(?P<slug>[^/]+)/incomplete/$', 'entry_incomplete_view', name='entry-incomplete'),
    
    
    url(r'^(?P<todo_slug>[^/]+)/comment/$', 'comment_create', name='comment'),
    url(r'^comment/(?P<pk>\d+)/$', 'comment_detail', name='comment-detail'),
    url(r'^comment/(?P<pk>\d+)/delete/$', 'comment_delete', name='comment-delete'),
    url(r'^comment/(?P<pk>\d+)/update/$', 'comment_update', name='comment-update'),
)

# namespace for these is 'cosinnus-api'
cosinnus_api_patterns = api_patterns(1, 'todo', True, 'cosinnus_todo.views',
    #url(r'^todolist/list/$', 'todolist_list_view_api', name='todolist-list'),
    #url(r'^todolist/list/(?P<pk>[0-9a-zA-Z_-]+)/$', 'todolist_detail_view_api', name='todolist-get'),
    #url(r'^todolist/add/$', 'todolist_add_view_api', name='todolist-add'),
    #url(r'^todolist/delete/(?P<pk>[0-9a-zA-Z_-]+)/$', 'todolist_delete_view_api', name='todolist-delete'),
    #url(r'^todolist/update/(?P<pk>[0-9a-zA-Z_-]+)/$', 'todolist_edit_view_api', name='todolist-update'),

    # TODO SASCHA: change 'todos' to 'todo'
    url(r'^todos/list/$', 'entry_list_view_api', name='todo-list-api'),
    url(r'^todos/list/(?P<pk>[0-9a-zA-Z_-]+)/$', 'entry_detail_view_api', name='todo-get'),
    url(r'^todos/add/$', 'entry_add_view_api', name='todo-add'),
    url(r'^todos/delete/(?P<pk>[0-9a-zA-Z_-]+)/$', 'entry_delete_view_api', name='todo-delete'),
    url(r'^todos/update/(?P<pk>[0-9a-zA-Z_-]+)/$', 'entry_edit_view_api', name='todo-update'),
    url(r'^todos/(?P<pk>[0-9a-zA-Z_-]+)/assign/$', 'entry_assign_view_api', name='entry-assign'),
    url(r'^todos/(?P<pk>[0-9a-zA-Z_-]+)/assign/me/$', 'entry_assign_me_view_api', name='entry-assign-me'),
    url(r'^todos/(?P<pk>[0-9a-zA-Z_-]+)/unassign/$', 'entry_unassign_view_api', name='entry-unassign'),
    url(r'^todos/(?P<pk>[0-9a-zA-Z_-]+)/complete/$', 'entry_complete_view_api', name='entry-complete'),
    url(r'^todos/(?P<pk>[0-9a-zA-Z_-]+)/complete/me/$', 'entry_complete_me_view_api', name='entry-complete-me'),
    url(r'^todos/(?P<pk>[0-9a-zA-Z_-]+)/toggle_complete/me/$', 'entry_toggle_complete_me_view_api', name='entry-toggle-complete-me'),
    url(r'^todos/(?P<pk>[0-9a-zA-Z_-]+)/incomplete/$', 'entry_incomplete_view_api', name='entry-incomplete'),

)

cosinnus_root_patterns = patterns(None)
urlpatterns = cosinnus_group_patterns + cosinnus_root_patterns
