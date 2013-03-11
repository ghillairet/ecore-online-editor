
var PropertyWindow = Ecore.Edit.Window.extend({
    el: '#property-window',
    title: 'Property',
    draggable: true,
    content: new Ecore.Edit.PropertySheet(),
    render: function() {
        this.content.model = this.model;
        return Ecore.Edit.Window.prototype.render.apply(this);
    }
});

