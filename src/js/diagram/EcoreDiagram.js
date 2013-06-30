
var layout = function() {
    var current = { x: 0, y: 100 };
    return function() {
        var ws = 10, we = 800,
            pad = 150;

        if (we > (current.x + pad)) {
            current.x = current.x + pad;
            current.y = current.y;
        } else {
            current.x = ws;
            current.y = current.y + pad;
        }
        return current;
    };
};

var EcoreDiagram = DG.Diagram.extend({
    initialize: function(attributes) {
        var attrs = attributes || {};
        this.layout = layout();
        if (attrs.model) {
            this.model = attrs.model;
            this.createContent();
        }
        this.wrapper.on('click', this.addFromPalette(this));
    },
    addFromPalette: function(diagram) {
        return function(e) {
            var palette = Workbench.palette;
            var selected = palette.selected;
            var shape, options;

            if (selected && typeof selected.shape === 'function') {
                options = DG.Point.get(e);
                options.diagram = diagram;
                shape = new selected.shape(options);
                diagram.add(shape);
                diagram.render();
                palette.selected = null;
            }
        };
    },
    createContent: function() {
        this.model.get('eClassifiers').each(function(c) {
            if (c.isTypeOf('EClass')) {
                var position = this.layout();
                var shape = new EClassShape({ diagram: this, model: c, x: position.x, y: position.y });
                this.add(shape);
            }
        }, this);
    }
});

