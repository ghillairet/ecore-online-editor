
var EClassLabel = {
    figure: {
        type: 'text',
        text: 'EClass',
        height: 30,
        width: 30,
        'font-size': 14
    },

    gridData: {
        horizontalAlignment: 'center',
        grabExcessHorizontalSpace: true
    }

};

var EClassShape = Ds.Shape.extend({
    figure: {
        type: 'rect',
        width: 160,
        height: 100,
        fill: '235-#F9F9D8-#FFFFFF',
        opacity: 1,
        stroke: '#D8D8D1',
        'stroke-width': 2,
        'stroke-opacity': 1
    },

    layout: {
        type: 'grid',
        columns: 1,
        hgap: 0,
        vgap: 0,
        marginHeight: 0,
        marginWidth: 0
    },

    children: [
        EClassLabel,
        EAttributeCompartment,
        EOperationCompartment
    ],

    initialize: function(attributes) {
        if (!this.diagram) return; // dummies
        if (attributes.model) {
            this.model = attributes.model;
            this.model.shape = this;
            this.createContent();
        } else {
            this.model = Ecore.EClass.create({ name: 'MyClass' });
            this.model.shape = this;
            this.diagram.model.get('eClassifiers').add(this.model);
        }

        this.children[0].setText(this.model.get('name'));
        this.on('click', this.toFront);
        this.on('mousedown', this.doConnect);
    },

    doConnect: function(e) {
        var palette = Workbench.palette;
        var selected = palette.selected;
        if (selected && selected.connection) {
            this.dragConnection(e, selected.connection);
            this.on('connect:source', function() { palette.selected = null; });
        }
    },

    createContent: function() {
        _.each(this.model.get('eAttributes'), function(a) {
            var shape = this.diagram.createShape(EAttributeShape, { model: a });
            this.children[1].add(shape);
        }, this);

        this.model.get('eOperations').each(function(o) {
            var shape = this.diagram.createShape(EOperationShape, { model: o });
            this.children[2].add(shape);
        }, this);
    }

});

