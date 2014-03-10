CosinnusApp.module('TodosApp.List', function(List, CosinnusApp, Backbone, Marionette, $, _) {

    List.Controller = {
        listTodos: function(todolist) {

            var fetchingTodos = CosinnusApp.request('todos:entities', todolist);

            var layout = new List.Layout();
            var topView = new List.TopView();

            $.when(fetchingTodos).done(function(todos){

                console.log('done fetching todos: ' + JSON.stringify(todos));

                var todosListView = new List.TodosView({
                    collection: todos
                });
                var todolistsListView = new List.TodolistsView({
                    // fixme sascha here: need data!
                    collection: new CosinnusApp.Entities.Todolists(
                            [{id:'-1', slug:'-1', title:'[ALL TODOS]'},
                             {id:'_start', slug:'_start',title:'[All unlisted Todos]'},
                             {id:'1', slug:'todolist1', title:'List1'}])
                });

                layout.on('show', function() {
                    layout.topRegion.show(topView);
                    layout.todolistListRegion.show(todolistsListView);
                    layout.listRegion.show(todosListView);
                });

                topView.on('todos:new', function() {
                    console.log('todos:new start ...');
                    var newTodo = new CosinnusApp.Entities.Todo();

                    var view = new CosinnusApp.TodosApp.New.TodoView({
                        model: newTodo
                    });

                    view.on('form:submit', function (data) {
                        /*
                        if (todos.length > 0) {
                            var highestId = todos.max(function(c){return c.id;}).get('id');
                            data.id = highestId + 1;
                        } else {
                            data.id = 1;
                        }
                        */

                        // data.created_date = Date.now();

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
                            // newTodo.set(data);
                            // todos.add(createdTodo);
                            // todosListView.children.findByModel(newTodo).flash("success");
                        } 
                    });

                    CosinnusApp.dialogRegion.show(view);
                });
                
                // superfluous
//                todosListView.on('itemview:todos:detail', function(childView, model) {
//                    CosinnusApp.trigger('todos:detail', model.get('id'));
//                });

                todosListView.on('itemview:todos:edit', function(childView, model) {
                    var view = new CosinnusApp.TodosApp.Edit.TodoView({
                        model: model
                    });

                    view.on('form:submit', function(data) {
                        
                        model.save(data, {
                            wait: true,
                            error: function(obj, response) {
                                console.log('error updating: '+ JSON.parse(response.responseText));
                                view.triggerMethod("form:data:invalid", JSON.parse(response.responseText));
                            },
                            success: function(obj, response) {
                                console.log('successData = ' + JSON.stringify(response));
                                view.trigger("dialog:close");
                            }
                        });
                        
//                        if (model.save(data)) {
//                            childView.render();
//                            view.trigger("dialog:close");
//                            childView.flash("success");
//                        }
//                        else {
//                            view.triggerMethod("form:data:invalid", model.validationError);
//                        }
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

                CosinnusApp.mainRegion.show(layout);
            });
        }
    }

});