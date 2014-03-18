CosinnusApp.module('TodosApp.List', function(List, CosinnusApp, Backbone, Marionette, $, _) {

    List.Controller = {
        listTodos: function(todolist) {
            
            console.log(">> called listTodos function");


            // Option without defer: Fetch the models now
//            var todos = new CosinnusApp.TodosApp.Entities.Todos();
//            todos.fetch();
            
//            var todolists = new CosinnusApp.TodosApp.Entities.Todolists(
//                [{id:'-1', slug:'-1', title:'[ALL TODOS]'},
//                 {id:'_start', slug:'_start',title:'[All unlisted Todos]'},
//                 {id:'1', slug:'todolist1', title:'List1'}])
            
            // get todolists, they will update themselves when done fetching
            
            // debug stuff
//            console.log(">> fetching debug list1...");
//            var fetchlist = CosinnusApp.request('todos:todolist', 'todolist1');
//            $.when(fetchlist).done(function(list){
//                console.log(">> received fetched list1: " + JSON.stringify(list))
//            });
            

            var fetchingTodos = CosinnusApp.request('todos:entities', todolist);

//            var layout = new List.Layout();
//            var topView = new List.TopView();

            var todolists = new CosinnusApp.TodosApp.Entities.Todolists();
            todolists.fetch();

            var listLayout = new CosinnusApp.Common.Lists.ListsItemsLayout();
            
            $.when(fetchingTodos).done(function(todos){

                console.log('now done fetching todos: ' + JSON.stringify(todos));

                /*
                var todosListView_OLD = new List.TodosView({
                    collection: todos
                });

                layout.on('show', function() {
                    layout.topRegion.show(topView);
                    layout.todolistListRegion.show(todolistsListView);
                    layout.listRegion.show(todosListView_OLD);
                });
                */


                // CREATE THE VIEWS
                var todolistsListView = new List.TodolistsView({
                    collection: todolists
                });
                var todolistsNewView = new List.TodolistsNewView();

                var todosListView = new List.TodosListView({
                    collection: todos
                });
                var todosNewView = new List.TodosNewView();

                // ADD THE VIEWS TO THE LAYOUT
                listLayout.on('show', function() {
                    listLayout.listsAllRegion.show(todolistsListView);
                    listLayout.listsNewRegion.show(todolistsNewView);
                    listLayout.itemsAllRegion.show(todosListView);
                    listLayout.itemsNewRegion.show(todosNewView);
                });

                // DISPLAY THE LAYOUT
                CosinnusApp.mainRegion.show(listLayout);

                $("#select2-avatar-item-id").select2({
                    formatResult: CosinnusApp.select2Format,
                    formatSelection: CosinnusApp.select2Format,
                    escapeMarkup: function(m) { return m; }
                });

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
                
                todosListView_OLD.on('itemview:todos:edit', function(childView, model) {
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
                                childView.render();
                            }
                        });
                        
                    });

                    CosinnusApp.dialogRegion.show(view);
                });
                
                
                todosListView.on('itemview:todos:delete', function(childView, model) {
                    
                    console.log("now deleting model with slug " + model.slug)
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
                                childView.render();
                            }
                        });
                        
                    });

                    CosinnusApp.dialogRegion.show(view);
                });
                
                
                todolistsListView.on('itemview:todolist:delete', function(childView, model) {
                    
                    console.log("now deleting model with slug " + model.slug)
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