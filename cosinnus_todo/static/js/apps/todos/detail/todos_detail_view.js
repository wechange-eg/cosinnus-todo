CosinnusApp.module('TodosApp.Detail', function(Detail, CosinnusApp, Backbone, Marionette, $, _) {

    Detail.TodoView = Marionette.ItemView.extend({
        template: '#todos-detail'
    });

    Detail.MissingTodoView = Marionette.ItemView.extend({
        template: '#todos-detail-missing'
    });

});
