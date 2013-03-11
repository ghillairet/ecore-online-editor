
var EcoreDiagramEditor = Ecore.Edit.TabEditor.extend({
    tmpl: _.template('<div id="diagram-<%= id %>" style="width: 100%; height: 100%;"></div>'),

    initialize: function(attributes) {
        _.bindAll(this);
        this.title = this.getTitle() + '.diagram';
        Ecore.Edit.TabEditor.prototype.initialize.apply(this, [attributes]);

        this.diagram = new EcoreDiagram({ model: this.model.get('contents').first() });
    },
    renderContent: function() {
        if (!this.$diagram) {
            this.$diagram = $(this.tmpl({ id: this.cid }));
            this.$content.append(this.$diagram);
            this.diagram.setElement(this.$diagram[0]);
        }
    },
    show: function() {
        return Ecore.Edit.TabEditor.prototype.show.apply(this);
    }
});

var EcoreTreeEditor = Ecore.Edit.TreeTabEditor.extend({
    editElement: function() {
        Workbench.properties.model = this.tree.selected.model;
        Workbench.properties.render();
    }
});

var EcoreTabPanel = Ecore.Edit.TabPanel.extend({
    el: '#main',

    open: function(model, diagram) {
        var editor = this.find(model, diagram);
        if (!editor) {
            if (diagram)
                editor = new EcoreDiagramEditor({ model: model });
            else
                editor = new EcoreTreeEditor({ model: model });
            this.add(editor);
            editor.render();
        }
        editor.show();

        if (diagram) editor.diagram.render();
    },

    find: function(model, diagram) {
        return _.find(this.editors, function(editor) {
            if (editor.model === model) {
                if (diagram) {
                    return typeof editor.diagram === 'object';
                } else {
                    return typeof editor.diagram !== 'object';
                }
            }
            else return false;
        });
    },

    expand: function() {
        this.$el[0].style.left = '20px';
    }

});
