var TodoApp = new Marionette.Application();

TodoApp.addRegions({
    mainRegion: "#main-region",
    dialogRegion: Marionette.Region.Dialog.extend({
        el: "#dialog-region"
    })
});

TodoApp.navigate = function (route, options) {
    options || (options = {});
    Backbone.history.navigate(route, options);
};

TodoApp.getCurrentRoute = function () {
    return Backbone.history.fragment
};

TodoApp.on("initialize:after", function () {
    if (Backbone.history) {
        Backbone.history.start();

        if (this.getCurrentRoute() === "") {
            // ContactManager.trigger("contacts:list");
        }
    }
});
