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

class UserEmbedSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username')

class TodoEntrySerializer(serializers.ModelSerializer):
    tags = serializers.RelatedField(many=True)
    assigned_to = UserEmbedSerializer(many=False)
    completed_by = UserEmbedSerializer(many=False)

    class Meta:
        model = TodoEntry
        fields = ('id', 'title', 'assigned_to', 'due_date', 'tags', 'priority',
                  'is_completed', 'completed_date', 'completed_by')
        # 'tags' throws exception
