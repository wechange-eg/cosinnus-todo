CosinnusApp.module('TodosApp.List', function(List, CosinnusApp, Backbone, Marionette, $, _) {

    List.Controller = {
        listTodos: function(todolist) {
            
            console.log(">> called listTodos function")

            var fetchingTodos = CosinnusApp.request('todos:entities', todolist);
            
            var layout = new List.Layout();
            var topView = new List.TopView();
            
            // Option without defer: Fetch the models now
//            var todos = new CosinnusApp.Entities.Todos();
//            todos.fetch();
            
//            var todolists = new CosinnusApp.Entities.Todolists(
//                [{id:'-1', slug:'-1', title:'[ALL TODOS]'},
//                 {id:'_start', slug:'_start',title:'[All unlisted Todos]'},
//                 {id:'1', slug:'todolist1', title:'List1'}])
            
            // get todolists, they will update themselves when done fetching
            var todolists = new CosinnusApp.Entities.Todolists()
            todolists.fetch();
            
            $.when(fetchingTodos).done(function(todos){

                console.log('not done fetching todos: ' + JSON.stringify(todos));

                var todosListView = new List.TodosView({
                    collection: todos
                });
                var todolistsListView = new List.TodolistsView({
                    // fixme sascha here: need data!
                    collection: todolists
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