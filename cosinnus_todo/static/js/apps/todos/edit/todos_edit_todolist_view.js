CosinnusApp.module('TodosApp.Edit', function(Edit, CosinnusApp, Backbone, Marionette, $, _) {
    
    Edit.TodolistView = CosinnusApp.TodosApp.Common.Views.TodolistEditForm.extend({
        initialize: function () {
            this.title = "Edit " + this.model.get("title");
        },

        onRender: function () {
            if (this.options.generateTitle) {
                var $title = $('<h1>', { text: this.title });
                this.$el.prepend($title);
            }

            this.$(".js-submit").text("Update Todolist");
        }
    });
    
});
