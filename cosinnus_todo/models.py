# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.core.urlresolvers import reverse
from django.db import models, transaction
from django.utils.encoding import python_2_unicode_compatible
from django.utils.translation import ugettext_lazy as _
from django.core.cache import cache

from cosinnus.models import BaseTaggableObjectModel
from cosinnus.utils.functions import unique_aware_slugify

from cosinnus_todo.conf import settings
from cosinnus_todo.managers import TodoEntryManager
from cosinnus.utils.permissions import get_tagged_object_filter_for_user

_TODOLIST_ITEM_COUNT = 'cosinnus/todo/itemcount/%d'

PRIORITY_LOW = 1
PRIORITY_MEDIUM = 2
PRIORITY_HIGH = 3

PRIORITY_CHOICES = (
    (PRIORITY_LOW, _('Later')),
    (PRIORITY_MEDIUM, _('Normal')),
    (PRIORITY_HIGH, _('Important')),
)


@python_2_unicode_compatible
class TodoEntry(BaseTaggableObjectModel):

    SORT_FIELDS_ALIASES = [
        ('title', 'title'),
        ('created', 'created'),
        ('completed_by', 'completed_by'),
        ('priority', 'priority'),
        ('assigned_to', 'assigned_to'),
        ('is_completed', 'is_completed'),
    ]

    due_date = models.DateField(_('Due by'), blank=True, null=True,
        default=None)

    completed_date = models.DateField(_('Completed on'), blank=True,
        null=True, default=None)
    completed_by = models.ForeignKey(settings.AUTH_USER_MODEL,
        verbose_name=_('Completed by'), blank=True, null=True, default=None,
        on_delete=models.SET_NULL, related_name='completed_todos')
    is_completed = models.BooleanField(default=0, blank=True)

    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL,
        verbose_name=_('Assigned to'), blank=True, null=True, default=None,
        on_delete=models.SET_NULL, related_name='assigned_todos')

    priority = models.PositiveIntegerField(_('Priority'), max_length=3,
        choices=PRIORITY_CHOICES, default=PRIORITY_MEDIUM)

    note = models.TextField(_('Note'), blank=True, null=True)

    todolist = models.ForeignKey('cosinnus_todo.TodoList',
        verbose_name=_('List'), blank=True, null=True, default=None,
        related_name='todos', on_delete=models.PROTECT)

    objects = TodoEntryManager()

    class Meta(BaseTaggableObjectModel.Meta):
        ordering = ['is_completed', '-completed_date', '-priority', '-due_date']
        verbose_name = _('Todo')
        verbose_name_plural = _('Todos')

    def __init__(self, *args, **kwargs):
        super(TodoEntry, self).__init__(*args, **kwargs)
        self._todolist = getattr(self, 'todolist', None)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        self.is_completed = bool(self.completed_date)
        super(TodoEntry, self).save(*args, **kwargs)
        self._clear_cache()
        self._todolist = self.todolist

    def get_absolute_url(self):
        kwargs = {'group': self.group.slug, 'listslug':self.todolist.slug, 'todoslug': self.slug}
        return reverse('cosinnus:todo:list-todo', kwargs=kwargs)

    def can_user_assign(self, user):
        """
        Test if a user can assign this object
        """
        if self.creator_id == user.pk:
            return True
        if self.group.is_admin(user):
            return True
        if user.is_superuser:
            return True
        return False

    def _clear_cache(self):
        if self.todolist:
            self.todolist._clear_cache()
        if self._todolist:
            self._todolist._clear_cache()

    def delete(self, *args, **kwargs):
        super(TodoEntry, self).delete(*args, **kwargs)
        self._clear_cache()
        
    @classmethod
    def get_current(self, group, user):
        """ Returns a queryset of the current upcoming events """
        qs = TodoEntry.objects.filter(group=group)
        if user:
            q = get_tagged_object_filter_for_user(user)
            qs = qs.filter(q)
        return qs.filter(is_completed=False)
        


@python_2_unicode_compatible
class TodoList(models.Model):

    title = models.CharField(_('Title'), max_length=255)
    slug = models.SlugField(max_length=55, blank=True)  # human readable part is 50 chars
    group = models.ForeignKey('cosinnus.CosinnusGroup',
        verbose_name=_('Group'), related_name='+', on_delete=models.PROTECT)

    class Meta:
        ordering = ('title',)
        unique_together = (('group', 'slug'),)

    def __str__(self):
        return self.title

    def delete(self, *args, **kwargs):
        sid = transaction.savepoint()
        try:
            self.todos.all().delete()
            super(TodoList, self).delete(*args, **kwargs)
        except:
            transaction.savepoint_rollback(sid)
        else:
            transaction.savepoint_commit(sid)

    def save(self, *args, **kwargs):
        unique_aware_slugify(self, 'title', 'slug', group=self.group)
        super(TodoList, self).save(*args, **kwargs)
    
    def get_absolute_url(self):
        kwargs = {'group': self.group.slug, 'listslug': self.slug}
        return reverse('cosinnus:todo:list-list', kwargs=kwargs)
    
    @property
    def filtered_item_count(self):
        if hasattr(self, 'filtered_items'):
            return self.filtered_items.count()
        return self.item_count()
    
    @property
    def item_count(self):
        #count = getattr(self, '_item_count')
        count = cache.get(_TODOLIST_ITEM_COUNT % self.pk)
        if count is None:
            # Hide completed todos
            count = self.todos.exclude(is_completed__exact=True).count()
            cache.set(_TODOLIST_ITEM_COUNT % self.pk, count)
        return count

    def _clear_cache(self):
        cache.delete(_TODOLIST_ITEM_COUNT % self.pk)
    


import django
if django.VERSION[:2] < (1, 7):
    from cosinnus_todo import cosinnus_app
    cosinnus_app.register()
