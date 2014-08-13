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

from cosinnus.views.export import CSVExportView
from cosinnus.views.mixins.group import (RequireReadMixin, RequireWriteMixin,
     FilterGroupMixin, GroupFormKwargsMixin)
from cosinnus.views.mixins.user import UserFormKwargsMixin

from cosinnus_todo.forms import (TodoEntryAddForm, TodoEntryAssignForm,
    TodoEntryCompleteForm, TodoEntryNoFieldForm, TodoEntryUpdateForm,
    TodoListForm)
from cosinnus_todo.models import TodoEntry, TodoList


from cosinnus_todo.serializers import TodoEntrySerializer, TodoListSerializer
from cosinnus.views.mixins.ajax import ListAjaxableResponseMixin, AjaxableFormMixin, \
    DetailAjaxableResponseMixin
from django.views.decorators.csrf import csrf_protect
from cosinnus.utils.permissions import check_object_write_access
from cosinnus.utils.http import JSONResponse
from django.contrib.auth import get_user_model
from cosinnus.views.mixins.filters import CosinnusFilterMixin
from cosinnus_todo.filters import TodoFilter
from django.http.request import QueryDict


class TodoIndexView(RequireReadMixin, RedirectView):

    def get_redirect_url(self, **kwargs):
        return reverse('cosinnus:todo:list', kwargs={'group': self.group.slug})

index_view = TodoIndexView.as_view()


class TodoEntryListView(ListAjaxableResponseMixin, RequireReadMixin,
                        FilterGroupMixin, CosinnusFilterMixin,
                        ListView):

    model = TodoEntry
    serializer_class = TodoEntrySerializer
    filterset_class = TodoFilter
        
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
        
        if list_filter:
            self.todolist = get_object_or_404(TodoList, **list_filter)
        else:
            self.todolist = None
            
        todo_slug = kwargs.get('todoslug', None)
        if todo_slug:
            self.todo = get_object_or_404(TodoEntry, slug=todo_slug)
        else:
            self.todo = None
            
        return super(TodoEntryListView, self).dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super(TodoEntryListView, self).get_context_data(**kwargs)
        
        context.update({
            'todolists': TodoList.objects.filter(group_id=self.group.id).all(),
            'active_todolist': self.todolist,
            'active_todo': self.todo,
            'group_users': get_user_model().objects.filter(id__in=self.group.members)
        })
        return context

    def get_queryset(self):
        # TODO Django>=1.7: change to chained select_related calls
        qs = super(TodoEntryListView, self).get_queryset(
            select_related=('assigned_to', 'completed_by', 'todolist'))
        if self.todolist:
            qs = qs.filter(todolist_id=self.todolist.pk)
        # Hide completed todos in normal view.
        if not self.kwargs.get('archived'):
            qs = qs.exclude(is_completed__exact=True)
        return qs

entry_list_view = TodoEntryListView.as_view()
entry_list_view_api = TodoEntryListView.as_view(is_ajax_request_url=True)


class TodoListCreateView(ListAjaxableResponseMixin, RequireReadMixin,
                        FilterGroupMixin, CosinnusFilterMixin,
                        ListView):

    model = TodoEntry
    serializer_class = TodoEntrySerializer
    template_name = 'cosinnus_todo/todo_list.html'
    filterset_class = TodoFilter

    def dispatch(self, request, *args, **kwargs):
        
        list_filter = None
        list_slug = kwargs.get('listslug', None)
        if list_slug:
            list_filter = {'slug': list_slug, 'group__slug': kwargs.get('group')}
        
        if list_filter:
            self.todolist = get_object_or_404(TodoList, **list_filter)
        else:
            self.todolist = None
            
        todo_slug = kwargs.get('todoslug', None)
        if todo_slug:
            self.todo = get_object_or_404(TodoEntry, slug=todo_slug, group__slug=kwargs.get('group'))
        else:
            self.todo = None
        
        # default filter for todos is completed=False
        if not 'is_completed' in request.GET:
            qdict = QueryDict('', mutable=True)
            qdict.update(request.GET)
            qdict.update({'is_completed':'0'})
            request.GET = qdict
            
        ret = super(TodoListCreateView, self).dispatch(request, *args, **kwargs)
        return ret
    
    def get_queryset(self):
        if not hasattr(self, 'all_todolists'):
            self.all_todolists = TodoList.objects.filter(group_id=self.group.id).all()
            
        # TODO Django>=1.7: change to chained select_related calls
        qs = super(TodoListCreateView, self).get_queryset(
            select_related=('assigned_to', 'completed_by', 'todolist'))
        if not self.todolist and self.all_todolists.count() > 0:
            self.todolist = self.all_todolists[0]
        
        self.all_todos = qs
        if self.todolist:
            qs = qs.filter(todolist_id=self.todolist.pk)
            
        # Hide completed todos in normal view.
        #if not self.kwargs.get('archived'):
            #qs = qs.exclude(is_completed__exact=True)
        return qs

    def get_context_data(self, **kwargs):
        context = super(TodoListCreateView, self).get_context_data(**kwargs)
        
        todos = context.get('object_list')#.exclude(is_completed__exact=True)
        #incomplete_todos = context.get('object_list').filter(is_completed__exact=True)
        
        #incomplete_all_todos = self.all_todos.exclude(is_completed__exact=True)
        for todolist in self.all_todolists:
            todolist.filtered_items = self.all_todos.filter(todolist=todolist)#incomplete_all_todos.filter(todolist=todolist)
        
        context.update({
            'todolists': self.all_todolists,
            'active_todolist': self.todolist,
            'active_todo': self.todo,
            'group_users': get_user_model().objects.filter(id__in=self.group.members),
            'objects': todos,
            'todos': todos,
        })
        return context


