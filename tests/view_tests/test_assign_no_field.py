# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.core.urlresolvers import reverse

from cosinnus_todo.models import TodoEntry
from tests.view_tests.base import ViewTestCase


class AssignNoFieldTest(ViewTestCase):

    def setUp(self, *args, **kwargs):
        super(AssignNoFieldTest, self).setUp(*args, **kwargs)
        self.todo = TodoEntry.objects.create(
            group=self.group, title='testtodo', created_by=self.admin)
        self.kwargs = {'group': self.group.slug, 'slug': self.todo.slug}

    def _execute_valid(self, urlname):
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

    def test_assign_me(self):
        """
        Should assign todo entry to me
        """
        todo = self._execute_valid('entry-assign-me')
        self.assertEqual(todo.assigned_to, self.admin)

    def test_unassign(self):
        """
        Should unassign a todo entry
        """
        todo = self._execute_valid('entry-unassign')
        self.assertEqual(todo.assigned_to, None)

    def _execute_invalid(self, urlname):
        credential = 'test'
        self.add_user(credential)
        self.client.login(username=credential, password=credential)
        url = reverse('cosinnus:todo:entry-' + urlname, kwargs=self.kwargs)
        response = self.client.get(url, follow=True)
        self.assertEqual(response.status_code, 200)

        kwargs = {'group': self.group.slug}
        list_url = reverse('cosinnus:todo:list', kwargs=kwargs)
        self.assertRedirects(response, list_url)

    def test_assign_me_other_user(self):
        """
        Should redirect to list page if other user tries to assign todo entry
        """
        self._execute_invalid('assign-me')

    def test_unassign_other_user(self):
        """
        Should redirect to list page if other user tries to unassign todo entry
        """
        self._execute_invalid('unassign')
