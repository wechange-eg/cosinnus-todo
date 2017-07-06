# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import django.dispatch as dispatch
from django.utils.translation import ugettext_lazy as _

""" Cosinnus:Notifications configuration file. 
    See http://git.sinnwerkstatt.com/cosinnus/cosinnus-core/wikis/cosinnus-notifications-guidelines.
"""


""" Signal definitions """
assigned_todo_to_user = dispatch.Signal(providing_args=["user", "obj", "audience"])
user_completed_my_todo = dispatch.Signal(providing_args=["user", "obj", "audience"])
todo_created = dispatch.Signal(providing_args=["user", "obj", "audience"])
todo_comment_posted = dispatch.Signal(providing_args=["user", "obj", "audience"])
tagged_todo_comment_posted = dispatch.Signal(providing_args=["user", "obj", "audience"])
assigned_todo_comment_posted = dispatch.Signal(providing_args=["user", "obj", "audience"])


""" Notification definitions.
    These will be picked up by cosinnus_notfications automatically, as long as the 
    variable 'notifications' is present in the module '<app_name>/cosinnus_notifications.py'.
    
    Both the mail and subject template will be provided with the following context items:
        :receiver django.auth.User who receives the notification mail
        :sender django.auth.User whose action caused the notification to trigger
        :receiver_name Convenience, full name of the receiver
        :sender_name Convenience, full name of the sender
        :object The object that was created/changed/modified and which the notification is about.
        :object_url The url of the object, if defined by get_absolute_url()
        :object_name The title of the object (only available if it is a BaseTaggableObject)
        :group_name The name of the group the object is housed in (only available if it is a BaseTaggableObject)
        :site_name Current django site's name
        :domain_url The complete base domain needed to prefix URLs. (eg: 'http://sinnwerkstatt.com')
        :notification_settings_url The URL to the cosinnus notification settings page.
        :site Current django site
        :protocol Current portocol, 'http' or 'https'
        
    
""" 
notifications = {
    'todo_created': {
        'label': _('A user created a new todo'), 
        'mail_template': 'cosinnus_todo/notifications/todo_created.txt',
        'subject_template': 'cosinnus_todo/notifications/todo_created_subject.txt',
        'signals': [todo_created],
        'default': True,
        
        'is_html': True,
        'snippet_type': 'todo',
        'event_text': _('New todo by %(sender_name)s'),
        'notification_text': _('%(sender_name)s created a new todo'),
        'subject_text': _('A new todo: "%(object_name)s" was created in %(team_name)s.'),
        'data_attributes': {
            'object_name': 'title', 
            'object_url': 'get_absolute_url', 
            'object_text': 'note',
        },
    },  
    'todo_assigned_to_me': {
        'label': _('A todo was assigned to me'), 
        'mail_template': 'cosinnus_todo/notifications/assigned_to_me.txt',
        'subject_template': 'cosinnus_todo/notifications/assigned_to_me_subject.txt',
        'signals': [assigned_todo_to_user],
        'default': True,
        
        'is_html': True,
        'snippet_type': 'todo',
        'event_text': _('%(sender_name)s assigned a todo to you'),
        'subject_text': _('%(sender_name)s assigned a todo to you'),
        'data_attributes': {
            'object_name': 'title', 
            'object_url': 'get_absolute_url', 
            'object_text': 'note',
        },
    },  
    'user_completed_my_todo': {
        'label': _('A todo I created was completed'), 
        'mail_template': 'cosinnus_todo/notifications/user_completed_my_todo.txt',
        'subject_template': 'cosinnus_todo/notifications/user_completed_my_todo_subject.txt',
        'signals': [user_completed_my_todo],
        'default': True,
        
        'is_html': True,
        'snippet_type': 'todo',
        'event_text': _('%(sender_name)s completed your todo'),
        'notification_text': _('%(sender_name)s completed one of your todos'),
        'subject_text': _('%(sender_name)s completed one of your todos'),
        'sub_event_text': _('%(sender_name)s'),
        'data_attributes': {
            'object_name': 'title', 
            'object_url': 'get_absolute_url', 
            'object_text': 'note',
        },
    },  
    'todo_comment_posted': {
        'label': _('A user commented on one of your todos'), 
        'mail_template': 'cosinnus_todo/notifications/todo_comment_posted.html',
        'subject_template': 'cosinnus_todo/notifications/todo_comment_posted_subject.txt',
        'signals': [todo_comment_posted],
        'default': True,
        
        'is_html': True,
        'snippet_type': 'todo',
        'event_text': _('%(sender_name)s commented on your todo'),
        'notification_text': _('%(sender_name)s commented on one of your todos'),
        'subject_text': _('%(sender_name)s commented on one of your todos'),
        'sub_event_text': _('%(sender_name)s'),
        'data_attributes': {
            'object_name': 'todo.title', 
            'object_url': 'get_absolute_url', 
            'image_url': 'todo.creator.cosinnus_profile.get_avatar_thumbnail_url', # note: receiver avatar, not creator's!
            'sub_image_url': 'creator.cosinnus_profile.get_avatar_thumbnail_url', # the comment creators
            'sub_object_text': 'text',
        },
    },    
    'tagged_todo_comment_posted': {
        'label': _('A user commented on a todo you were tagged in'), 
        'mail_template': 'cosinnus_todo/notifications/tagged_todo_comment_posted.html',
        'subject_template': 'cosinnus_todo/notifications/tagged_todo_comment_posted_subject.txt',
        'signals': [tagged_todo_comment_posted],
        'default': True,
        
        'is_html': True,
        'snippet_type': 'todo',
        'event_text': _('%(sender_name)s commented on a todo you were tagged in'),
        'subject_text': _('%(sender_name)s commented on a todo you were tagged in in %(team_name)s'),
        'sub_event_text': _('%(sender_name)s'),
        'data_attributes': {
            'object_name': 'todo.title', 
            'object_url': 'get_absolute_url', 
            'image_url': 'todo.creator.cosinnus_profile.get_avatar_thumbnail_url', # note: receiver avatar, not creator's!
            'sub_image_url': 'creator.cosinnus_profile.get_avatar_thumbnail_url', # the comment creators
            'sub_object_text': 'text',
        },
    },  
    'assigned_todo_comment_posted': {
        'label': _('A user commented on a todo you were assigned to'), 
        'mail_template': 'cosinnus_todo/notifications/assigned_todo_comment_posted.html',
        'subject_template': 'cosinnus_todo/notifications/assigned_todo_comment_posted_subject.txt',
        'signals': [assigned_todo_comment_posted],
        'default': True,
        
        'is_html': True,
        'snippet_type': 'todo',
        'event_text': _('%(sender_name)s commented on one of your assigned todos'),
        'subject_text': _('%(sender_name)s commented on one of your assigned todos in %(team_name)s'),
        'sub_event_text': _('%(sender_name)s'),
        'data_attributes': {
            'object_name': 'todo.title', 
            'object_url': 'get_absolute_url', 
            'image_url': 'todo.creator.cosinnus_profile.get_avatar_thumbnail_url', # note: receiver avatar, not creator's!
            'sub_image_url': 'creator.cosinnus_profile.get_avatar_thumbnail_url', # the comment creators
            'sub_object_text': 'text',
        },
    },  
}
