
var EClassShape = DG.Shape.extend({

    anchors: [
        { position: 'n', connectionType: ESuperTypesConnection },
        { position: 'e', connectionType: EReferenceConnection }
    ],

    initialize: function(attributes) {
        var attrs = attributes || {};
        var diagram = attrs.diagram;

        if (attrs.model) {
            this.model = attributes.model;
            this.model.shape = this;
        } else {
            this.model = Ecore.EClass.create({ name: 'MyClass' });
            this.model.shape = this;
            diagram.model.get('eClassifiers').add(this.model);
        }

        this.layout = new DG.GridLayout(this, {
            columns: 1
        });
        this.add(new ClassLabelCompartment());
        this.add(new FeatureCompartment());
        this.add(new OperationCompartment());

        this.children[0].gridData = new DG.GridData({
            horizontalAlignment: 'fill',
            grabExcessHorizontalSpace: true
        });
        this.children[1].gridData = new DG.GridData({
            horizontalAlignment: 'fill',
            grabExcessHorizontalSpace: true
        });
        this.children[2].gridData = new DG.GridData({
            horizontalAlignment: 'fill',
            grabExcessHorizontalSpace: true,
            grabExcessVerticalSpace: true
        });
        this.children[0].add(new ClassLabelShape({
            text: this.model.get('name')
        }));
        this.createContent(diagram);
    },

    createFigure: function() {
        return DG.Figure.create(this, {
            type: 'rect',
            width: 100,
            height: 60,
            fill: '#D3DAEE',
            cursor: 'move',
            stroke: '#86A4D0',
            'stroke-width': 1
        });
    },

    /*
    doConnect: function(e) {
        var palette = Workbench.palette;
        var selected = palette.selected;

        if (selected && selected.connection) {
            this.dragConnection(e, selected.connection);
            this.on('connect:source', function() { palette.selected = null; });
        }
    },
    */

    createContent: function(diagram) {
        _.each(this.model.get('eAttributes'), function(attr) {
            this.children[1].add(new EAttributeShape({ model: attr }));
        }, this);
/*
        this.model.get('eOperations').each(function(o) {
            this.children[2].add(new EOperationShape({ model: o }));
        }, this);
*/
    }

});

