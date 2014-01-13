# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.core.urlresolvers import reverse

from cosinnus_todo.models import TodoEntry
from tests.view_tests.base import ViewTestCase


class CompleteNoFieldTest(ViewTestCase):

    def setUp(self, *args, **kwargs):
        super(CompleteNoFieldTest, self).setUp(*args, **kwargs)
        self.todo = TodoEntry.objects.create(
            group=self.group, title='testtodo', created_by=self.admin)
        self.kwargs = {'group': self.group.slug, 'slug': self.todo.slug}

    def _execute(self, urlname):
        url = reverse('cosinnus:todo:' + urlname, kwargs=self.kwargs)
        self.client.login(username=self.credential, password=self.credential)
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

        params = {
            'csrfmiddlewaretoken': response.cookies['csrftoken'].value,
        }
        response = self.client.post(url, params)
        self.assertEqual(response.status_code, 302)
        self.assertIn(
            reverse('cosinnus:todo:entry-detail', kwargs=self.kwargs),
            response.get('location'))
        return TodoEntry.objects.get(pk=self.todo.pk)

    def test_complete_me(self):
        """
        Should complete todo entry by me
        """
        todo = self._execute('entry-complete-me')
        self.assertEqual(todo.completed_by, self.admin)
        self.assertNotEqual(todo.completed_date, None)

    def test_incomplete(self):
        """
        Should mark todo entry incomplete
        """
        todo = self._execute('entry-incomplete')
        self.assertEqual(todo.completed_by, None)
        self.assertEqual(todo.completed_date, None)
