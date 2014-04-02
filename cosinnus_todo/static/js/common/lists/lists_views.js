CosinnusApp.module('Common.Lists', function(Lists, CosinnusApp, Backbone, Marionette, $, _) {

    Lists.keyScopes = {
        newList: 'new-list'
    };

    Lists.ListsItemsLayout = Marionette.Layout.extend({
        template: '#lists-items-layout',
        className: 'row',

        regions: {
            listsAllRegion: '.lists-all-container',
            listsNewRegion: '.lists-new-container',
            itemsAllRegion: '.items-all-container',
            itemsNewRegion: '.items-new-container'
        }
    });

    Lists.ListsItemView = Marionette.ItemView.extend({
        template: '#lists-item',
        className: 'list-group-item clearfix',

        events: {
            'click': 'listClicked'
//            'click .js-todolist-edit': 'editTodolistClicked',
//            'click .js-todolist-delete': 'deleteTodolistClicked'
        },

        initialize: function() {
            if (typeof this.model.id === 'undefined' || CosinnusApp.TodosApp.currentTodolistId === this.model.id) {
                $(this.el).addClass('selected');
            }
        },

        editTodolistClicked: function(e) {
            console.log("edit clicked");
            e.preventDefault();
            e.stopPropagation();
            this.trigger('todolist:edit', this.model);
        },

        deleteTodolistClicked: function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.trigger('todolist:delete', this.model);
        },

        listClicked: function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("Recieved call: " + JSON.stringify(this.model));
            CosinnusApp.trigger('todos:list', this.model.get('id'));
        },

        flash: function (cssClass) {
            var $view = this.$el;
            $view.hide().toggleClass(cssClass).fadeIn(800, function () {
                setTimeout(function () {
                    $view.toggleClass(cssClass)
                }, 500);
            });
        },

        remove: function () {
            // fade out the element before removing it
            var self = this;
            this.$el.fadeOut(function () {
                Marionette.ItemView.prototype.remove.call(self);
            });
        }
    });

    Lists.ListsNewView = Marionette.ItemView.extend({
        template: '#lists-new',
        className: 'list-group-item clearfix js-new-list-item',
        creatingNewList: false,

        events: {
            'click .js-new-list-title': 'newListClicked'
        },

        newListClicked: function(e) {
            console.log('new list click');
            if (!this.creatingNewList) {
                var target = $(e.target);
                this.activateNewListTitleEditing(target);
            }
        },

        activateNewListTitleEditing: function(target) {
            var $this = this;
            this.creatingNewList = true;
            key.setScope(Lists.keyScopes.newList);
            CosinnusApp.editedItem = target;
            target.html('');
            
            // shortcuts: create new list
            key('enter', Lists.keyScopes.newList, function(e, handler){
                e.preventDefault();
                e.stopPropagation();
                console.log('Enter pressed (new list)');
                var target = $(e.target);
                $this.createNewList(target);
                target.html(this.newListText);
                return false;
            });

            // shortcuts: cancel creation of a new list
            key('escape', Lists.keyScopes.newList, function(e, handler){
                console.log('Escape pressed (new list)');
                var target = $(e.target);
                $this.cancelCreatingNewList(target);
                return false;
            });
        },

        deactivateNewListTitleEditing: function(target) {
            this.creatingNewList = false;
            target.html(this.newListText);
            target.blur();
            
            key.unbind('enter', Lists.keyScopes.newList);
            key.unbind('escape', Lists.keyScopes.newList);
            key.setScope('all');
        },

        createNewList: function(target) {
            var newListTitle = target.html();
            console.log('Creating new List: ' + newListTitle);
            
            var todolist = new CosinnusApp.TodosApp.Entities.Todolist();
            todolist.set("title", newListTitle);
            
            todolist.save([], {success: function(model){
                console.log("Save success!" + JSON.stringify(model));
                CosinnusApp.TodosApp.currentTodolistId = todolist;
                CosinnusApp.trigger('todos:list', model.get('id'));
            },
            error: function(model){
                console.log("Save error!");
            }});
            console.log("Todolist saved!");

            var todolistsListView = CosinnusApp.TodosApp.List.Controller.todolistsListView;
            todolistsListView.children.last().$el.removeClass('selected');

            CosinnusApp.TodosApp.List.Controller.todolists.add(todolist);
            
            this.deactivateNewListTitleEditing(target);

            // flash the last (added) view
            flashView(todolistsListView.children.last().$el);
        },

        cancelCreatingNewList: function(target) {
            console.log('Canceled creating new');
            this.deactivateNewListTitleEditing(target);
        }
    });

});
