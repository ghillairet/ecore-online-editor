
var EOperationShape = Ds.Label.extend({
    resizable: false,
    draggable: false,

    figure: {
        type: 'text',
        text: 'op(): EString',
        height: 20,
        width: 100,
        stroke: 'blue',
        position: 'left'
    },

    gridData: {
        horizontalAlignment: 'beginning',
        verticalAlignment: 'center',
        grabExcessHorizontalSpace: true
    },

    initialize: function(attributes) {
        if (attributes.model) {
            this.model = attributes.model;
        } else {
            this.model = Ecore.EOperation.create({ name: 'name', eType: Ecore.EString });
        }

        var type = this.model.get('eType');
        type = type ? type.get('name') : '';
        var text = this.model.get('name') + '(): ' + type;
        this.setText(text);
    }
});

var EOperationCompartment = Ds.Shape.extend({
    draggable: false,
    selectable: false,
    resizable: false,

    figure: {
        type: 'rect',
        height: 20,
        width: 100,
        fill: 'white',
        'fill-opacity': 0,
        stroke: 'none',
        'stroke-width': 2
    },

    layout: {
        type: 'grid',
        columns: 1
    },

    gridData: {
        grabExcessHorizontalSpace: true,
        grabExcessVerticalSpace: true,
        verticalAlignment: 'fill',
        horizontalAlignment: 'fill'
    },

    accepts: [ EOperationShape ],

    initialize: function() {
        this.on('click', this.addElement);
        this.on('mouseover', this.handleMouseOver);
        this.on('mouseout', this.handleMouseOut);
    },

    handleMouseOut: function() {
        this.set('cursor', 'default');
    },

    handleMouseOver: function(e) {
        var palette = Workbench.palette;
        var selected = palette.selected;
        var fnShape;

        if (selected) {
            fnShape = selected.shape;
            if (this.canAdd(fnShape)) {
                this.set('cursor', 'copy');
            } else {
                this.set('cursor', 'no-drop');
            }
        }
    },

    addElement: function(e) {
        var palette = Workbench.palette;
        var selected = palette.selected;
        if (selected) {
            if (this.canAdd(selected.shape)) {
                var shape = new selected.shape({});
                this.add(shape);
                this.parent.render();
                palette.selected = null;
            }
        }
    }

});

