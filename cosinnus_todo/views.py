# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from six.moves.urllib.parse import quote as urlquote

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

from cosinnus.views.export import CSVExportView
from cosinnus.views.mixins.group import (
    RequireReadMixin, RequireWriteMixin, FilterGroupMixin, GroupFormKwargsMixin)
from cosinnus.views.mixins.tagged import TaggedListMixin

from cosinnus_todo.forms import (TodoEntryAddForm, TodoEntryAssignForm,
    TodoEntryCompleteForm, TodoEntryNoFieldForm, TodoEntryUpdateForm)
from cosinnus_todo.models import TodoEntry, TodoList


from cosinnus_todo.serializers import TodoEntrySerializer
from cosinnus.views.mixins.ajax import ListAjaxableResponseMixin, AjaxableFormMixin, \
    DetailAjaxableResponseMixin

class TodoIndexView(RequireReadMixin, RedirectView):

    def get_redirect_url(self, **kwargs):
        return reverse('cosinnus:todo:list', kwargs={'group': self.group.slug})

index_view = TodoIndexView.as_view()


class TodoListView(ListAjaxableResponseMixin, RequireReadMixin, FilterGroupMixin,
        TaggedListMixin, SortableListMixin, ListView):

    model = TodoEntry
    serializer_class = TodoEntrySerializer

    def get(self, request, *args, **kwargs):
        self.sort_fields_aliases = self.model.SORT_FIELDS_ALIASES
        self.filtered_list = request.GET.get('list', None)
        return super(TodoListView, self).get(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super(TodoListView, self).get_context_data(**kwargs)
        list_url_filter = ''
        if self.filtered_list:
            list_url_filter = '?list=%s' % urlquote(self.filtered_list)
        context.update({
            'todolists': TodoList.objects.filter(group_id=self.group.id).all(),
            'list_url_filter': list_url_filter,
            'filtered_list': self.filtered_list,
        })

        return context

    def get_queryset(self):
        # TODO Django>=1.7: change to chained select_relatad calls
        qs = super(TodoListView, self).get_queryset(
            select_related=('assigned_to', 'completed_by', 'todolist'))

        if self.filtered_list:
            qs = qs.filter(todolist__slug=self.filtered_list)

        # We basically want default ordering, but we first want to sort by the
        # list an entry belongs to.
        default_order = TodoEntry._meta.ordering
        return qs.order_by('todolist', *default_order)

list_view = TodoListView.as_view()


class TodoEntryDetailView(DetailAjaxableResponseMixin, RequireReadMixin, FilterGroupMixin,
        DetailView):
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
    message_success = _('Todo "%(title)s" was edited successfully.')
    message_error = _('Todo "%(title)s" could not be edited.')

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
        return HttpResponseRedirect(self.get_success_url())

    def post(self, request, *args, **kwargs):
        ret = super(TodoEntryFormMixin, self).post(request, *args, **kwargs)
        if self.object:
            if ret.get('location', '') == self.get_success_url():
                messages.success(request, self.message_success % {
                    'title': self.object.title})
            else:
                messages.error(request, self.message_error % {
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
        return super(TodoEntryAssignMeView, self).form_valid(form)

entry_assign_me_view = TodoEntryAssignMeView.as_view()


class TodoEntryUnassignView(TodoEntryAssignView):
    form_class = TodoEntryNoFieldForm
    form_view = 'unassign'
    message_success = _('Todo "%(title)s" was unassigned successfully.')
    message_error = _('Todo "%(title)s" could not be unassigned.')

    def form_valid(self, form):
        self.object = form.save(commit=False)
        self.object.assigned_to = None
        return super(TodoEntryUnassignView, self).form_valid(form)

entry_unassign_view = TodoEntryUnassignView.as_view()


class TodoEntryCompleteView(TodoEntryEditView):
    form_class = TodoEntryCompleteForm
    form_view = 'complete'
    message_success = _('Todo "%(title)s" was completed successfully.')
    message_error = _('Todo "%(title)s" could not be completed.')

entry_complete_view = TodoEntryCompleteView.as_view()


class TodoEntryCompleteMeView(TodoEntryEditView):
    form_class = TodoEntryNoFieldForm
    form_view = 'complete-me'
    message_success = _('Todo "%(title)s" was completed by You successfully.')
    message_error = _('Todo "%(title)s" could not be completed by You.')

    def form_valid(self, form):
        self.object = form.save(commit=False)
        self.object.completed_by = self.request.user
        self.object.completed_date = now()
        return super(TodoEntryCompleteMeView, self).form_valid(form)

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
        return super(TodoEntryIncompleteView, self).form_valid(form)

entry_incomplete_view = TodoEntryIncompleteView.as_view()


class TodoExportView(CSVExportView):
    fields = [
        'creator',
        'created',
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


class TodoListDeleteView(RequireWriteMixin, FilterGroupMixin, DeleteView):
    model = TodoList

    def get_success_url(self):
        return reverse('cosinnus:todo:list', kwargs={'group': self.group.slug})

todolist_delete = TodoListDeleteView.as_view()
