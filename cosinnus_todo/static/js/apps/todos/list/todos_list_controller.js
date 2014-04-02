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
            console.log(">> called listTodos function");
            
            
            //var layout = new List.Layout();
            //var topView = new List.TopView();
            
            // Option without defer: Fetch the models now
//            var todos = new CosinnusApp.TodosApp.Entities.Todos();
//            todos.fetch();
            
            
            
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
            // FIXME: check async fetching
            $this.groupUsers.fetch({async: false});

            var fetchingTodos = CosinnusApp.request('todos:entities', todolist);
            
            var listLayout = new CosinnusApp.Common.Lists.ListsItemsLayout();
            
            // TODO: FIXME: do not reload the views if they still exist!
            // this means that they need to be saved as a variable to the app!
            
            $.when(fetchingTodos).done(function(_todos){
                
                $this.todos = _todos;
                
                console.log('>> Now done fetching list of todos. ');

                /*
                var todosListView = new List.TodosView({
                    collection: todos
                });

                layout.on('show', function() {
                    layout.topRegion.show(topView);
                    layout.todolistListRegion.show(todolistsListView);
                    layout.listRegion.show(todosListView);
                });
                */


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
                        // TODO: show "no Todolist selected" view!
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