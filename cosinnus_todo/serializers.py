from django.contrib.auth.models import User, Group
from django.utils.timezone import now
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
    created_by = UserEmbedSerializer(many=False, required=False)
    can_assign = serializers.CharField(source='can_assign', read_only=True)
    created_date = serializers.DateTimeField(source='created_date', default=now, blank=True)

    class Meta:
        model = TodoEntry
        fields = ('id', 'title', 'note', 'assigned_to', 'due_date', 'tags', 'priority',
                  'is_completed', 'completed_date', 'completed_by',
                    'created_date', 'created_by')
        # 'tags' throws exception

    #def __init__(self, *args, **kwargs):
        # Don't pass the 'request' arg up to the superclass
        #request = kwargs.pop('request', None)

        #for obj in context['object_list']:
        #    obj.can_assign = obj.can_user_assign(request.user)

    #def get_validation_exclusions(self):
    #    exclusions = super(TodoEntrySerializer, self).get_validation_exclusions()
    #    return exclusions + ['created_by']
