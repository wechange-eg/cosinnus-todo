# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib.auth.models import User

from rest_framework import serializers

from cosinnus.models.group import CosinnusGroup

from cosinnus_todo.models import TodoEntry, TodoList


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'groups')


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = CosinnusGroup
        fields = ('id', 'name', 'slug')


class UserEmbedSerializer(serializers.ModelSerializer):
    class Meta:
        model = User


class TodoEntrySerializer(serializers.ModelSerializer):
    tags = serializers.RelatedField(many=True)
    #assigned_to = serializers.PrimaryKeyRelatedField(many=False, required=False, blank=True)
    #completed_by = serializers.PrimaryKeyRelatedField(many=False, required=False, blank=True)
    #can_assign = serializers.CharField(source='can_assign', read_only=True)
    #created = serializers.DateTimeField(source='created', default=now, blank=True)
    #group = serializers.PrimaryKeyRelatedField(many=False)
    #todolist = serializers.PrimaryKeyRelatedField(many=False, required=False, blank=True)

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

class TodoListSerializer(serializers.ModelSerializer):

    class Meta:
        model = TodoList
        fields = ('id', 'title', 'group')
