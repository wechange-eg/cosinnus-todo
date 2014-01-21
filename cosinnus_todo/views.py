# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.http import HttpResponseRedirect
from django.contrib import messages
from django.core.exceptions import PermissionDenied
from django.core.urlresolvers import reverse
from django.utils.timezone import now
from django.utils.translation import ugettext_lazy as _
from django.views.generic.base import RedirectView
from django.views.generic.detail import DetailView
from django.views.generic.edit import (CreateView, DeleteView, UpdateView)
from django.views.generic.list import ListView

from extra_views.contrib.mixins import SortableListMixin

from cosinnus.views.export import JSONExportView
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

    def get_context_data(self, **kwargs):
        context = super(TodoListView, self).get_context_data(**kwargs)
        for obj in context['object_list']:
            obj.can_assign = obj.can_user_assign(self.request.user)
        return context

list_view = TodoListView.as_view()


class TodoEntryFormMixin(GroupFormKwargsMixin):
    form_class = TodoEntryForm
    model = TodoEntry
    template_name = 'cosinnus_todo/todoentry_form.html'

    def get_context_data(self, **kwargs):
        context = super(TodoEntryFormMixin, self).get_context_data(**kwargs)
        context.update({
            'form_view': self.form_view,
            'tags': TodoEntry.objects.tags(),
        })
        return context

    def get_form_kwargs(self):
        kwargs = super(TodoEntryFormMixin, self).get_form_kwargs()
        kwargs.update({
            'group': self.group,
            'user': self.request.user,
        })
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

    form_view = 'add'
    form_class = TodoEntryAddForm

entry_add_view = TodoEntryAddView.as_view()


class TodoEntryDetailView(RequireReadMixin, FilterGroupMixin, DetailView):

    model = TodoEntry

    def get_context_data(self, **kwargs):
        context = super(TodoEntryDetailView, self).get_context_data(**kwargs)
        obj = context['object']
        obj.can_assign = obj.can_user_assign(self.request.user)
        return context

entry_detail_view = TodoEntryDetailView.as_view()


class TodoEntryEditView(
        RequireWriteMixin, FilterGroupMixin, TodoEntryFormMixin, UpdateView):

    form_view = 'edit'

entry_edit_view = TodoEntryEditView.as_view()


class TodoEntryDeleteView(RequireWriteMixin, FilterGroupMixin, DeleteView):

    model = TodoEntry

    def get_success_url(self):
        return reverse('cosinnus:todo:list', kwargs={'group': self.group.slug})

entry_delete_view = TodoEntryDeleteView.as_view()


class TodoEntryAssignView(TodoEntryEditView):

    form_class = TodoEntryAssignForm
    form_view = 'assign'

    def get_object(self, queryset=None):
        obj = super(TodoEntryAssignView, self).get_object(queryset)
        if obj.can_user_assign(self.request.user):
            return obj
        else:
            raise PermissionDenied

    def dispatch(self, request, *args, **kwargs):
        try:
            return super(TodoEntryAssignView, self).dispatch(request, *args, **kwargs)
        except PermissionDenied:
            messages.error(request,
                _('You are not allowed to assign this Todo entry.'))
            kwargs = {'group': self.group.slug}
            url = reverse('cosinnus:todo:list', kwargs=kwargs)
            return HttpResponseRedirect(url)

entry_assign_view = TodoEntryAssignView.as_view()


class TodoEntryAssignMeView(TodoEntryAssignView):

    form_class = TodoEntryNoFieldForm
    form_view = 'assign-me'

    def form_valid(self, form):
        self.object = form.save(commit=False)
        self.object.assigned_to = self.request.user
        return super(TodoEntryAssignMeView, self).form_valid(form)

entry_assign_me_view = TodoEntryAssignMeView.as_view()


class TodoEntryUnassignView(TodoEntryAssignView):

    form_class = TodoEntryNoFieldForm
    form_view = 'unassign'

    def form_valid(self, form):
        self.object = form.save(commit=False)
        self.object.assigned_to = None
        return super(TodoEntryUnassignView, self).form_valid(form)

entry_unassign_view = TodoEntryUnassignView.as_view()


class TodoEntryCompleteView(TodoEntryEditView):

    form_class = TodoEntryCompleteForm
    form_view = 'complete'

entry_complete_view = TodoEntryCompleteView.as_view()


class TodoEntryCompleteMeView(TodoEntryEditView):

    form_class = TodoEntryNoFieldForm
    form_view = 'complete-me'

    def form_valid(self, form):
        self.object = form.save(commit=False)
        self.object.completed_by = self.request.user
        self.object.completed_date = now()
        return super(TodoEntryCompleteMeView, self).form_valid(form)

entry_complete_me_view = TodoEntryCompleteMeView.as_view()


class TodoEntryIncompleteView(TodoEntryEditView):

    form_class = TodoEntryNoFieldForm
    form_view = 'incomplete'

    def form_valid(self, form):
        self.object = form.save(commit=False)
        self.object.completed_by = None
        self.object.completed_date = None
        return super(TodoEntryIncompleteView, self).form_valid(form)

entry_incomplete_view = TodoEntryIncompleteView.as_view()


class TodoExportView(JSONExportView):
    fields = [
        'created_by',
        'created_date',
        'due_date',
        'completed_by',
        'completed_date',
        'is_completed',
        'assigned_to',
        'priority',
        'note',
    ]
    model = TodoEntry
    file_prefix = 'cosinnus_todo'

export_view = TodoExportView.as_view()
