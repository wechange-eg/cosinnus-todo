# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from haystack import indexes

from cosinnus.utils.search import BaseTaggableObjectIndex

from cosinnus_todo.models import TodoEntry


class TodoEntryIndex(BaseTaggableObjectIndex, indexes.Indexable):
    note = indexes.CharField(model_attr='note', null=True)

    def get_model(self):
        return TodoEntry
