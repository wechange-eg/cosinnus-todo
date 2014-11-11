# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import django.dispatch as dispatch
from django.utils.translation import ugettext_lazy as _


""" Signal definitions """
assigned_todo_to_user = dispatch.Signal(providing_args=["user", "obj", "audience"])


""" Notification definitions.
    These will be picked up by cosinnus_notfications automatically, as long as the 
    variable 'notifications' is present in the module '<app_name>/cosinnus_notifications.py'.
    
    Both the mail and subject template will be provided with the following context items:
        :receiver django.auth.User who receives the notification mail
        :source_user django.auth.User whose action caused the notification to trigger
        :object The object that was created/changed/modified and which the notification is about.
        :site_name Current django site's name
        :domain_url The complete base domain needed to prefix URLs. (eg: 'http://sinnwerkstatt.com')
        :site Current django site
        :protocol Current portocol, 'http' or 'https'
        
    
""" 
notifications = {
    'todo_assigned_to_me': {
        'label': _('Todos that were assigned to me'), 
        'mail_template': 'cosinnus_todo/notifications/assigned_to_me.txt',
        'subject_template': 'cosinnus_todo/notifications/assigned_to_me_subject.txt',
        'signals': [assigned_todo_to_user],
    },                  
}
