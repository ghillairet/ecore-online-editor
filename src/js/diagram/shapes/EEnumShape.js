
// EEnumLabel

var EEnumLabel = {
    figure: {
        type: 'text',
        text: 'EEnum',
        height: 40,
        'font-size': 14
    }
};

// EEnumLiteralShape

var EEnumLiteralShape = Ds.Label.extend({
    resizable: false,
    draggable: false,

    figure: {
        type: 'text',
        text: 'name: EString',
        height: 20,
        stroke: 'blue',
        position: 'center-left'
    }
});

var EEnumCompartment = Ds.Shape.extend({
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

    layout: {
        type: 'grid',
        hgap: 5,
        vgap: 5,
        columns: 1
    },

    accepts: [
        EEnumLiteralShape
    ]

});


// EEnumShape

var EEnumShape = Ds.Shape.extend({
    figure: {
        type: 'rect',
        width: 100,
        height: 50,
        fill: '235-#F9F9D8-#FFFFFF',
        opacity: 1,
        stroke: '#D8D8D1',
        'stroke-width': 2,
        'stroke-opacity': 1
    },

    layout: {
        type: 'flex',
        columns: 1,
        stretch: true
    },

    children: [
        EEnumLabel,
        EEnumCompartment
    ],

    initialize: function(attributes) {
        if (!this.diagram) return; // dummies

        if (attributes.model) {
            this.model = attributes.model;
        } else {
            this.model = Ecore.EEnum.create({ name: 'EEnum' });
            this.diagram.model.get('eClassifiers').add(this.model);
        }
    }
});

