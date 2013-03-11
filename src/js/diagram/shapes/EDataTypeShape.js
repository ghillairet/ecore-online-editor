

var EDataTypeLabel = {
    figure: {
        type: 'text',
        text: 'EDataType',
        height: 30,
        'font-size': 14
    }
};

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
    }

});

var EDataTypeShape = Ds.Shape.extend({
    figure: {
        type: 'rect',
        width: 100,
        height: 30,
        fill: '235-#F9F9D8-#FFFFFF',
        opacity: 1,
        stroke: '#D8D8D1',
        'stroke-width': 2,
        'stroke-opacity': 1
    },

    layout: {
        type: 'grid',
        columns: 1
    },

    children: [
        EDataTypeLabel,
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
    }
});
