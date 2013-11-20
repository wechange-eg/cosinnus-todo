# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.core.urlresolvers import reverse
from django.utils.timezone import now
from django.views.generic.base import RedirectView
from django.views.generic.detail import DetailView
from django.views.generic.edit import CreateView, DeleteView, UpdateView
from django.views.generic.list import ListView

from extra_views.contrib.mixins import SortableListMixin

from cosinnus.views.mixins.group import (RequireGroupMixin, FilterGroupMixin,
    GroupFormKwargsMixin)
from cosinnus.views.mixins.tagged import TaggedListMixin


from cosinnus_todo.forms import (TodoEntryForm, TodoEntryCreateForm,
    TodoEntryAssignForm, TodoEntryCompleteForm, TodoEntryNoFieldForm)
from cosinnus_todo.models import TodoEntry


class TodoEntryFormMixin(object):

    def dispatch(self, request, *args, **kwargs):
        self.form_view = kwargs.get('form_view', None)
        return super(TodoEntryFormMixin, self).dispatch(request, *args,
                                                        **kwargs)

    def get_context_data(self, **kwargs):
        context = super(TodoEntryFormMixin, self).get_context_data(**kwargs)
        context.update({'form_view': self.form_view})
        return context

    def get_form_kwargs(self):
        kwargs = super(TodoEntryFormMixin, self).get_form_kwargs()
        kwargs.update({'group': self.group})
        return kwargs

    def get_success_url(self):
        return reverse('cosinnus:todo:entry-list',
                       kwargs={'group': self.group.pk})

    def form_valid(self, form):
        self.object = form.save(commit=False)
        if self.object.pk is None:
            self.object.created_by = self.request.user
            self.object.group = self.group

        if self.object.completed_by:
            if not self.object.completed_date:
                self.object.completed_date = now()
        else:
            self.object.completed_date = None

        ret = super(TodoEntryFormMixin, self).form_valid(form)
        form.save_m2m()
        return ret


class TodoEntryIndexView(RequireGroupMixin, RedirectView):

    def get_redirect_url(self, **kwargs):
        return reverse('cosinnus:todo:entry-list',
                       kwargs={'group': self.group.pk})


class TodoEntryCreateView(RequireGroupMixin, FilterGroupMixin,
                          TodoEntryFormMixin, CreateView):

    form_class = TodoEntryCreateForm
    model = TodoEntry

    def get_context_data(self, **kwargs):
        context = super(TodoEntryCreateView, self).get_context_data(**kwargs)
        tags = TodoEntry.objects.tags()
        context.update({
            'tags': tags
        })
        return context

class TodoEntryDeleteView(RequireGroupMixin, FilterGroupMixin, DeleteView):

    model = TodoEntry
    pk_url_kwarg = 'todo'

    def dispatch(self, request, *args, **kwargs):
        self.form_view = kwargs.get('form_view', None)
        return super(TodoEntryDeleteView, self).dispatch(request, *args,
                                                        **kwargs)

    def get_context_data(self, **kwargs):
        context = super(TodoEntryDeleteView, self).get_context_data(**kwargs)
        context.update({'form_view': self.form_view})
        return context

    def get_success_url(self):
        return reverse('cosinnus:todo:entry-list',
                       kwargs={'group': self.group.pk})


class TodoEntryDetailView(RequireGroupMixin, FilterGroupMixin, DetailView):

    model = TodoEntry
    pk_url_kwarg = 'todo'


class TodoEntryListView(RequireGroupMixin, FilterGroupMixin, TaggedListMixin,
                        SortableListMixin, ListView):

    model = TodoEntry

    def get(self, request, *args, **kwargs):
        self.sort_fields_aliases = self.model.SORT_FIELDS_ALIASES
        return super(TodoEntryListView, self).get(request, *args, **kwargs)


class TodoEntryUpdateView(RequireGroupMixin, FilterGroupMixin,
                          TodoEntryFormMixin, UpdateView):

    form_class = TodoEntryForm
    model = TodoEntry
    pk_url_kwarg = 'todo'

    def get_context_data(self, **kwargs):
        context = super(TodoEntryUpdateView, self).get_context_data(**kwargs)
        tags = TodoEntry.objects.tags()
        context.update({
            'tags': tags
        })
        return context


class TodoEntryAssignView(TodoEntryUpdateView):

    form_class = TodoEntryAssignForm


class TodoEntryCompleteView(TodoEntryUpdateView):

    form_class = TodoEntryCompleteForm


class TodoEntryNoFieldView(TodoEntryUpdateView):

    form_class = TodoEntryNoFieldForm

    def form_valid(self, form):
        self.object = form.save(commit=False)
        if self.form_view == 'assign-me':
            self.object.assigned_to = self.request.user
        elif self.form_view == 'unassign':
            self.object.assigned_to = None
        elif self.form_view == 'complete-me':
            self.object.completed_by = self.request.user
            self.object.completed_date = now()
        elif self.form_view == 'uncomplete':
            self.object.completed_by = None
            self.object.completed_date = None
        return super(TodoEntryNoFieldView, self).form_valid(form)
