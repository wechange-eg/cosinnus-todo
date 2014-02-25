CosinnusApp.module('TodosApp.New', function(New, CosinnusApp, Backbone, Marionette, $, _) {

    New.TodoView = CosinnusApp.TodosApp.Common.Views.TodoEditForm.extend({
        title: 'New Todo',

        onRender: function() {
            this.$('.js-submit').text('Create Todo');
        }
    });

});
