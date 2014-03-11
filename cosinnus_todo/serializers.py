# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib.auth.models import User

from rest_framework import serializers

from cosinnus.models.group import CosinnusGroup

from cosinnus_todo.models import TodoEntry, TodoList
from cosinnus.models.serializers import GroupSimpleSerializer, UserListSerializer


class TodoListSerializer(serializers.ModelSerializer):
    item_count = serializers.IntegerField(source='item_count', read_only=True)

    class Meta:
        model = TodoList
        fields = ('id', 'title', 'group', 'slug', 'item_count')


class TodoEntrySerializer(serializers.ModelSerializer):
    tags = serializers.RelatedField(many=True)
    assigned_to = UserListSerializer(many=False, required=False, blank=True)
    completed_by = UserListSerializer(many=False, required=False, blank=True)
    group = GroupSimpleSerializer(many=False)
    creator = UserListSerializer(many=False)
    todolist = TodoListSerializer(many=False, required=False, blank=True)

    class Meta:
        model = TodoEntry
        fields = ('id', 'slug', 'title', 'note', 'assigned_to', 'due_date', 'tags', 'priority',
                  'is_completed', 'completed_date', 'completed_by',
                    'created', 'creator', 'group', 'todolist')
        # 'tags' throws exception

    #def __init__(self, *args, **kwargs):
        # Don't pass the 'request' arg up to the superclass
        #request = kwargs.pop('request', None)

        #for obj in context['object_list']:
        #    obj.can_assign = obj.can_user_assign(request.user)

    #def get_validation_exclusions(self):
    #    exclusions = super(TodoEntrySerializer, self).get_validation_exclusions()
    #    return exclusions + ['created_by']

