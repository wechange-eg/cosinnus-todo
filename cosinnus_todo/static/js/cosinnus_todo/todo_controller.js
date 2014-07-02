CosinnusApp.module('TodosApp.List', function(List, CosinnusApp, Backbone, Marionette, $, _) {

    List.Controller = {

        // Models
        todolists: null,
        todos: null,
        groupUsers: null,

        // Views
        todolistsListView: null,
        todosListView: null,
        
        listTodos: function(todolist) {
            
            $this = this;
            
            if ($this.todolists == null) {
                $this.todolists = new CosinnusApp.TodosApp.Entities.Todolists();
            }
            // we're getting this list blocking if we need to get a todolist id
            // or if the list we're accessing isn't synced yet
            var is_async = (todolist != null) && CosinnusApp.TodosApp.List.Controller.todolists.get(todolist) && CosinnusApp.TodosApp.List.Controller.todolists.get(todolist).get('slug') != '';
            $this.todolists.fetch({async: is_async});

            var list_supplied = todolist != null;
            if (list_supplied == false) {
                // select initial todolist to display as first created list (if no list specified)
                var initialTodolist = $this.todolists.at(0);
                if (initialTodolist != null) {
                    todolist = initialTodolist.get("id");
                }
            }
            // re-set page url to correct todolist if we just refetched the todolist list, or we landed on index
            if (list_supplied == false || is_async == false) {
                var list_slug = '';
                // search for slug so we can set the correct url
                if (CosinnusApp.TodosApp.List.Controller.todolists.get(todolist)) {
                    list_slug = CosinnusApp.TodosApp.List.Controller.todolists.get(todolist).get('slug') + '/';
                }
                CosinnusApp.navigate('todo/list/' + list_slug);
            }
            CosinnusApp.TodosApp.currentTodolistId = todolist;
            
            $this.groupUsers = new CosinnusApp.TodosApp.Entities.Users();
            // FIXME: async fetching is very slow
            $this.groupUsers.fetch({async: false});

            var fetchingTodos = CosinnusApp.request('todos:entities', todolist);
            
            var containerLayout = new CosinnusApp.TodosApp.LeftnavLayout();
            var listLayout = new CosinnusApp.TodosApp.MainPageLayout();
            
            // TODO: FIXME: do not reload the views if they still exist!
            // this means that they need to be saved as a variable to the app!
            
            $.when(fetchingTodos).done(function(_todos){
                
                $this.todos = _todos;
                
                // TODO: deactivated for now because something else rerenders this view
                // to death if we only reset the backbone collection instead of reloading
                // all elements. we should investigate this and try to activate it!
                if (false && $this.todolistsListView != null && $this.todosListView != null) {
                    // UPDATE THE VIEWS WITH NEW MODELS
                    console.log("resseting instead of creating" + $this.todolistsListView);
                    console.log(">>" + $this.todolistsListView.collection)
                    $this.todolistsListView.collection.reset($this.todolists);
                    $this.todosListView.collection.reset($this.todos);
                    console.log("showed" + $this.todos + " > " + JSON.stringify($this.todos));
                } else {
                    // CREATE THE VIEWS
                    console.log("Creeating");
                    $this.todolistsListView = new List.TodolistsView({
                        collection: $this.todolists
                    });
                    var todolistsNewView = new List.TodolistsNewView();
    
                    $this.todosListView = new List.TodosListView({
                        collection: $this.todos
                    });
                    var todosNewView = new List.TodosNewView();
    
                    // ADD THE VIEWS TO THE LAYOUT
                    containerLayout.on('show', function() {
                        console.log("showing: " + $this.todolistsListView)
                        containerLayout.listsAllRegion.show($this.todolistsListView);
                        if (CosinnusApp.isUserLoggedIn()) {
                            containerLayout.listsNewRegion.show(todolistsNewView);
                        }
                    });
                    listLayout.on('show', function() {
                        console.log("showing: " + $this.todolistsListView)
                        if (CosinnusApp.TodosApp.currentTodolistId != null) {
                            listLayout.itemsAllRegion.show($this.todosListView);
                            if (CosinnusApp.isUserLoggedIn()) {
                                listLayout.itemsNewRegion.show(todosNewView);
                            }
                        } else {
                            // TODO: *placeholder* for show "no Todolist selected" view!
                        }
                    });
    
                    // DISPLAY THE LAYOUTS
                    CosinnusApp.leftnavRegion.show(containerLayout);
                    CosinnusApp.mainRegion.show(listLayout);
                    
                    
                    key('f2', function(e, handler){
                        console.log('F2 pressed');
                        var lastEditedItem = CosinnusApp.lastEditedItem;
                        if (typeof lastEditedItem !== 'undefined' && lastEditedItem !== null) {
                            console.log('F2 pressed inside ...' + lastEditedItem);
                            lastEditedItem.trigger('click');
                            lastEditedItem.focus();
                        }
                        return false;
                    });
    
                    $('.date-picker-new').datetimepicker(CosinnusApp.datePickerOptions).on(
                        'changeDate',
                        function(e){
                            console.log('new date picked: ' + e.date);
                        }
                    );
                
                }


            });
        }
    }

});