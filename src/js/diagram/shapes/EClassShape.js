
var EClassShape = ClassifierShape.extend({

    children: [
        ClassifierLabel,
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

