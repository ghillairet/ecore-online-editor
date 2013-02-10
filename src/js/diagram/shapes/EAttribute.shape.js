
var EAttributeShape = Ds.Label.extend({
    resizable: false,
    draggable: false,

    figure: {
        type: 'text',
        text: 'name: EString',
        height: 20,
        stroke: 'blue',
        position: 'center-left'
    },

    initialize: function(attributes) {
        if (attributes.model) {
            this.model = attributes.model;
        } else {
            this.model = Ecore.EAttribute.create({ name: 'name', eType: Ecore.EString });
        }

        var text = this.model.get('name') + ' : ' + this.model.get('eType').get('name');
        this.setText(text);
    }
});

var EAttributeCompartment = {
    compartment: true,

    figure: {
        type: 'rect',
        height: 20,
        fill: 'none',
        stroke: '#D8D8D1',
        'stroke-width': 2
    },

    layout: {
        type: 'flex',
        columns: 1,
        stretch: false
    },

    accepts: [ EAttributeShape ]
};

