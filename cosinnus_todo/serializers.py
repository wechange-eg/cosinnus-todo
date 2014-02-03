from django.contrib.auth.models import User, Group
from rest_framework import serializers

from models import TodoEntry


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'groups')


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ('id', 'name')

class TodoEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = TodoEntry
        fields = ('id', 'title', 'created_date', 'assigned_to')