todo_list_create_view = TodoListCreateView.as_view()


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
entry_detail_view_api = TodoEntryDetailView.as_view(is_ajax_request_url=True)


class TodoEntryFormMixin(RequireWriteMixin, FilterGroupMixin,
                         GroupFormKwargsMixin, UserFormKwargsMixin):
    model = TodoEntry

    def get_context_data(self, **kwargs):
        context = super(TodoEntryFormMixin, self).get_context_data(**kwargs)
        context.update({
            'form_view': self.form_view,
            'tags': TodoEntry.objects.filter(group=self.group).tag_names()
        })
        return context

    def get_success_url(self):
        return reverse('cosinnus:todo:entry-detail',
            kwargs={'group': self.group.slug, 'slug': self.object.slug})

    def form_valid(self, form):
        new_list = form.cleaned_data.get('new_list', None)
        todolist = form.instance.todolist
        if new_list:
            todolist = TodoList.objects.create(title=new_list, group=self.group)
            # selection or current
            todolist = form.cleaned_data.get('todolist', form.instance.todolist)
        form.instance.todolist = todolist

        if form.instance.pk is None:
            form.instance.creator = self.request.user

        if form.instance.completed_by:
            if not form.instance.completed_date:
                form.instance.completed_date = now()
        else:
            form.instance.completed_date = None

        ret = super(TodoEntryFormMixin, self).form_valid(form)
        messages.success(self.request,
            self.message_success % {'title': self.object.title})
        return ret

    def form_invalid(self, form):
        ret = super(TodoEntryFormMixin, self).form_invalid(form)
        if self.object:
            messages.error(self.request,
                self.message_error % {'title': self.object.title})
        return ret


class TodoEntryAddView(AjaxableFormMixin, TodoEntryFormMixin, CreateView):
    form_class = TodoEntryAddForm
    form_view = 'add'
    message_success = _('Todo "%(title)s" was added successfully.')
    message_error = _('Todo "%(title)s" could not be added.')
    
    def get_success_url(self):
        return reverse('cosinnus:todo:list-todo',
            kwargs={'group': self.group.slug, 'listslug': self.object.todolist.slug,
                    'todoslug': self.object.slug})


entry_add_view = TodoEntryAddView.as_view()
entry_add_view_api = TodoEntryAddView.as_view(is_ajax_request_url=True)


class TodoEntryEditView(AjaxableFormMixin, TodoEntryFormMixin, UpdateView):
    form_class = TodoEntryUpdateForm
    form_view = 'edit'
    message_success = _('Todo "%(title)s" was edited successfully.')
    message_error = _('Todo "%(title)s" could not be edited.')

entry_edit_view = TodoEntryEditView.as_view()
entry_edit_view_api = TodoEntryEditView.as_view(is_ajax_request_url=True)


class TodoEntryDeleteView(AjaxableFormMixin, TodoEntryFormMixin, DeleteView):
    form_class = TodoEntryNoFieldForm
    form_view = 'delete'
    message_success = _('Todo "%(title)s" was deleted successfully.')
    message_error = _('Todo "%(title)s" could not be deleted.')

    def get_success_url(self):
        return reverse('cosinnus:todo:list', kwargs={'group': self.group.slug})

entry_delete_view = TodoEntryDeleteView.as_view()
entry_delete_view_api = TodoEntryDeleteView.as_view(is_ajax_request_url=True)


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
entry_assign_view_api = TodoEntryAssignView.as_view(is_ajax_request_url=True)


class TodoEntryAssignMeView(TodoEntryAssignView):
    form_class = TodoEntryNoFieldForm
    form_view = 'assign-me'
    message_success = _('Todo "%(title)s" was assigned to You successfully.')
    message_error = _('Todo "%(title)s" could not be assigned to You.')

    def form_valid(self, form):
        form.instance.assigned_to = self.request.user
        return super(TodoEntryAssignMeView, self).form_valid(form)

entry_assign_me_view = TodoEntryAssignMeView.as_view()
entry_assign_me_view_api = TodoEntryAssignMeView.as_view(is_ajax_request_url=True)


class TodoEntryUnassignView(TodoEntryAssignView):
    form_class = TodoEntryNoFieldForm
    form_view = 'unassign'
    message_success = _('Todo "%(title)s" was unassigned successfully.')
    message_error = _('Todo "%(title)s" could not be unassigned.')

    def form_valid(self, form):
        form.instance.assigned_to = None
        return super(TodoEntryUnassignView, self).form_valid(form)

