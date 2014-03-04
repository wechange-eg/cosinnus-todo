# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.core.urlresolvers import reverse
from django.db import models
from django.utils.encoding import python_2_unicode_compatible
from django.utils.translation import ugettext_lazy as _

from cosinnus.models import BaseTaggableObjectModel
from cosinnus.utils.functions import unique_aware_slugify

from cosinnus_todo.conf import settings
from cosinnus_todo.managers import TodoEntryManager


PRIORITY_LOW = 1
PRIORITY_MEDIUM = 2
PRIORITY_HIGH = 3

PRIORITY_CHOICES = (
    (PRIORITY_LOW, _('Low')),
    (PRIORITY_MEDIUM, _('Medium')),
    (PRIORITY_HIGH, _('High')),
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

    due_date = models.DateTimeField(_('Due by'), blank=True, null=True,
        default=None)

    completed_date = models.DateTimeField(_('Completed on'), blank=True,
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

    class Meta:
        ordering = ['is_completed', '-completed_date', '-priority', '-due_date']
        verbose_name = _('TodoEntry')
        verbose_name_plural = _('TodoEntries')

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        self.is_completed = bool(self.completed_date)
        super(TodoEntry, self).save(*args, **kwargs)

    def get_absolute_url(self):
        kwargs = {'group': self.group.slug, 'slug': self.slug}
        return reverse('cosinnus:todo:entry-detail', kwargs=kwargs)

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

    def save(self, *args, **kwargs):
        unique_aware_slugify(self, 'title', 'slug', group=self.group)
        super(TodoList, self).save(*args, **kwargs)


import django
if django.VERSION[:2] < (1, 7):
    from cosinnus_todo import cosinnus_app
    cosinnus_app.register()
