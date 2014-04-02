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
            $this.todolists.fetch({async: todolist != null});
            if (todolist == null) {
                // select initial todolist to display as first created list (if no list specified)
                var initialTodolist = $this.todolists.at(0);
                if (initialTodolist != null) {
                    todolist = initialTodolist.get("id");
                }
            }
            CosinnusApp.TodosApp.currentTodolistId = todolist;
            
            $this.groupUsers = new CosinnusApp.TodosApp.Entities.Users();
            // FIXME: async fetching is very slow
            $this.groupUsers.fetch({async: false});

            var fetchingTodos = CosinnusApp.request('todos:entities', todolist);
            
            var listLayout = new CosinnusApp.TodosApp.MainPageLayout();
            
            // TODO: FIXME: do not reload the views if they still exist!
            // this means that they need to be saved as a variable to the app!
            
            $.when(fetchingTodos).done(function(_todos){
                
                $this.todos = _todos;
                
                // CREATE THE VIEWS
                $this.todolistsListView = new List.TodolistsView({
                    collection: $this.todolists
                });
                var todolistsNewView = new List.TodolistsNewView();

                $this.todosListView = new List.TodosListView({
                    collection: $this.todos
                });
                var todosNewView = new List.TodosNewView();

                // ADD THE VIEWS TO THE LAYOUT
                listLayout.on('show', function() {
                    listLayout.listsAllRegion.show($this.todolistsListView);
                    listLayout.listsNewRegion.show(todolistsNewView);
                    if (CosinnusApp.TodosApp.currentTodolistId != null) {
                        listLayout.itemsAllRegion.show($this.todosListView);
                        listLayout.itemsNewRegion.show(todosNewView);
                    } else {
                        // TODO: *placeholder* for show "no Todolist selected" view!
                    }
                });

                // DISPLAY THE LAYOUT
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


            });
        }
    }

});