# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from cosinnus_todo.forms import TodoEntryAddForm
from tests.form_tests.base import FormTestCase


class TodoEntryAddFormTest(FormTestCase):

    def test_fields(self):
        """
        Should have certain fields in form
        """
        fields = [
            # "normal" fields
            'title', 'due_date', 'new_list', 'todolist', 'assigned_to',
            'priority', 'note', 'tags',
            # media_tag fields
            'location_place', 'people_name', 'public'
        ]
        form = TodoEntryAddForm(group=self.group)
        self.assertEqual(fields, [k for k in form.fields.keys()])

    def test_init(self):
        """
        Should have querysets for assigned_to and completed_by set appropriately
        """
        form = TodoEntryAddForm(group=self.group)
        self.assertIn(self.admin, form.fields['assigned_to'].queryset)