entry_unassign_view = TodoEntryUnassignView.as_view()
entry_unassign_view_api = TodoEntryUnassignView.as_view(is_ajax_request_url=True)


class TodoEntryCompleteView(TodoEntryEditView):
    form_class = TodoEntryCompleteForm
    form_view = 'complete'
    message_success = _('Todo "%(title)s" was completed successfully.')
    message_error = _('Todo "%(title)s" could not be completed.')

entry_complete_view = TodoEntryCompleteView.as_view()
entry_complete_view_api = TodoEntryCompleteView.as_view(is_ajax_request_url=True)


class TodoEntryCompleteMeView(TodoEntryEditView):
    form_class = TodoEntryNoFieldForm
    form_view = 'complete-me'
    message_success = _('Todo "%(title)s" was completed by You successfully.')
    message_error = _('Todo "%(title)s" could not be completed by You.')

    def form_valid(self, form):
        form.instance.completed_by = self.request.user
        form.instance.completed_date = now()
        return super(TodoEntryCompleteMeView, self).form_valid(form)

entry_complete_me_view = TodoEntryCompleteMeView.as_view()
entry_complete_me_view_api = TodoEntryCompleteMeView.as_view(is_ajax_request_url=True)


@csrf_protect
def entry_toggle_complete_me_view_api(request, pk, group):
    """
    Logs the user specified by the `authentication_form` in.
    """
    if request.method == "POST":
        # TODO: Django<=1.5: Django 1.6 removed the cookie check in favor of CSRF
        request.session.set_test_cookie()
        
        pk = request.POST.get('pk')
        is_completed = request.POST.get('is_completed')
        
        instance = get_object_or_404(TodoEntry, pk=pk)
        if not check_object_write_access(instance, request.user):
            return JSONResponse('You do not have the necessary permissions to modify this object!', status=403)
        
        if is_completed == "true":
            instance.completed_by = request.user
            instance.completed_date = now()
        else:
            instance.completed_by = None
            instance.completed_date = None
        instance.save()
        
        return JSONResponse({'status':'success', 'is_completed':instance.is_completed})

class TodoEntryIncompleteView(TodoEntryEditView):
    form_class = TodoEntryNoFieldForm
    form_view = 'incomplete'
    message_success = _('Todo "%(title)s" was set to incomplete successfully.')
    message_error = _('Todo "%(title)s" could not be set to incomplete.')

    def form_valid(self, form):
        form.instance.completed_by = None
        form.instance.completed_date = None
        return super(TodoEntryIncompleteView, self).form_valid(form)

entry_incomplete_view = TodoEntryIncompleteView.as_view()
entry_incomplete_view_api = TodoEntryIncompleteView.as_view(is_ajax_request_url=True)


class TodoExportView(CSVExportView):
    fields = ('creator', 'created', 'due_date', 'completed_by',
        'completed_date', 'is_completed', 'assigned_to', 'priority', 'note',)
    file_prefix = 'cosinnus_todo'
    model = TodoEntry

export_view = TodoExportView.as_view()


class TodoListListView(ListAjaxableResponseMixin, RequireReadMixin,
        FilterGroupMixin, ListView):

    model = TodoList
    serializer_class = TodoListSerializer

todolist_list_view = TodoListListView.as_view()
todolist_list_view_api = TodoListListView.as_view(is_ajax_request_url=True)


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
todolist_detail_view_api = TodoListDetailView.as_view(is_ajax_request_url=True)


class TodoListFormMixin(RequireWriteMixin, FilterGroupMixin,
                        GroupFormKwargsMixin):
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
        ret = super(TodoListFormMixin, self).form_valid(form)
        messages.success(self.request,
            self.message_success % {'title': self.object.title})
        return ret

    def form_invalid(self, form):
        ret = super(TodoListFormMixin, self).form_invalid(form)
        messages.error(self.request,
            self.message_error % {'title': self.object.title})
        return ret


class TodoListAddView(AjaxableFormMixin, TodoListFormMixin, CreateView):
    form_class = TodoListForm
    form_view = 'add'
    message_success = _('Todolist "%(title)s" was added successfully.')
    message_error = _('Todolist "%(title)s" could not be added.')

    def get_success_url(self):
        return reverse('cosinnus:todo:list-list',
            kwargs={'group': self.group.slug, 'listslug': self.object.slug})

todolist_add_view = TodoListAddView.as_view()
todolist_add_view_api = TodoListAddView.as_view(is_ajax_request_url=True)


class TodoListEditView(AjaxableFormMixin, TodoListFormMixin, UpdateView):
    form_class = TodoListForm
    form_view = 'edit'

todolist_edit_view = TodoListEditView.as_view()
todolist_edit_view_api = TodoListEditView.as_view(is_ajax_request_url=True)


class TodoListDeleteView(AjaxableFormMixin, RequireWriteMixin, FilterGroupMixin,
        DeleteView):
    model = TodoList

    def get_success_url(self):
        return reverse('cosinnus:todo:list', kwargs={'group': self.group.slug})

todolist_delete_view = TodoListDeleteView.as_view()
todolist_delete_view_api = TodoListDeleteView.as_view(is_ajax_request_url=True)
