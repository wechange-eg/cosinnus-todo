CosinnusApp.module('TodosApp.List', function(List, CosinnusApp, Backbone, Marionette, $, _) {
    
    List.isEditingItemTitle = false;

    List.TodolistView = CosinnusApp.Common.Lists.ListsItemView.extend();

    List.TodolistsView = Marionette.CollectionView.extend({
        itemView: List.TodolistView,
        collection: null, // supplied at instantiation time
        className: 'list-group todos-colors clearfix'

//        initialize: function () {
//            // on reset add the element
//            this.listenTo(this.collection, "reset", function () {
//                this.appendHtml = function (collectionView, itemView, index) {
//                    collectionView.$el.append(itemView.el);
//                }
//            });
//            this.collection.bind("sync", function(){console.log("debug:: TodoList-Collection synced!")})
//        },
    });

    List.TodolistsNewView = CosinnusApp.Common.Lists.ListsNewView.extend({
        newListText: 'Lege eine neue Liste an'
    });
    
    List.TodosItemView = Marionette.ItemView.extend({
        template: '#todos-item',

        events: {
            'click .item-title': 'itemTitleClicked',
            'change .item-title': 'itemTitleChanged',
            'click .js-item-title-save': 'itemTitleSave',
            'click .js-item-title-cancel': 'itemTitleCancel'
        },

        itemTitleClicked: function(e) {
            console.log('click: ');
            var target = $(e.target);
            if (List.isEditingItemTitle &&
                (CosinnusApp.editedItem !== undefined || CosinnusApp.editedItem !== null)) {
                // save and deactivate the currently editing item
                this.saveItem(target);
                this.deactivateItemTitleEditing(CosinnusApp.editedItem)
            }
            this.activateItemTitleEditing(target);
        },

        itemTitleChanged: function(e) {
            console.log('change');
        },

        itemTitleSave: function(e) {
            console.log('save.js clicked');
            var target = $(e.currentTarget).parent().prev();
            this.saveItem(target);
        },

        itemTitleCancel: function(e) {
            console.log('cancel.js clicked');
            var target = $(e.currentTarget);
            var el = target.parent().prev();
            this.cancelClicked(el);
        },

        initialize: function() {
            var $this = this;

            key('enter', 'item-title', function(e, handler){
                // TODO: this function is called 3x times !!! Performance kill!
                console.log('Enter pressed');
                var target = $(e.target);
                $this.saveItem(target);
                target.blur();
                return false;
            });

            key('escape', 'item-title', function(e, handler){
                console.log('Escape pressed');
                var target = $(e.target);
                $this.cancelClicked(target);
                target.blur();
                return false;
            });
            key('f2', function(e, handler){
                console.log('F2 pressed');
                if (CosinnusApp.editedItem !== undefined) {
                    console.log('F2 pressed inside ...');
                    CosinnusApp.editedItem.trigger('click');
                    CosinnusApp.editedItem.focus();
                }
                return false;
            });
        },

        /**
         * Item title click handler.
         *
         * @param target - jQuery element
         */
        activateItemTitleEditing: function(target) {
            console.log('activateItemTitleEditing()');
            List.isEditingItemTitle = true;
            key.setScope('item-title');
            CosinnusApp.editedItem = target;
            CosinnusApp.editedItemLastValue = target.html();
            var titleButtonsEl = this.getTitleButtonsElement(target);
            titleButtonsEl.show();
        },

        /**
         * Item title click handler.
         *
         * @param target - jQuery element
         */
        deactivateItemTitleEditing: function(target) {
            console.log('deactivateItemTitleEditing()');
            key.setScope('all');
            CosinnusApp.editedItem = null;
            CosinnusApp.editedItemLastValue = null;
            var titleButtonsEl = this.getTitleButtonsElement(target);
            titleButtonsEl.hide();
            List.isEditingItemTitle = false;
        },

        /**
         * Saves an item
         * @param target - jQuery input element
         */
        saveItem: function(target) {
            var itemTitle = target.html();
            console.log('saveItem: ' + itemTitle);
            key.setScope('all');
            this.getTitleButtonsElement(target).hide();
        },

        /**
         * Saves an item
         * @param target - jQuery input element
         */
        cancelClicked: function(target) {
            console.log('cancelClicked()');
            target.html(CosinnusApp.editedItemLastValue);
            this.getTitleButtonsElement(target).hide();
        },

        getTitleButtonsElement: function(target) {
            return target.next();
        },

        remove: function () {
            // fade out the element before removing it
            var self = this;
            this.$el.fadeOut(function () {
                Marionette.ItemView.prototype.remove.call(self);
            });
        }
    });

    List.TodosListView = Marionette.CollectionView.extend({
        itemView: List.TodosItemView,
        collection: null, // supplied at instantiation time
        className: 'list-group items-all-container todos-all-container todos-colors'
    });

    List.TodosNewView = Marionette.ItemView.extend({
        template: '#todos-new'
    });

    
    List.Layout = Marionette.Layout.extend({
        template: '#todos-list-layout',
     
        regions: {
            topRegion: '#todos-top-region',
            todolistListRegion: '#todolists-list-region',
            listRegion: '#todos-list-region'
        }
    });
    
    List.TopView = Marionette.ItemView.extend({
        template: '#todos-top',
        className: 'clearfix',

        triggers: {
            'click a.js-new-todolist': 'todos:new-todolist',
            'click a.js-new': 'todos:new'
        }
    });
    
    List.TodolistView = Marionette.ItemView.extend({
        template: '#todolists-list-item',
        tagName: 'tr',
        modelEvents: {
            'change': 'render'
        },
        events: {
            'click .js-todolist-list': 'todolistClicked',
            'click .js-todolist-edit': 'editTodolistClicked',
            'click .js-todolist-delete': 'deleteTodolistClicked'
         },

        editTodolistClicked: function(e) {
            console.log("edit clicked")
            e.preventDefault();
            e.stopPropagation();
            this.trigger('todolist:edit', this.model);
        },
        
        deleteTodolistClicked: function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.trigger('todolist:delete', this.model);
        },
        
        todolistClicked: function(e) {
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

    List.TodoView = Marionette.ItemView.extend({
        template: '#todos-list-item',
        tagName: 'tr',
        modelEvents: {
            'change': 'render'
        },
        events: {
            'click .js-detail': 'detailClicked',
            'click .js-edit': 'editClicked',
            'click .js-delete': 'deleteClicked',
            'click .js-list': 'listClicked',
            'click .js-assignto-me': 'assignMe',
            'click .js-unassign': 'unassign',
            'click .js-completedme': 'completedMe',
            'click .js-incomplete': 'incomplete',
        },

        flash: function (cssClass) {
            var $view = this.$el;
            $view.hide().toggleClass(cssClass).fadeIn(800, function () {
                setTimeout(function () {
                    $view.toggleClass(cssClass)
                }, 500);
            });
        },

        detailClicked: function(e) {
            e.preventDefault();
            e.stopPropagation();
            //this.trigger('todos:detail', this.model);
            // more direct way to do this:
            CosinnusApp.trigger('todos:detail', this.model.get('id'));
        },

        editClicked: function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.trigger('todos:edit', this.model);
        },

        assignMe: function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.model.assignMe();
        },
        
        unassign: function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.model.unassign();
        },
        
        completedMe: function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.model.completedMe();
        },
        
        incomplete: function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.model.incomplete();
        },
        
        listClicked: function(e) {
            e.preventDefault();
            e.stopPropagation();
            CosinnusApp.trigger('todos:list', this.model.get('todolist'));
        },

        deleteClicked: function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.trigger('todos:delete', this.model);
        },
        
        remove: function () {
            // fade out the element before removing it
            var self = this;
            this.$el.fadeOut(function () {
                Marionette.ItemView.prototype.remove.call(self);
            });
        }
    });
    
    List.TodosView = Marionette.CompositeView.extend({
        template: '#todos-list',
        itemView: List.TodoView,
        itemViewContainer: 'tbody',
        className: 'table table-striped',
        tagName: 'table',
        collection: null, // supplied at instantiation time

        initialize: function () {
            // on reset add the element
            this.listenTo(this.collection, "reset", function () {
                this.appendHtml = function (collectionView, itemView, index) {
                    collectionView.$el.append(itemView.el);
                }
            });
            this.collection.bind("sync", function(){console.log("debug:: TodoList-Collection synced!")})
        },

        onCompositeCollectionRendered: function () {
            // prepend the element to the top instead of appending to the bottom
            this.appendHtml = function (collectionView, itemView, index) {
                collectionView.$el.prepend(itemView.el);
            }
        }
    });
    
    List.TodolistsView = Marionette.CompositeView.extend({
        template: '#todolists-list',
        itemView: List.TodolistView,
        itemViewContainer: 'tbody',
        className: 'table table-striped',
        tagName: 'table',
        collection: null, // supplied at instantiation time
        
        
        initialize: function () {
            // on reset add the element
            this.listenTo(this.collection, "reset", function () {
                this.appendHtml = function (collectionView, itemView, index) {
                    collectionView.$el.append(itemView.el);
                }
            });
            this.collection.bind("sync", function(c){console.log("debug:: TodoList-Collection synced!" + JSON.stringify(c))})
        },

        onCompositeCollectionRendered: function () {
            // prepend the element to the top instead of appending to the bottom
            this.appendHtml = function (collectionView, itemView, index) {
                collectionView.$el.prepend(itemView.el);
            }
        }
    });
    

});
