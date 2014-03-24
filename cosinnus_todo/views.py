# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.http import HttpResponseRedirect, HttpResponseBadRequest
from django.contrib import messages
from django.core.exceptions import PermissionDenied
from django.core.urlresolvers import reverse
from django.shortcuts import get_object_or_404
from django.utils.timezone import now
from django.utils.translation import ugettext_lazy as _
from django.views.generic.base import RedirectView
from django.views.generic.detail import DetailView
from django.views.generic.edit import (CreateView, DeleteView, UpdateView)
from django.views.generic.list import ListView

from extra_views.contrib.mixins import SortableListMixin

from cosinnus.views.export import CSVExportView
from cosinnus.views.mixins.group import (
    RequireReadMixin, RequireWriteMixin, FilterGroupMixin, GroupFormKwargsMixin)
from cosinnus.views.mixins.tagged import TaggedListMixin

from cosinnus_todo.forms import (TodoEntryAddForm, TodoEntryAssignForm,
    TodoEntryCompleteForm, TodoEntryNoFieldForm, TodoEntryUpdateForm,
    TodoListAddForm, TodoListUpdateForm)
from cosinnus_todo.models import TodoEntry, TodoList


from cosinnus_todo.serializers import TodoEntrySerializer, TodoListSerializer
from cosinnus.views.mixins.ajax import ListAjaxableResponseMixin, AjaxableFormMixin, \
    DetailAjaxableResponseMixin

class TodoIndexView(RequireReadMixin, RedirectView):

    def get_redirect_url(self, **kwargs):
        return reverse('cosinnus:todo:list', kwargs={'group': self.group.slug})

index_view = TodoIndexView.as_view()


class TodoEntryListView(ListAjaxableResponseMixin, RequireReadMixin,
        FilterGroupMixin, TaggedListMixin, SortableListMixin, ListView):

    model = TodoEntry
    serializer_class = TodoEntrySerializer
    sort_fields_aliases = TodoEntry.SORT_FIELDS_ALIASES

    def dispatch(self, request, *args, **kwargs):
        list_filter = None
        if self.is_ajax_request_url and request.is_ajax():
            list_pk = request.GET.get('list', None)
            if list_pk:
                list_filter = {'pk': list_pk}
        else:
            list_slug = kwargs.get('listslug', None)
            if list_slug:
                list_filter = {'slug': list_slug}

        if list_filter is not None:
            self.todolist = get_object_or_404(TodoList, **list_filter)
        else:
            self.todolist = None
        return super(TodoEntryListView, self).dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super(TodoEntryListView, self).get_context_data(**kwargs)
        context.update({
            'todolists': TodoList.objects.filter(group_id=self.group.id).all(),
            'active_todolist': self.todolist,
        })
        return context

    def get_queryset(self):
        # TODO Django>=1.7: change to chained select_related calls
        qs = super(TodoEntryListView, self).get_queryset(
            select_related=('assigned_to', 'completed_by', 'todolist'))
        if self.todolist:
            qs = qs.filter(todolist_id=self.todolist.pk)
        return qs

entry_list_view = TodoEntryListView.as_view()


class TodoEntryDetailView(DetailAjaxableResponseMixin, RequireReadMixin,
        FilterGroupMixin, DetailView):

    model = TodoEntry
    serializer_class = TodoEntrySerializer

    def get_context_data(self, **kwargs):
        context = super(TodoEntryDetailView, self).get_context_data(**kwargs)
        obj = context['object']
        obj.can_assign = obj.can_user_assign(self.request.user)
        return context

entry_detail_view = TodoEntryDetailView.as_view()


