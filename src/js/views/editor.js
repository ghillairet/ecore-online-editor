
var DiagramPanelPart = Ecore.Edit.PanelPart.extend({
    tmpl: _.template('<div id="diagram-<%= id %>" style="width: 100%; height: 100%;"></div>'),
    initialize: function(attributes) {
//            model: this.model.get('contents').first()
    },
    renderContent: function() {
        if (!this.$diagram) {
            this.$diagram = $(this.tmpl({ id: this.cid }));
            this.$content.append(this.$diagram);
        }
        if (!this.diagram) {
            this.diagram = new EcoreDiagram(this.$diagram[0], {
                model: this.model.get('contents').first()
            });
        }
    }
});

var MultiPartEditor = Ecore.Edit.MultiPanelElement.extend({
    initialize: function(attributes) {
        this.title = Ecore.Edit.util.lastSegment(this.model.get('uri'));
        this.tab = new Ecore.Edit.TabDropdown({ title: this.title, editor: this });
        var part1 = new Ecore.Edit.TreePanelPart({ model: this.model });
        var part2 = new DiagramPanelPart({ model: this.model });
        this.tab.addDropItem('Tree Editor', part1.cid);
        this.tab.addDropItem('Diagram Editor', part2.cid, function() {
            part2.diagram.render();
        });
        var me = this.tab;
        this.tab.addDropItem('Close', function() { me.remove(); });
        this.parts = [part1, part2];
        this.tab.on('remove', this.remove, this);
        this.parts[0].tree.on('select', function(m) { this.trigger('select', m); }, this);
        this.parts[0].tree.on('deselect', function(m) { this.trigger('deselect', m); }, this);
    }
});

var EcoreTabPanel = Ecore.Edit.TabPanel.extend({
    el: '#main',

    open: function(model, diagram) {
        var editor = this.find(model);
        if (!editor) {
            editor = new MultiPartEditor({ model: model });
            this.add(editor);
            editor.on('select', function(m) { this.trigger('select', m); }, this);
            editor.on('deselect', function(m) { this.trigger('deselect', m); }, this);
            editor.render();
        }
        this.show(editor);
        if (editor.diagram) editor.diagram.render();
    },

    find: function(model) {
        return _.find(this.elements, function(element) {
            return element.model === model;
        });
    },

    expand: function() {
        this.$el[0].style.left = '20px';
    }

});

