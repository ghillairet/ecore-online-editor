
var EPackageCompartment = Ds.Shape.extend({
    draggable: false,
    selectable: false,
    resizable: false,

    figure: {
        type: 'rect',
        fill: '270-#B8A8C8-#FFF',
        height: 100,
        stroke: 'grey'
    },

    initialize: function() {
        this.on('click', function() {
            this.parent.select();
        }, this);
    }
});

var EPackageHeadShape = Ds.Shape.extend({
    draggable: false,
    selectable: false,
    resizable: false,

    figure: {
        type: 'rect',
        height: 30,
        fill: 'none',
        stroke: 'none'
    },

    layout: { type: 'xy' },

    children: [
        {
            draggable: false,
            selectable: false,
            resizable: false,

            figure: {
                type: 'rect',
                height: 30,
                width: 80,
                x: 0,
                y: 0,
                stroke: 'grey',
                fill: '#B8A8C8'
            },

            layout: {
                type: 'grid',
                columns: 1,
                marginHeight: 5,
                marginWidth: 5
            },

            children: [
                {
                    figure: {
                        type: 'text',
                        'font-size': 11,
                        text: 'EPackage'
                    },

                    gridData: {
                        horizontalAlignment: 'center',
                        grabExcessHorizontalSpace: true,
                        grabExcessVerticalSpace: true
                    }
                }
            ]
        }
    ]
});

var EPackageShape = Ds.Shape.extend({

    figure: {
        type: 'rect',
        fill: 'yellow',
        'fill-opacity': 0,
        stroke: 'none',
        height: 120,
        width: 160
    },

    initialize: function(attributes) {
        if (!this.diagram) return;

        var head = new EPackageHeadShape({ diagram: this.diagram });
        var body = new EPackageCompartment({ diagram: this.diagram });
        this.add(head);
        this.add(body);
        this.layout.north = head;
        this.layout.center = body;

        this.on('click', this.select);
    },

    layout: {
        type: 'border',
        vgap: 0,
        hgap: 0
    }
});
