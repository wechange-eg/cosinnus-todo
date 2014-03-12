CosinnusApp.module('TodosApp.List', function(List, CosinnusApp, Backbone, Marionette, $, _) {

    List.Controller = {
        listTodos: function(todolist) {
            
            console.log(">> called listTodos function")

            var fetchingTodos = CosinnusApp.request('todos:entities', todolist);
            
            var layout = new List.Layout();
            var topView = new List.TopView();
            
            // Option without defer: Fetch the models now
//            var todos = new CosinnusApp.TodosApp.Entities.Todos();
//            todos.fetch();
            
            var todolists = new CosinnusApp.TodosApp.Entities.Todolists()
            todolists.fetch();
            
            $.when(fetchingTodos).done(function(todos){

                console.log('>> Now done fetching list of todos. ');

                var todosListView = new List.TodosView({
                    collection: todos
                });
                var todolistsListView = new List.TodolistsView({
                    collection: todolists
                });

                layout.on('show', function() {
                    layout.topRegion.show(topView);
                    layout.todolistListRegion.show(todolistsListView);
                    layout.listRegion.show(todosListView);
                });
                
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

                CosinnusApp.mainRegion.show(layout);
            });
        }
    }

});