class TodoEntryFormMixin(RequireWriteMixin, FilterGroupMixin,
        GroupFormKwargsMixin):

    model = TodoEntry

    def get_context_data(self, **kwargs):
        context = super(TodoEntryFormMixin, self).get_context_data(**kwargs)
        context.update({
            'form_view': self.form_view,
            'tags': TodoEntry.objects.filter(group=self.group).tag_names()
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
        new_list = form.cleaned_data.get('new_list', None)
        todolist = None
        if new_list:
            todolist = TodoList.objects.create(title=new_list, group=self.group)
        else:
            todolist = form.cleaned_data.get('todolist', todolist)  # selection or None

        self.object = form.save(commit=False)
        self.object.todolist = todolist
        if self.object.pk is None:
            self.object.creator = self.request.user
            self.object.group = self.group

        if self.object.completed_by:
            if not self.object.completed_date:
                self.object.completed_date = now()
        else:
            self.object.completed_date = None

        self.object.save()
        form.save_m2m()

        messages.success(self.request, self.message_success % {
                    'title': self.object.title})
        return HttpResponseRedirect(self.get_success_url())

    def form_invalid(self, form):
        ret = super(TodoEntryFormMixin, self).form_invalid(form)
        messages.error(self.request, self.message_error % {
                    'title': self.object.title})
        return ret


class TodoEntryAddView(AjaxableFormMixin, TodoEntryFormMixin, CreateView):
    form_class = TodoEntryAddForm
    form_view = 'add'
    message_success = _('Todo "%(title)s" was added successfully.')
    message_error = _('Todo "%(title)s" could not be added.')

entry_add_view = TodoEntryAddView.as_view()


class TodoEntryEditView(AjaxableFormMixin, TodoEntryFormMixin, UpdateView):
    form_class = TodoEntryUpdateForm
    form_view = 'edit'
    message_success = _('Todo "%(title)s" was edited successfully.')
    message_error = _('Todo "%(title)s" could not be edited.')

entry_edit_view = TodoEntryEditView.as_view()


class TodoEntryDeleteView(AjaxableFormMixin, TodoEntryFormMixin, DeleteView):
    form_class = TodoEntryNoFieldForm
    form_view = 'delete'
    message_success = _('Todo "%(title)s" was deleted successfully.')
    message_error = _('Todo "%(title)s" could not be deleted.')

    def get_success_url(self):
        return reverse('cosinnus:todo:list', kwargs={'group': self.group.slug})

entry_delete_view = TodoEntryDeleteView.as_view()


class TodoEntryAssignView(TodoEntryEditView):
    form_class = TodoEntryAssignForm
    form_view = 'assign'
    message_success = _('Todo "%(title)s" was assigned successfully.')
    message_error = _('Todo "%(title)s" could not be assigned.')

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
    message_success = _('Todo "%(title)s" was assigned to You successfully.')
    message_error = _('Todo "%(title)s" could not be assigned to You.')

    def form_valid(self, form):
        self.object = form.save(commit=False)
        self.object.assigned_to = self.request.user
        self.object.save()
        return HttpResponseRedirect(self.get_success_url())

entry_assign_me_view = TodoEntryAssignMeView.as_view()


class TodoEntryUnassignView(TodoEntryAssignView):
    form_class = TodoEntryNoFieldForm
    form_view = 'unassign'
    message_success = _('Todo "%(title)s" was unassigned successfully.')
    message_error = _('Todo "%(title)s" could not be unassigned.')

    def form_valid(self, form):
        self.object = form.save(commit=False)
        self.object.assigned_to = None
        self.object.save()
        return HttpResponseRedirect(self.get_success_url())

entry_unassign_view = TodoEntryUnassignView.as_view()


class TodoEntryCompleteView(TodoEntryEditView):
    form_class = TodoEntryCompleteForm
    form_view = 'complete'
    message_success = _('Todo "%(title)s" with list "%(todolist)"  was completed successfully.')
    message_error = _('Todo "%(title)s" with list "%(todolist)" could not be completed.')

entry_complete_view = TodoEntryCompleteView.as_view()


class TodoEntryCompleteMeView(TodoEntryEditView):
    form_class = TodoEntryNoFieldForm
    form_view = 'complete-me'
    message_success = _('Todo "%(title)s" with list "%(todolist)" was completed by You successfully.')
    message_error = _('Todo "%(title)s" with list "%(todolist)" could not be completed by You.')

    def form_valid(self, form):
        self.object = form.save(commit=False)
        self.object.completed_by = self.request.user
        self.object.completed_date = now()
        self.object.save()
        return HttpResponseRedirect(self.get_success_url())

entry_complete_me_view = TodoEntryCompleteMeView.as_view()


class TodoEntryIncompleteView(TodoEntryEditView):
    form_class = TodoEntryNoFieldForm
    form_view = 'incomplete'
    message_success = _('Todo "%(title)s" was set to incomplete successfully.')
    message_error = _('Todo "%(title)s" could not be set to incomplete.')

    def form_valid(self, form):
        self.object = form.save(commit=False)
        self.object.completed_by = None
        self.object.completed_date = None
        self.object.save()
        return HttpResponseRedirect(self.get_success_url())

entry_incomplete_view = TodoEntryIncompleteView.as_view()


class TodoExportView(CSVExportView):
    fields = ('creator', 'created', 'due_date', 'completed_by',
        'completed_date', 'is_completed', 'assigned_to', 'priority', 'note',)
    file_prefix = 'cosinnus_todo'
    model = TodoEntry

export_view = TodoExportView.as_view()


class TodoListListView(ListAjaxableResponseMixin, RequireReadMixin,
        FilterGroupMixin, SortableListMixin, ListView):

    model = TodoList
    serializer_class = TodoListSerializer

todolist_list_view = TodoListListView.as_view()


class TodoListDetailView(DetailAjaxableResponseMixin, RequireReadMixin,
        FilterGroupMixin, DetailView):

    model = TodoList
    serializer_class = TodoListSerializer

    def dispatch(self, request, *args, **kwargs):
        if not self.is_ajax_request_url or not request.is_ajax():
            return HttpResponseBadRequest()
        else:
            return super(TodoListDetailView, self).dispatch(request, *args, **kwargs)

    def get_queryset(self):
        # TODO Django>=1.7: change to chained select_relatad calls
        return super(TodoListDetailView, self).get_queryset(
            select_related=('todos'))

# `todolist_detail_view` is not used in the URLs


class TodoListFormMixin(RequireWriteMixin, FilterGroupMixin):
    model = TodoList
    message_success = _('Todolist "%(title)s" was edited successfully.')
    message_error = _('Todolist "%(title)s" could not be edited.')

    def get_context_data(self, **kwargs):
        context = super(TodoListFormMixin, self).get_context_data(**kwargs)
        context.update({
            'form_view': self.form_view
        })
        return context

    def get_success_url(self):
        return reverse('cosinnus:todo:list',
            kwargs={'group': self.group.slug, 'listslug': self.object.slug})

    def form_valid(self, form):
        self.object = form.save(commit=False)
        if self.object.pk is None:
            self.object.group = self.group

        self.object.save()
        form.save_m2m()

        messages.success(self.request, self.message_success % {
                    'title': self.object.title})
        return HttpResponseRedirect(self.get_success_url())

    def form_invalid(self, form):
        ret = super(TodoListFormMixin, self).form_invalid(form)
        messages.error(self.request, self.message_error % {
                    'title': self.object.title})
        return ret


class TodoListAddView(AjaxableFormMixin, TodoListFormMixin, CreateView):
    form_class = TodoListAddForm
    form_view = 'add'
    message_success = _('Todolist "%(title)s" was added successfully.')
    message_error = _('Todolist "%(title)s" could not be added.')

todolist_add_view = TodoListAddView.as_view()


class TodoListEditView(AjaxableFormMixin, TodoListFormMixin, UpdateView):
    form_class = TodoListUpdateForm
    form_view = 'edit'

todolist_edit_view = TodoListEditView.as_view()


class TodoListDeleteView(AjaxableFormMixin, RequireWriteMixin, FilterGroupMixin,
        DeleteView):
    model = TodoList

    def get_success_url(self):
        return reverse('cosinnus:todo:list', kwargs={'group': self.group.slug})

todolist_delete_view = TodoListDeleteView.as_view()
