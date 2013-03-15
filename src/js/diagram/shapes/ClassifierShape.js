var ClassifierLabel = {

    figure: {
        type: 'text',
        'font-size': 14,
        'font-weight': 'bold',
        height: 30
    },

    gridData: {
        horizontalAlignment: 'center',
        grabExcessHorizontalSpace: true
    }

};

var ClassifierShape = Ds.Shape.extend({

    figure: {
        type: 'rect',
        width: 160,
        height: 100,
        fill: '235-#F9F9D8-#FFFFFF',
        opacity: 1,
        stroke: '#D8D8D1',
        'stroke-width': 2,
        'stroke-opacity': 1
    },

    layout: {
        type: 'grid',
        columns: 1,
        hgap: 0,
        vgap: 0,
        marginHeight: 0,
        marginWidth: 0
    }

});
