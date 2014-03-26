CosinnusApp.module('TodosApp.List', function(List, CosinnusApp, Backbone, Marionette, $, _) {
    
    List.isEditingItemTitle = false;

    List.TodolistView = CosinnusApp.Common.Lists.ListsItemView.extend({
        modelEvents: {
            'change': 'render'
        }
    });

    List.TodolistsView = Marionette.CollectionView.extend({
        itemView: List.TodolistView,
        collection: null, // supplied at instantiation time
        className: 'list-group todos-colors clearfix',
        modelEvents: {
            'change': 'render'
        }

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
        modelEvents: {
            // too much rendering
            // see http://documentcloud.github.io/backbone/#Model-changedAttributes
            // http://documentcloud.github.io/backbone/#Model-previous
            'change': 'render'
        },

        events: {
            'click .item-title': 'itemTitleClicked',
            'change .item-title': 'itemTitleChanged',
            'click .js-item-title-save': 'itemTitleSave',
            'click .js-item-title-cancel': 'itemTitleCancel',
            'click .icon-checkbox-checked': 'markItemIncomplete',
            'click .icon-checkbox-unchecked': 'markItemCompletedMe',
            'click .js-icon-star': 'starClicked'
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
        
        markItemCompletedMe: function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("complete clicked");
            this.model.completedMe();
        },
        
        markItemIncomplete: function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("incomplete clicked");
            this.model.incomplete();
        },

        initialize: function() {
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

        onRender: function() {
            console.log('onRender');

            var $el = $(this.el);
            var viewModel = this.model;

            // activate avatars
            var avatarEl = $el.find(".select2-avatar-item");
            avatarEl.select2(CosinnusApp.select2Options);
            avatarEl.on("select2-selecting", function(e) {
                var userid = e.val;
                if (userid == -1){
                    userid = "";
                }
                console.log("new assigned="+ userid);
                var user = List.Controller.groupUsers.get(userid);
                if (typeof user !== 'undefined') {
                    viewModel.set("assigned_to", user.toJSON());
                } else {
                    viewModel.set("assigned_to", null);
                }
                viewModel.save();
            });

            // activate date picker
            var datePicker = $el.find('.date-picker');
            datePicker.datetimepicker(CosinnusApp.datePickerOptions);
            datePicker.on('change.dp', this.dateChanged);
        },



        dateChanged: function(e) {
            var date = e.date;
            
            var $target = $(e.target);
            var modelId = $target.data('model-id');
            var todo = CosinnusApp.TodosApp.List.Controller.todos.get(modelId);
            var formdate = moment(date).format(cosinnus_datetime_format);
            console.log('date picked: ' + formdate);
            
            todo.set('due_date', formdate);
            todo.save();
        },

        /**
         * Item title click handler.
         *
         * @param target - jQuery element
         */
        activateItemTitleEditing: function(target) {
            var $this = this;
            console.log('activateItemTitleEditing()');
            List.isEditingItemTitle = true;
            key.setScope('item-title');
            CosinnusApp.editedItem = target;
            CosinnusApp.editedItemLastValue = target.html();
            var titleButtonsEl = this.getTitleButtonsElement(target);
            

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
            
            key.unbind('enter', 'item-title');
            key.unbind('escape', 'item-title');
        },

        /**
         * Saves an item
         * @param target - jQuery input element
         */
        saveItem: function(target) {
            var itemTitle = target.html();
            console.log(this.model);
            console.log('saveItem: ' + itemTitle);
            
            this.model.set("title", itemTitle);
            this.model.save();
            
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

        starClicked: function(e) {
            console.log('star clicked.');
            var target = $(e.target);
            var priority = target.data('priority');
            var nextPriority;
            if (priority == 1) {
                target.removeClass('icon-star').addClass('icon-star2');
                nextPriority = priority + 1;
            } else if (priority == 2) {
                target.removeClass('icon-star2').addClass('icon-star3');
                nextPriority = priority + 1;
            } else {
                target.removeClass('icon-star3').addClass('icon-star');
                nextPriority = 1;
            }
            target.data('priority', nextPriority);
            
            // save the selected priority
            this.model.set('priority', nextPriority);
            this.model.save();
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
        className: 'list-group items-all-container todos-all-container todos-colors',
        modelEvents: {
            'change': 'render'
        },
    });

    List.TodosNewView = Marionette.ItemView.extend({
        template: '#todos-new',
        newTitleText: 'Lege eine neue Aufgabe an',
        creatingNew: false,

        events: {
            'click .js-new-todo-title': 'newClicked'
        },

        newClicked: function(e) {
            console.log('new todo click');
            if (!this.creatingNew) {
                var target = $(e.target);
                this.activateNew(target);
            }
        },

        activateNew: function(target) {
            this.creatingNew = true;
            key.setScope('new-todo');
            CosinnusApp.editedItem = target;
            target.html('');

            var $this = this;

            // shortcuts: create new list
            key('enter', 'new-todo', function(e, handler){
                console.log('Enter pressed (new-todo)');
                var target = $(e.target);
                $this.createNewTodo(target);
                target.html($this.newTitleText);
                return false;
            });

            // shortcuts: cancel creation of a new list
            key('escape', 'new-todo', function(e, handler){
                console.log('Escape pressed (new-todo)');
                var target = $(e.target);
                $this.cancelCreatingNew(target);
                return false;
            });
        },

        deactivateNew: function(target) {
            this.creatingNew = false;
            key.setScope('all');
            target.html(this.newTitleText);
            target.blur();

            key.unbind('enter', 'new-todo');
            key.unbind('escape', 'new-todo');
        },

        createNewTodo: function(target) {
            var newTitle = target.html();
            console.log('Creating new Todo: ' + newTitle);
            this.deactivateNew(target);
            
            
            var todo = new CosinnusApp.TodosApp.Entities.Todo();
            var todolistId = CosinnusApp.TodosApp.currentTodolistId;
            var todolist = CosinnusApp.TodosApp.List.Controller.todolists.get(todolistId);
            
            todo.set("title", newTitle);
            todo.set("todolist", todolistId);
            // TODO: save more model attributes, like due_date
            
            todo.save([], {
                success: function(model){
                    console.log("Save success!" + JSON.stringify(model));
                },
                error: function(model){
                    console.log("Save error!");
                }});
            console.log("Todo saved!");
            
            // add the todo to the current collection
            CosinnusApp.TodosApp.List.Controller.todos.add(todo);
            // artificially count up the todolist's count (will be re-synced during next sync)
            todolist.set("item_count", todolist.get("item_count")+1);
        },

        cancelCreatingNew: function(target) {
            console.log('Canceled creating new');
            this.deactivateNew(target);
        }
    });

    
    // /////////////////////////////// OLD ////////////////////////////////////////////////////////
    
    
    /*
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
    });*/
    
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
    
    /*
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
    
    List.TodolistsView_TABLE = Marionette.CompositeView.extend({
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
    */

});
