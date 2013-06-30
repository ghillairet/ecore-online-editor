var ClassifierLabel = {
    type: 'text',
    text: '',
    'font-size': 14,
    'font-weight': 'bold',
    height: 30
};

var ClassifierShape = {
    type: 'rect',
    width: 100,
    height: 60,
//    fill: '235-#F9F9D8-#FFFFFF',
    fill: '#D3DAEE',
    opacity: 1,
    stroke: '#86A4D0',
    'stroke-width': 1,
    'stroke-opacity': 0.8
};

var ClassifierLayout = {
    type: 'grid',
    columns: 1
};

var ClassLabelShape = DG.Label.extend({
    config: {
        draggable: false,
        resizable: false,
        selectable: false,
        editable: true
    },
    createFigure: function() {
        return DG.Figure.create(this, ClassifierLabel);
    }
});

var ClassLabelCompartment = DG.Shape.extend({
    config: {},
    initialize: function() {
        this.layout = new DG.GridLayout(this, {
            columns: 1,
            vgap: 5,
            hgap: 5,
            marginHeight: 5,
            marginWidth: 5
        });
        /*
        this.gridData = new DG.GridData({
            horizontalAlignment: 'fill',
            grabExcessHorizontalSpace: true
        });
        */
    },
    createFigure: function() {
        return DG.Figure.create(this, _.extend({}, CompartmentFigure, { fill: 'none' }));
    }
});
