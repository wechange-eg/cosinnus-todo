# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.core.urlresolvers import reverse
from django.utils.timezone import now
from django.views.generic.base import RedirectView
from django.views.generic.detail import DetailView
from django.views.generic.edit import (CreateView, DeleteView, UpdateView)
from django.views.generic.list import ListView

from extra_views.contrib.mixins import SortableListMixin

from cosinnus.views.mixins.group import (
    RequireReadMixin, RequireWriteMixin, FilterGroupMixin, GroupFormKwargsMixin)
from cosinnus.views.mixins.tagged import TaggedListMixin


from cosinnus_todo.forms import (TodoEntryForm, TodoEntryAddForm, TodoEntryAssignForm,
    TodoEntryCompleteForm, TodoEntryNoFieldForm)
from cosinnus_todo.models import TodoEntry


class TodoIndexView(RequireReadMixin, RedirectView):

    def get_redirect_url(self, **kwargs):
        return reverse('cosinnus:todo:list', kwargs={'group': self.group.slug})

index_view = TodoIndexView.as_view()


class TodoListView(
        RequireReadMixin, FilterGroupMixin, TaggedListMixin, SortableListMixin,
        ListView):

    model = TodoEntry

    def get(self, request, *args, **kwargs):
        self.sort_fields_aliases = self.model.SORT_FIELDS_ALIASES
        return super(TodoListView, self).get(request, *args, **kwargs)

list_view = TodoListView.as_view()


class TodoEntryFormMixin(GroupFormKwargsMixin):
    form_class = TodoEntryForm
    model = TodoEntry
    template_name = 'cosinnus_todo/todoentry_form.html'

    def dispatch(self, request, *args, **kwargs):
        self.form_view = kwargs.get('form_view', None)
        return super(TodoEntryFormMixin, self).dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super(TodoEntryFormMixin, self).get_context_data(**kwargs)
        context.update({
            'form_view': self.form_view,
            'tags': TodoEntry.objects.tags(),
        })
        return context

    def get_form_kwargs(self):
        kwargs = super(TodoEntryFormMixin, self).get_form_kwargs()
        kwargs.update({'group': self.group})
        return kwargs

    def get_success_url(self):
        return reverse('cosinnus:todo:entry-detail',
            kwargs={'group': self.group.slug, 'slug': self.object.slug})

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


class TodoEntryAddView(
        RequireWriteMixin, FilterGroupMixin, TodoEntryFormMixin, CreateView):

    form_class = TodoEntryAddForm

entry_add_view = TodoEntryAddView.as_view()


class TodoEntryDetailView(RequireReadMixin, FilterGroupMixin, DetailView):

    model = TodoEntry

entry_detail_view = TodoEntryDetailView.as_view()


class TodoEntryEditView(
        RequireWriteMixin, FilterGroupMixin, TodoEntryFormMixin, UpdateView):

    pass

entry_edit_view = TodoEntryEditView.as_view()


class TodoEntryDeleteView(RequireWriteMixin, FilterGroupMixin, DeleteView):

    model = TodoEntry

    def get_success_url(self):
        return reverse('cosinnus:todo:list', kwargs={'group': self.group.slug})

entry_delete_view = TodoEntryDeleteView.as_view()


class TodoEntryAssignView(TodoEntryEditView):

    form_class = TodoEntryAssignForm

entry_assign_view = TodoEntryAssignView.as_view()


class TodoEntryCompleteView(TodoEntryEditView):

    form_class = TodoEntryCompleteForm

entry_complete_view = TodoEntryCompleteView.as_view()


class TodoEntryNoFieldView(TodoEntryEditView):

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
        elif self.form_view == 'incomplete':
            self.object.completed_by = None
            self.object.completed_date = None
        return super(TodoEntryNoFieldView, self).form_valid(form)

entry_no_field_view = TodoEntryNoFieldView.as_view()
