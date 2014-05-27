CosinnusApp.module('TodosApp.List', function(List, CosinnusApp, Backbone, Marionette, $, _) {
    
    List.isEditingItemTitle = false;

    List.TodolistView = Marionette.ItemView.extend({
        template: '#lists-item',
        className: 'btn btn-emphasized w100 fine-space',
        
        modelEvents: {
            'change': 'render'
        },

        events: {
            'click': 'listClicked'
//                'click .js-todolist-edit': 'editTodolistClicked',
//                'click .js-todolist-delete': 'deleteTodolistClicked'
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

    List.TodolistsView = Marionette.CollectionView.extend({
        itemView: List.TodolistView,
        collection: null, // supplied at instantiation time
        //className: 'list-group todos-colors clearfix',
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

    List.TodolistsNewView = Marionette.ItemView.extend({
        template: '#lists-new',
        //className: 'list-group-item clearfix js-new-list-item',
        creatingNewList: false,
        newListText: 'Lege eine neue Liste an',

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
            key.setScope(CosinnusApp.TodosApp.keyScopes.newList);
            CosinnusApp.editedItem = target;
            target.html('');
            
            // shortcuts: create new list
            key('enter', CosinnusApp.TodosApp.keyScopes.newList, function(e, handler){
                e.preventDefault();
                e.stopPropagation();
                console.log('Enter pressed (new list)');
                var target = $(e.target);
                $this.createNewList(target);
                target.html(this.newListText);
                return false;
            });

            // shortcuts: cancel creation of a new list
            key('escape', CosinnusApp.TodosApp.keyScopes.newList, function(e, handler){
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
            
            key.unbind('enter', CosinnusApp.TodosApp.keyScopes.newList);
            key.unbind('escape', CosinnusApp.TodosApp.keyScopes.newList);
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
    
    List.TodosItemView = Marionette.ItemView.extend({
        template: '#todos-item',
        className: 'btn btn-emphasized w100 regular-space',
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
            'click .fa-check-square-o': 'markItemIncomplete',
            'click .fa-square-o': 'markItemCompletedMe',
            'click .js-icon-star': 'starClicked'
        },

        itemTitleClicked: function(e) {
            console.log('click: ' + CosinnusApp.isUserLoggedIn());
            if (!CosinnusApp.isUserLoggedIn()) {
                return false;
            }
            
            var target = $(e.target);
            if (List.isEditingItemTitle &&
                (typeof CosinnusApp.editedItem !== 'undefined' || CosinnusApp.editedItem !== null)) {
                // save and deactivate the currently editing item
                if (CosinnusApp.editedView != this) {
                    this.saveItem(CosinnusApp.editedItem, CosinnusApp.editedView);
                    this.deactivateItemTitleEditing(CosinnusApp.editedItem);
                } else {
                    return false;
                }
            }
            this.activateItemTitleEditing(target);
        },

        itemTitleChanged: function(e) {
            console.log('change');
        },

        itemTitleSave: function(e) {
            console.log('save.js clicked');
            var target = $(e.currentTarget).parent().prev();
            this.saveItem(target, this);
            this.deactivateItemTitleEditing(target);
        },

        itemTitleCancel: function(e) {
            console.log('cancel.js clicked');
            var target = $(e.currentTarget);
            var el = target.parent().prev();
            this.cancelClicked(el);
        },
        
        markItemCompletedMe: function(e) {
            if (!CosinnusApp.isUserLoggedIn()) {
                return false;
            }
            e.preventDefault();
            e.stopPropagation();
            console.log("complete clicked");
            this.model.completedMe();
        },
        
        markItemIncomplete: function(e) {
            if (!CosinnusApp.isUserLoggedIn()) {
                return false;
            }
            e.preventDefault();
            e.stopPropagation();
            console.log("incomplete clicked");
            this.model.incomplete();
        },

        onRender: function() {
            console.log('onRender');

            var $el = $(this.el);
            var viewModel = this.model;

            // activate avatars
            var avatarEl = $el.find(".select2-avatar-item");
            avatarEl.select2(CosinnusApp.select2Options);
            if (CosinnusApp.isUserLoggedIn()) {
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
            } else {
                avatarEl.select2('disable', true);
            }
            
            // activate date picker
            if (CosinnusApp.isUserLoggedIn()) {
                var datePicker = $el.find('.date-picker');
                datePicker.datetimepicker(CosinnusApp.datePickerOptions);
                datePicker.on('change.dp', this.dateChanged);
            }
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
         * activate ItemTitle editing
         *
         * @param target - jQuery element
         */
        activateItemTitleEditing: function(target) {
            var $this = this;
            console.log('activateItemTitleEditing()');
            List.isEditingItemTitle = true;
            key.setScope('item-title');
            CosinnusApp.editedView = this;
            CosinnusApp.editedItem = target;
            CosinnusApp.editedItemLastValue = target.html();
            var titleButtonsEl = this.getTitleButtonsElement(target);
            
            key('enter', 'item-title', function(e, handler){
                // TODO: this function is called 3x times !!! Performance kill!
                console.log('Enter pressed');
                var target = $(e.target);
                $this.saveItem(target, $this);
                $this.deactivateItemTitleEditing(target);
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
         * deactivate ItemTitle editing
         *
         * @param target - jQuery element
         */
        deactivateItemTitleEditing: function(target) {
            console.log('deactivateItemTitleEditing()');
            key.setScope('all');
            CosinnusApp.lastEditedItem = CosinnusApp.editedItem;
            CosinnusApp.editedItem = null;
            CosinnusApp.editedItemLastValue = null;
            CosinnusApp.editedView = null;
            List.isEditingItemTitle = false;
            var titleButtonsEl = this.getTitleButtonsElement(target);
            titleButtonsEl.hide();

            key.unbind('enter', 'item-title');
            key.unbind('escape', 'item-title');
        },

        /**
         * Saves an item
         * @param target - jQuery input element
         * @param view - Marionette View
         */
        saveItem: function(target, view) {
            var itemTitle = target.html();
            console.log('saveItem: ' + itemTitle);

            view.model.set("title", itemTitle);
            view.model.save();
            
            key.setScope('all');
            view.getTitleButtonsElement(target).hide();
        },

        /**
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
            if (!CosinnusApp.isUserLoggedIn()) {
                return false;
            }
            var target = $(e.target);
            var priority = target.data('priority');
            var nextPriority;
            if (priority == 1) {
                target.removeClass('fa-star-o').addClass('fa-star-half-o');
                nextPriority = priority + 1;
            } else if (priority == 2) {
                target.removeClass('fa-star-half-o').addClass('fa-star');
                nextPriority = priority + 1;
            } else {
                target.removeClass('fa-star').addClass('fa-star-o');
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
        //className: 'list-group items-all-container todos-all-container todos-colors',
        modelEvents: {
            'change': 'render'
        },

        initialize: function() {
            this.listenTo(this.collection, "reset", function(){
                this.appendHtml = function(collectionView, itemView, index){
                  collectionView.$el.append(itemView.el);
                }
            });
        },

        onCompositeCollectionRendered: function(){
          this.appendHtml = function(collectionView, itemView, index){
            collectionView.$el.prepend(itemView.el);
          }
        }
    });

    List.TodosNewView = Marionette.ItemView.extend({
        template: '#todos-new',
        newTitleText: 'Lege eine neue Aufgabe an',
        creatingNew: false,
        className: 'btn btn-default w100',
        tagName: 'div',

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
            List.Controller.todos.add(todo);
            // artificially count up the todolist's count (will be re-synced during next sync)
            todolist.set("item_count", todolist.get("item_count")+1);

            // flash the last (added) view
            flashView(List.Controller.todosListView.children.last().$el);
        },

        cancelCreatingNew: function(target) {
            console.log('Canceled creating new');
            this.deactivateNew(target);
        }
    });


});
