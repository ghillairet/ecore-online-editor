
var EReferenceConnection = DG.Connection.extend({
    attr: {
        stroke: 'black',
        'stroke-width': 1
    },
    end: {
        type: 'basic'
    },
//    labels: [
//        { text: 'property', position: 'end' }
//    ],
    initialize: function(attributes) {
        if (attributes && attributes.model) {
            this.model = attributes.model;
//            this.labels[0].set('text', this.model.get('name'));
        }
    }
});

var ESuperTypesConnection = DG.Connection.extend({
    attr: {
        stroke: 'black',
        'stroke-width': 1
    },
    end: {
        fill: 'white',
        type: 'basic'
    },
    initialize: function(attributes) {

    }
});

