# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib.auth.models import User
from django.test import TestCase

from cosinnus.models import (CosinnusGroup, CosinnusGroupMembership,
    MEMBERSHIP_ADMIN)
from cosinnus_todo.models import TodoEntry


class FormTestCase(TestCase):

    def setUp(self, *args, **kwargs):
        super(FormTestCase, self).setUp(*args, **kwargs)
        self.group = CosinnusGroup.objects.create(name='testgroup')
        self.admin = User.objects.create_superuser(
            username='admin', email=None, password=None)
        CosinnusGroupMembership.objects.create(user=self.admin,
            group=self.group, status=MEMBERSHIP_ADMIN)
        self.todo = TodoEntry.objects.create(
            group=self.group, title='testtodo', created_by=self.admin)
