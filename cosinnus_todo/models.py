# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.core.urlresolvers import reverse
from django.db import models
from django.utils.encoding import force_unicode
from django.utils.timezone import now
from django.utils.translation import ugettext_lazy as _

from cosinnus.authentication.models import Group, User
from cosinnus.utils.models import TaggableModel

from cosinnus_todo.managers import TodoEntryManager


PRIORITY_LOW = 1
PRIORITY_MEDIUM = 2
PRIORITY_HIGH = 3

PRIORITY_CHOICES = (
    (PRIORITY_LOW, _('Low')),
    (PRIORITY_MEDIUM, _('Medium')),
    (PRIORITY_HIGH, _('High')),
)


class TodoEntry(TaggableModel):

    SORT_FIELDS_ALIASES = [('title', 'title'), ('created_date', 'created_date'), ('completed_by', 'completed_by'),
                           ('priority', 'priority'), ('assigned_to', 'assigned_to'), ('is_completed', 'is_completed')]

    title = models.CharField(_(u'Title'), max_length=140)
    created_date = models.DateTimeField(_(u'Created on'), default=now)
    created_by = models.ForeignKey(User, verbose_name=_(u'Created by'),
                                   on_delete=models.PROTECT,
                                   related_name='todos')
    due_date = models.DateTimeField(_(u'Due by'), blank=True, null=True,
                                    default=None)
    completed_date = models.DateTimeField(_(u'Completed on'), blank=True,
                                          null=True, default=None)
    completed_by = models.ForeignKey(User, verbose_name=_(u'Completed by'),
                                     blank=True, default=None, null=True,
                                     on_delete=models.SET_NULL,
                                     related_name='completed_todos')
    is_completed = models.BooleanField(default=0, blank=True)
    assigned_to = models.ForeignKey(User, verbose_name=_(u'Assigned to'),
                                    blank=True, default=None, null=True,
                                    on_delete=models.SET_NULL,
                                    related_name='assigned_todos')
    priority = models.PositiveIntegerField(_(u'Priority'), max_length=3,
                                           choices=PRIORITY_CHOICES,
                                           default=PRIORITY_MEDIUM)
    note = models.TextField(_(u'Note'), blank=True, null=True)
    group = models.ForeignKey(Group, verbose_name=_(u'Group'))

    objects = TodoEntryManager()

    class Meta:
        ordering = ['is_completed', '-completed_date', '-priority', '-due_date']
        verbose_name = _('TodoEntry')
        verbose_name_plural = _('TodoEntries')

    def __unicode__(self):
        return force_unicode(self.title)

    def save(self, *args, **kwargs):
        self.is_completed = bool(self.completed_date)
        super(TodoEntry, self).save(*args, **kwargs)

    def get_absolute_url(self):
        kwargs = {'group': self.group.pk,
                  'todo': self.pk}
        return reverse('sinn_todo-entry-detail', kwargs=kwargs)
