
var EReferenceConnection = Ds.Connection.extend({
    figure: {
        stroke: 'black',
        'stroke-width': 2
    },
    end: {
        type: 'basic'
    },
    labels: [
        { text: 'property', position: 'end' }
    ],
    initialize: function(attributes) {
        if (attributes.model) {
            this.model = attributes.model;
            this.labels[0].set('text', this.model.get('name'));
        }
    }
});

var ESuperTypesConnection = Ds.Connection.extend({
    figure: {
        stroke: 'black',
        'stroke-width': 2
    },
    end: {
        fill: 'white',
        type: 'basic'
    }
});

