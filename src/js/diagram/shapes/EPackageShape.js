
var EPackageCompartment = Ds.Shape.extend({
    draggable: false,
    selectable: false,
    resizable: false,

    figure: {
        type: 'rect',
        fill: '270-#B8A8C8-#FFF',
        height: 100
    },

    initialize: function() {
        this.on('click', function() { this.parent.select(); }, this);
    }
});

var EPackageHeadShape = Ds.Shape.extend({
    draggable: false,
    selectable: false,
    resizable: false,

    figure: {
        type: 'rect',
        height: 20,
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
                height: 20,
                width: 40,
                x: 0,
                y: 0,
                fill: '#B8A8C8'
            },

//            layout: { type: 'xy' },

            children: [
/*                {
                    figure: {
                        x: 0, y: 0,
                        type: 'text',
                        height: 20,
                        width: 60,
                        'font-size': 14,
                        text: 'My Package'
                    }
                }
*/          ]
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
