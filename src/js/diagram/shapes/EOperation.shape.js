
var EOperationShape = Ds.Label.extend({
    resizable: false,
    draggable: false,

    figure: {
        type: 'text',
        text: 'op(): EString',
        height: 20,
        stroke: 'blue',
        position: 'center-left'
    }
});

var EOperationCompartment = {
    compartment: true,

    figure: {
        type: 'rect',
        height: 20,
        fill: 'none',
        stroke: 'none',
        'stroke-width': 2
    },

    layout: {
        type: 'flex',
        columns: 1,
        stretch: false
    },

    accepts: [ EOperationShape ]
};

