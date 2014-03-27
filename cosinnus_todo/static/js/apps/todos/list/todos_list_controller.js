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

                $('.date-picker-new').datetimepicker(CosinnusApp.datePickerOptions).on(
                    'changeDate',
                    function(e){
                        console.log('new date picked: ' + e.date);
                    }
                );

                /*
                
                topView.on('todos:new-todolist', function() {
                    console.log('todolist:new list start ...');
                    var newTodolist = new CosinnusApp.TodosApp.Entities.Todolist();

                    var view = new CosinnusApp.TodosApp.New.TodolistView({
                        model: newTodolist
                    }); 
                    
                    view.on('form:submit', function (data) {
                        console.log('  create: ' + JSON.stringify(data));
                        var createdTodolist = todolists.create(data, {
                            wait: true,
                            error: function(obj, response) {
                                console.log('error: '+ response.responseText);
                                view.triggerMethod("form:data:invalid", JSON.parse(response.responseText));
                            },
                            success: function(obj, response) {
                                console.log('successData = ' + response);
                                view.trigger("dialog:close");
                            }
                        });
                        if (createdTodolist) {
                            console.log('  created:' + createdTodolist);
                        } 
                    });

                    CosinnusApp.dialogRegion.show(view);
                });

                topView.on('todos:new', function() {
                    console.log('todos:new start ...');
                    var newTodo = new CosinnusApp.TodosApp.Entities.Todo();

                    var view = new CosinnusApp.TodosApp.New.TodoView({
                        model: newTodo
                    });
                    
                    view.on('form:submit', function (data) {
                        console.log('  create: ' + JSON.stringify(data));
                        var createdTodo = todos.create(data, {
                            wait: true,
                            error: function(obj, response) {
                                console.log('error: '+ JSON.parse(response.responseText));
                                view.triggerMethod("form:data:invalid", JSON.parse(response.responseText));
                            },
                            success: function(obj, response) {
                                console.log('successData = ' + response);
                                view.trigger("dialog:close");
                            }
                        });
                        if (createdTodo) {
                            console.log('  created:' + createdTodo);
                        } 
                    });

                    CosinnusApp.dialogRegion.show(view);
                });
                
                todosListView.on('itemview:todos:edit', function(childView, model) {
                    var view = new CosinnusApp.TodosApp.Edit.TodoView({
                        model: model
                    });

                    view.on('form:submit', function(data) {
                        
                        model.save(data, {
                            wait: true,
                            error: function(obj, response) {
                                console.log('error updating: '+ response.responseText);
                                view.triggerMethod("form:data:invalid", JSON.parse(response.responseText));
                            },
                            success: function(obj, response) {
                                console.log('successData = ' + JSON.stringify(response));
                                view.trigger("dialog:close");
                            }
                        });
                        
                    });

                    CosinnusApp.dialogRegion.show(view);
                });
                
                
                todosListView.on('itemview:todos:delete', function(childView, model) {
                    
                    model.destroy({
                        error: function(obj, response) {
                            console.log('error deleting: '+ JSON.parse(response.responseText));
                        },
                        success: function(obj, response) {
                            console.log('successsfully deleted! ' + response);
                        }
                    });
                        
                });
                
                todolistsListView.on('itemview:todolist:edit', function(childView, model) {
                    var view = new CosinnusApp.TodosApp.Edit.TodolistView({
                        model: model
                    });

                    view.on('form:submit', function(data) {
                        
                        model.save(data, {
                            wait: true,
                            error: function(obj, response) {
                                console.log('error updating: '+ response.responseText);
                                view.triggerMethod("form:data:invalid", JSON.parse(response.responseText));
                            },
                            success: function(obj, response) {
                                console.log('successData = ' + JSON.stringify(response));
                                view.trigger("dialog:close");
                            }
                        });
                        
                    });

                    CosinnusApp.dialogRegion.show(view);
                });
                
                
                todolistsListView.on('itemview:todolist:delete', function(childView, model) {
                    
                    model.destroy({
                        error: function(obj, response) {
                            console.log('error deleting: '+ JSON.parse(response.responseText));
                        },
                        success: function(obj, response) {
                            console.log('successsfully deleted! ' + response);
                        }
                    });
                        
                });

                */

            });
        }
    }

});