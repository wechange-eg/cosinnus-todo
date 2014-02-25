# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.core.urlresolvers import reverse
from django.utils.encoding import force_text

from cosinnus_todo.models import TodoEntry
from tests.view_tests.base import ViewTestCase


class ListTest(ViewTestCase):

    def test_list_not_logged_in(self):
        """
        Should return 200 and contain URL to add a todo entry
        """
        kwargs = {'group': self.group.slug}
        url = reverse('cosinnus:todo:list', kwargs=kwargs)
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)


    def test_list_logged_in_admin(self):
        """
        Should return 200 and contain URL to add a todo entry
        """
        self.client.login(username=self.credential, password=self.credential)
        kwargs = {'group': self.group.slug}
        url = reverse('cosinnus:todo:list', kwargs=kwargs)
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertIn(
            reverse('cosinnus:todo:entry-add', kwargs=kwargs),
            force_text(response.content))

    def test_filtered_invalid_tag(self):
        """
        Should return 404 on invalid tag
        """
        kwargs = {'group': self.group.slug, 'tag': 'foo'}
        url = reverse('cosinnus:todo:list-filtered', kwargs=kwargs)

        # should return 404
        response = self.client.get(url)
        self.assertEqual(response.status_code, 404)

    def test_filtered_valid_tag(self):
        """
        Should return 200 on valid tag and URL to edit todo entry
        """
        tag = 'foo'
        todo = TodoEntry.objects.create(
            group=self.group, title='testtodo', creator=self.admin)
        todo.tags.add(tag)
        kwargs = {'group': self.group.slug, 'tag': tag}
        url = reverse('cosinnus:todo:list-filtered', kwargs=kwargs)
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

        kwargs = {'group': self.group.slug, 'slug': todo.slug}
        self.assertIn(
            reverse('cosinnus:todo:entry-detail', kwargs=kwargs),
            str(response.content))  # type byte in Python3.3
