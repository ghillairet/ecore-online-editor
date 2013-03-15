var FeatureShape = Ds.Label.extend({
    resizable: false,
    draggable: false,
    selectable: false,

    figure: {
        type: 'text',
        position: 'left'
    },

    gridData: {
        horizontalAlignment: 'beginning',
        verticalAlignment: 'center',
        grabExcessHorizontalSpace: true
    }

});

var FeatureCompartment = Ds.Shape.extend({
    draggable: false,
    selectable: false,
    resizable: false,

    figure: {
        type: 'rect',
        height: 20,
        width: 100,
        fill: '235-#F9F9D8-#FFFFFF',
        'fill-opacity': 0,
        stroke: '#D8D8D1',
        'stroke-width': 2
    },

    layout: {
        type: 'grid',
        marginHeight: 8,
        marginWidth: 8,
        vgap: 8,
        columns: 1
    },

    gridData: {
        horizontalAlignment: 'fill',
        verticalAlignment: 'fill',
        grabExcessHorizontalSpace: true
    }
});

