
var EDataTypeCompartment = Ds.Shape.extend({
    draggable: false,
    selectable: false,
    resizable: false,

    figure: {
        type: 'rect',
        height: 20,
        fill: 'white',
        'fill-opacity': 0,
        stroke: '#D8D8D1',
        'stroke-width': 2
    },

    gridData: {
        horizontalAlignment: 'fill',
        verticalAlignment: 'fill',
        grabExcessHorizontalSpace: true
    }

});

var EDataTypeShape = ClassifierShape.extend({

    children: [
        ClassifierLabel,
        EDataTypeCompartment
    ],

    initialize: function(attributes) {
        if (!this.diagram) return; // dummies

        if (attributes.model) {
            this.model = attributes.model;
        } else {
            this.model = Ecore.EDataType.create({ name: 'EDataType' });
            this.diagram.model.get('eClassifiers').add(this.model);
        }
        this.children[0].setText(this.model.get('name'));
    }
});
