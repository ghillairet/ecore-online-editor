var CompartmentFigure = {
    type: 'rect',
    width: 100,
    height: 20,
    fill: '#fff',
    stroke: '#86A4D0',
    'stroke-width': 1
};

var FeatureCompartment = DG.Shape.extend({
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
        this.on('click', this.addFeature);
    },

    createFigure: function() {
        return DG.Figure.create(this, CompartmentFigure);
    },

    addFeature: function() {
        var palette = Workbench.palette;
        var selected = palette.selected;
        var shape, options;

        if (selected && selected.title === 'EAttribute') {
            shape = new selected.shape();
            this.add(shape);
            this.diagram().render();
            palette.selected = null;
        }
    }
});

var OperationCompartment = DG.Shape.extend({
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
            grabExcessHorizontalSpace: true,
            grabExcessVerticalSpace: true
        });
        */
        this.on('click', this.addFeature);
    },
    createFigure: function() {
        return DG.Figure.create(this, CompartmentFigure);
    },
    addFeature: function() {
        var palette = Workbench.palette;
        var selected = palette.selected;
        var shape, options;

        if (selected && selected.title === 'EOperation') {
            shape = new selected.shape();
            this.add(shape);
            this.diagram().render();
            palette.selected = null;
        }
    }
});

