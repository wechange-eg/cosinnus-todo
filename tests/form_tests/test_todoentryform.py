# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from cosinnus_todo.forms import TodoEntryForm
from tests.form_tests.base import FormTestCase


class TodoEntryFormTest(FormTestCase):

    def test_fields(self):
        """
        Should have certain fields in form
        """
        fields = ['title', 'due_date', 'assigned_to', 'completed_by',
                  'completed_date', 'priority', 'note', 'tags', 'media_tag']
        form = TodoEntryForm(group=self.group)
        self.assertEqual(fields, [k for k in form.fields.keys()])

    def test_init(self):
        """
        Should have querysets for assigned_to and completed_by set appropriately
        """
        form = TodoEntryForm(group=self.group)
        self.assertIn(self.admin, form.fields['assigned_to'].queryset)
        self.assertIn(self.admin, form.fields['completed_by'].queryset)
