
//     Diagrams.js 0.1.0
//     JavaScript Diagramming Library.
//
//     © 2013 Guillaume Hillairet.
//     EPL License (http://www.eclipse.org/legal/epl-v10.html)

(function(exports) {

    "use strict";

    var Ds = {
        version: '0.1.0'
    };

    exports.Ds = Ds;



// Raphael extensions for Diagrams.js.

var isNatural = function(number) {
    if (_.isNumber(number) && _.isFinite(number)) {
        return number > 0;
    } else {
        return false;
    }
};

//  Override Raphael

Raphael.el.is = function (type) {
    return this.type === type;
};

Raphael.el.x = function () {
    switch (this.type) {
    case 'ellipse':
    case 'circle':
        return this.attr('cx');
    default:
        return this.attr('x');
    }
};

Raphael.el.y = function () {
    switch (this.type) {
    case 'ellipse':
    case 'circle':
        return this.attr('cy');
    default:
        return this.attr('y');
    }
};

Raphael.el.o = function () {
    var attr = this.attr();

    this.oa = _.clone(attr);
    this.oa.fill = this.attr('fill'); // for gradients.
    if (this.oa['fill-opacity'] === undefined) {
        this.oa['fill-opacity'] = 1;
    }
    this.ox = this.x();
    this.oy = this.y();
    this.ow = attr.width;
    this.oh = attr.height;
    this.or = attr.r;
    this.orx = attr.rx;
    this.ory = attr.ry;
    return this;
};

Raphael.el.reset = function() {
    var attrs = this.oa;

    if (!attrs) return this;

    // changes coordinates and sizes
    // reset other attributes.
    attrs.width = this.attrs.width;
    attrs.height = this.attrs.height;
    attrs.r = this.attrs.r;
    attrs.cx = this.attrs.cx;
    attrs.cy = this.attrs.cy;
    attrs.x = this.attrs.x;
    attrs.y = this.attrs.y;

    this.attr(attrs);

    delete this.oa;

    return this;
};

Raphael.el.getABox = function() {
    var b = this.getBBox();
    var o = {
        x: b.x,
        y: b.y,
        width: b.width,
        height: b.height,

        xLeft: b.x,
        xCenter: b.x + b.width / 2,
        xRight: b.x + b.width,

        yTop: b.y,
        yMiddle: b.y + b.height / 2,
        yBottom: b.y + b.height
    };

    // center
    o.center      = { x: o.xCenter,   y: o.yMiddle };

    // edges
    o.topLeft     = { x: o.xLeft,     y: o.yTop };
    o.topRight    = { x: o.xRight,    y: o.yTop };
    o.bottomLeft  = { x: o.xLeft,     y: o.yBottom };
    o.bottomRight = { x: o.xRight,    y: o.yBottom };

    // corners
    o.top         = { x: o.xCenter,   y: o.yTop };
    o.bottom      = { x: o.xCenter,   y: o.yBottom };
    o.left        = { x: o.xLeft,     y: o.yMiddle };
    o.right       = { x: o.xRight,    y: o.yMiddle };

    // shortcuts to get the offset of paper's canvas
    // o.offset      = $(this.paper.canvas).parent().offset();

    return o;
};

// Polyline support.
Raphael.fn.polyline = function(x, y) {
    var poly = ['M', x, y, 'L'];
    for (var i = 2; i < arguments.length; i++) {
        poly.push(arguments[i]);
    }
    return this.path(poly.join(' '));
};

// Triangles
Raphael.fn.triangle = function(x, y, size) {
  var path = ["M", x, y];
  path = path.concat(["L", (x + size / 2), (y + size)]);
  path = path.concat(["L", (x - size / 2), (y + size)]);
  return this.path(path.concat(["z"]).join(" "));
};


/**
 * Styles
 */

Ds.Styles = {

    moveStyle: {
        fill: 'grey',
        'fill-opacity': 0.2,
        'stroke-width': 0
    },
    resizeStyle: {
        fill: 'grey',
        'fill-opacity': 0.2,
        'stroke-width': 0
    },
    selectStyle: {
        fill: 'none',
        stroke: 'black',
        'stroke-width': 1
    },
    anchorStyle: {
        fill: 'black',
        stroke: 'none',
        'fill-opacity': 1
    }

};


/**
 * @name Point
 *
 * @class Represents a 2D Point.
 *
 * @param {Integer} x
 * @param {Integer} y
 * @api public
 *
 */

var Point = Ds.Point = function Point(x, y) {
    if (!y && _.isObject(x)) {
        this.x = x.x;
        this.y = x.y;
    } else {
        this.x = x;
        this.y = y;
    }
};

Point.prototype.isInside = function(box) {
    if (box && box.x) {
        return this.x >= box.x &&
            this.x <= box.xRight &&
            this.y >= box.y &&
            this.y <= box.yBottom;
    } else return false;
};

// Calculates angle for arrows

Point.prototype.theta = function(point) {
    return Point.theta(this, point);
};

Point.prototype.vector = function(point) {
    return Point.vector(this, point);
};

Point.prototype.add = function(point) {
    this.x += point.y;
    this.y += point.y;
};

Point.prototype.sub = function(point) {
    this.x -= point.x;
    this.y -= point.y;
};

Point.prototype.equals = function(point) {
    return this.x === point.x && this.y === point.y;
};

Point.theta = function(p1, p2) {
    var y = -(p2.y - p1.y), // invert the y-axis
        x = p2.x - p1.x,
        rad = Math.atan2(y, x);

    if (rad < 0) { // correction for III. and IV. quadrant
        rad = 2 * Math.PI + rad;
    }

    return {
        degrees: 180 * rad / Math.PI,
        radians: rad
    };
};

Point.vector = function(p1, p2) {
    return {
        x: p2.x - p1.x,
        y: p2.y - p1.y
    };
};

/**
 * Returns the Point corresponding to a MouseEvent.
 *
 * @param {Raphael} current Raphael object
 * @param {MouseEvent} mouse event from which obtain the point
 * @api public
 */

Point.get = function(diagram, e) {
    // IE:
    if (window.event && window.event.contentOverflow !== undefined) {
        return new Point(window.event.x, window.event.y);
    }

    // Webkit:
    if (e.offsetX !== undefined && e.offsetY !== undefined) {
        return new Point(e.offsetX, e.offsetY);
    }

    // Firefox, Opera:
    var paper = diagram.paper ? diagram.paper() : diagram;
    var pageX = e.pageX;
    var pageY = e.pageY;
    var el = paper.canvas.parentNode;
    var x = 0, y = 0;
    while(el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
        x += el.offsetLeft - el.scrollLeft;
        y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    x = e.pageX - x;
    y = e.pageY - y;

    return new Point(x, y);
};



/**
 * @name Line
 * @class Basic representation of a Line
 *
 */

var Line = function(paper, p1, p2) {
    this.paper = paper;
    this.start = p1;
    this.end = p2;
    this.wrapper = paper.path('M'+this.start.x+','+this.start.y+'L'+this.end.x+','+this.end.y);
    return this;
};

/**
 * Wrapper method for Raphael#attr
 */

Line.prototype.attr = function() {
    return Raphael.el.attr.apply(this.wrapper, arguments);
};

/**
 * Removes the Line from the canvas
 */

Line.prototype.remove = function() {
    this.wrapper.remove();
};

/**
 * Find point of intersection between two lines
 */

Line.prototype.intersection = function(line) {
    var pt1Dir = { x: this.end.x - this.start.x, y: this.end.y - this.start.y },
        pt2Dir = { x: line.end.x - line.start.x, y: line.end.y - line.start.y },
        det = (pt1Dir.x * pt2Dir.y) - (pt1Dir.y * pt2Dir.x),
        deltaPt = { x: line.start.x - this.start.x, y: line.start.y - this.start.y },
        alpha = (deltaPt.x * pt2Dir.y) - (deltaPt.y * pt2Dir.x),
        beta = (deltaPt.x * pt1Dir.y) - (deltaPt.y * pt1Dir.x);

    if (det === 0 || alpha * det < 0 || beta * det < 0) {
        return null;    // no intersection
    }

    if (det > 0) {
        if (alpha > det || beta > det) {
            return null;
        }
    } else {
        if (alpha < det || beta < det) {
            return null;
        }
    }

    return {
        x: this.start.x + (alpha * pt1Dir.x / det),
        y: this.start.y + (alpha * pt1Dir.y / det)
    };
};

/**
 * Find intersection point with a box.
 */

Line.prototype.findIntersection = function( box ) {
    var points = [
        { p1: box.topLeft, p2: box.topRight },
        { p1: box.topLeft, p2: box.bottomLeft },
        { p1: box.bottomLeft, p2: box.bottomRight },
        { p1: box.bottomRight, p2: box.topRight }
    ];

    for (var i = 0; i < points.length; i++) {
        var boxLine = new Line(this.paper, points[i].p1, points[i].p2);
        var intersection = this.intersection( boxLine );
        boxLine.remove();

        if (intersection) {
            return intersection;
        }
    }

    return null;
};


// Events

// Regular expression used to split event strings
var eventSplitter = /\s+/;

// A module that can be mixed in to *any object* in order to provide it with
// custom events. You may bind with `on` or remove with `off` callback functions
// to an event; `trigger`-ing an event fires all callbacks in succession.
//
//     var object = {};
//     _.extend(object, Backbone.Events);
//     object.on('expand', function(){ alert('expanded'); });
//     object.trigger('expand');
//
var Events = Ds.Events = {

    // Bind one or more space separated events, `events`, to a `callback`
    // function. Passing `"all"` will bind the callback to all events fired.
    on: function(events, callback, context) {
        var calls, event, list;
        if (!callback) return this;

        events = events.split(eventSplitter);
        calls = this._callbacks || (this._callbacks = {});

        while (event = events.shift()) {
            list = calls[event] || (calls[event] = []);
            list.push(callback, context);
        }

        return this;
    },

    // Remove one or many callbacks. If `context` is null, removes all callbacks
    // with that function. If `callback` is null, removes all callbacks for the
    // event. If `events` is null, removes all bound callbacks for all events.
    off: function(events, callback, context) {
      var event, calls, list, i;

      // No events, or removing *all* events.
      if (!(calls = this._callbacks)) return this;
      if (!(events || callback || context)) {
        delete this._callbacks;
        return this;
      }

      events = events ? events.split(eventSplitter) : _.keys(calls);

      // Loop through the callback list, splicing where appropriate.
      while (event = events.shift()) {
        if (!(list = calls[event]) || !(callback || context)) {
          delete calls[event];
          continue;
        }

        for (i = list.length - 2; i >= 0; i -= 2) {
          if (!(callback && list[i] !== callback || context && list[i + 1] !== context)) {
            list.splice(i, 2);
          }
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(events) {
      var event, calls, list, i, length, args, all, rest;
      if (!(calls = this._callbacks)) return this;

      rest = [];
      events = events.split(eventSplitter);

      // Fill up `rest` with the callback arguments.  Since we're only copying
      // the tail of `arguments`, a loop is much faster than Array#slice.
      for (i = 1, length = arguments.length; i < length; i++) {
        rest[i - 1] = arguments[i];
      }

      // For each event, walk through the list of callbacks twice, first to
      // trigger the event, then to trigger any `"all"` callbacks.
      while (event = events.shift()) {
        // Copy callback lists to prevent modification.
        if (all = calls.all) all = all.slice();
        if (list = calls[event]) list = list.slice();

        // Execute event callbacks.
        if (list) {
          for (i = 0, length = list.length; i < length; i += 2) {
            list[i].apply(list[i + 1] || this, rest);
          }
        }

        // Execute "all" callbacks.
        if (all) {
          args = [event].concat(rest);
          for (i = 0, length = all.length; i < length; i += 2) {
            all[i].apply(all[i + 1] || this, args);
          }
        }
      }

        return this;
    }

};



/**
 * @name Element
 * @class Represents the base concept in diagrams.js. Element is
 * abstract and not intended to be instanciated but beings extended via
 * the extend method
 *
 * @example
 *
 * var MyClass = Ds.Element.extend({
 *      constructor: function(attributes) {
 *      }
 * });
 *
 */

var Element = Ds.Element = function (attributes) {
    this.attributes = {};
    this.attributes.children = [];
};

// extend
var extend = function(protoProps, classProps) {
    return inherits(this, protoProps, classProps);
};

var ctor = function() {};
var inherits = function(parent, protoProps, staticProps) {
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
        child = protoProps.constructor;
    } else {
        child = function(){ parent.apply(this, arguments); };
    }

    // Inherit class (static) properties from parent.
    _.extend(child, parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) {
        _.extend(child.prototype, protoProps);
    }

    // Add static properties to the constructor function, if supplied.
    if (staticProps) {
        _.extend(child, staticProps);
    }

    // Correctly set child's `prototype.constructor`.
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is needed later.
    child.__super__ = parent.prototype;

    return child;
};

Element.extend = extend;

Element.prototype = {

    /**
     * Method called after instanciation of an object
     */

    initialize: function() {},

    /**
     * Returns `true` if the attribute contains a value that is not null
     * or undefined.
     *
     * @return {boolean}
     */

    has: function( attr ) {
        return this.attributes[attr] != null;
    },

    /**
     * Returns the value of an attribute.
     *
     * @param {string}
     * @return {object}
     */

    get: function( attr ) {
        return this.attributes[attr];
    },

    /**
     * Sets the value of an attribute.
     *
     * @param {string} key
     * @param {string} value
     * or
     * @param {object}
     */

    set: function( key, value ) {
        var attrs;

        if (_.isObject(key))
            attrs = key;
        else (attrs = {})[key] = value;

        for (var attr in attrs) {
            this.attributes[attr] = attrs[attr];
        }

        return this;
    },

    /**
     * Return the JSON representation of an Element.
     *
     * @return {object}
     */

    toJSON: function() {
        var attributes = this.attributes,
            clone = _.clone(attributes);

        return this._deepClone(clone);
    },

    /**
     * Clone internal representation of the Element.
     *
     * @param {object} clone
     * @private
     */

    _deepClone: function( clone ) {
        for (var key in clone) {
            var value = clone[key];

            if (_.isArray(value)) {
                var copy = [];
                for (var i = 0; i < value.length; i++) {
                    var v = value[i];
                    if (v.attributes) {
                        copy[i] = v.toJSON();
                    }
                }
                clone[key] = copy;
            } else if (_.isObject(value)) {
                if (value.attributes) {
                    clone[key] = value.toJSON();
                }
            }

        }

        return clone;
    }

};

_.extend(Ds.Element.prototype, Ds.Events);

var raphaelAttributes = Raphael._availableAttrs,
    escapes = ['children', 'figure', 'label', 'compartment'];

// text must be added as an available attribute.
raphaelAttributes.text = '';



var Figure = Ds.Figure = Ds.Element.extend({

    constructor: function(attributes) {
        if (!attributes) attributes = {};
        Ds.Element.apply(this, [attributes]);

        if (attributes.shape) {
            this.shape = attributes.shape;
        } else if (attributes.paper) {
            this.paper = attributes.paper;
        }

        this.eveHandlers = [];
    },

    initialize: function(attributes) {},

    set: function(key, value) {
        var attrs;

        if (_.isObject(key))
            attrs = key;
        else (attrs = {})[key] = value;

        for (var attr in attrs) {
            this.setValue(attr, attrs[attr]);
        }

        return this;
    },

    /**
     * @private
     */

    setValue: function(key, value) {
        if (_.has(this.defaults, key)) {
            this.attributes[key] = value;
            if (key === 'width' || key === 'height') {
                if (!this.attributes['min-' + key])
                    this.attributes['min-' + key] = value;
            }
            if (this.wrapper) this.wrapper.attr(key, value);
        }
    },

    render: function() {},

    events: [
        'click', 'dblclick',
        'mouseover', 'mouseout',
        'mouseup', 'mousedown',
        'mousemove', 'touchmove',
        'touchstart', 'touchend'
    ],

    /**
     * @private
     */

    bindEvents: function(wrapper) {
        var shape = this.shape;
        var _wrapper = wrapper || this.wrapper;

        this.eveHandlers = _.map(this.events, function(eve) {
            return { eve: eve, handler: function(e) {
                shape.trigger(eve, e);
            } };
        });

        _.each(this.eveHandlers, function(call) {
            _wrapper[call.eve](call.handler);
        });
    },

    /**
     * @private
     */

    unBindEvents: function(wrapper) {
        var _wrapper = wrapper || this.wrapper;
        _.each(this.eveHandlers, function(call) {
            _wrapper['un' + call.eve](call.handler);
        });
        this.eveHandlers.length = 0;
    },

    /**
     * @private
     */

    renderer: function() {
        if (!this.diagram) {
            this.diagram = this.shape.diagram || this.shape.parent.diagram;
        }

        var renderer = this.diagram.paper();
        if (!renderer)
            throw new Error('Cannot render figure, renderer is not available.');

        return renderer;
    },

    // resize functions

    startResize: function(style) {
        if (this.wrapper) {
            this.wrapper.o();
            this.wrapper.attr(style);
        }
    },

    resize: function(dx, dy, direction) {},

    endResize: function() {
        if (this.wrapper) {
            this.wrapper.reset();
        }
    },

    asDraggable: function(style) {
        this.moveStyle = style;
        if (this.wrapper) {
            this.wrapper.attr({ cursor: 'move' });
            this.wrapper.drag(this.move, this.startMove, this.endMove);
        }
    },

    // move functions

    startMove: function(style) {
        var figure = this.control;
        if (!figure) return;

        var shape = figure.shape;
        if (shape.connecting) return;
        shape.deselect();
        shape.removeContent();

        var attrs = _.clone(this.attrs);
        // stores current state
        this.o();
        // sets move style
        this.attr(shape.moveStyle);
        shape.trigger('start:move');
    },

    move: function(dx, dy, mx, my, eve) {
        var figure = this.control || this;
        if (!figure) return;

        var shape = figure.shape;
        if (shape.connecting) return;

        var position = figure.calculatePosition(dx, dy);
        figure.set({ x: position.x, y: position.y });
        figure.shape.renderEdges();

        if (shape.boundBox) shape.boundBox.render();
    },

    endMove: function() {
        var figure = this.control;
        if (!figure) return;

        var shape = figure.shape;
        shape.renderContent();

        this.reset();

        if (shape.boundBox) {
            shape.boundBox.remove();
        }

        shape.renderEdges();
        shape.trigger('end:move');
    },

    /**
     * @private
     */

    calculateX: function(dx) {
        var bounds = this.bounds();
        var limits = this.limits();
        var x = this.wrapper.ox + dx;

        return Math.min(Math.max(0, x), (limits.width - bounds.width));
    },

    /**
     * @private
     */

    calculateY: function(dy) {
        var bounds = this.bounds();
        var limits = this.limits();
        var y = this.wrapper.oy + dy;

        return Math.min(Math.max(0, y), (limits.height - bounds.height));
    },

    /**
     * @private
     */

    calculatePosition: function(dx, dy) {
        return {
            x: this.calculateX(dx),
            y: this.calculateY(dy)
        };
    },

    /**
     * Returns the Shape's bounds in the form of
     * an object { x: x, y: y, width: width, height: height }.
     *
     * @return object
     */

    bounds: function() {
        if (this.wrapper)
            return this.wrapper.getABox();
        else return {
            x: this.get('x'),
            y: this.get('y')
        };
    },

    /**
     * Returns the limits in which the figure can evolve. The limits
     * are given  in the form of an object
     * { x: x, y: y, width: width, height: height }.
     *
     * @return object
     */

    limits: function() {
        var shape = this.shape;
        if (this.shape.parent) {
            return this.shape.parent.bounds();
        } else {
            var canvas = this.renderer();
            return {
                x: 0, y: 0,
                width: canvas.width,
                height: canvas.height
            };
        }
    },

    /**
     * Removes the figure from the canvas.
     */

    remove: function() {
        if (this.wrapper) {
            this.wrapper.remove();
            this.unBindEvents();
            delete this.wrapper;
        }
        return this;
    },

    /**
     * Moves the figure according to the given dx, dy.
     */

    translate: function(dx, dy) {
        if (this.wrapper) {
            this.wrapper.transform('t' + dx + ',' + dy);
            this.attributes.x = this.wrapper.attr('x');
            this.attributes.y = this.wrapper.attr('y');
        //    this.set({ x: this.wrapper.attr('x'), y: this.wrapper.attr('y') });
        }
        return this;
    },

    isPointInside: function(point) {
        var x = point.x, y = point.y;
        var box = this.wrapper.getABox();

        return x >= box.x && x <= box.xRight && y >= box.y && y <= box.yBottom;
    },

    show: function() {
        if (this.wrapper) this.wrapper.show();
    },

    hide: function() {
        if (this.wrapper) this.wrapper.hide();
    },

    toFront: function() {
        if (this.wrapper) this.wrapper.toFront();
    },

    toBack: function() {
        if (this.wrapper) this.wrapper.toBack();
    },

    preferredSize: function() {
        return this.bounds();
    },

    minimumSize: function() {
        return this.bounds();
    },

    maximumSize: function() {
        return this.bounds();
    }

}, {

    defaults: {
        x: 0,
        y: 0,
        fill: 'none',
        opacity: 1,
        stroke: 'none',
        'fill-opacity': 1,
        'stroke-opacity': 1,
        'stroke-width': 1,
        'cursor': 'default'
    },

    figures: {
        'rect': 'Rectangle',
        'circle': 'Circle',
        'ellipse': 'Ellipse',
        'path': 'Path',
        'text': 'Text'
    },

    create: function(shape, figure) {
        if (!shape || !figure) return;

        var type = figure.type,
            fn = Figure.figures[type],
            attrs = { shape: shape, figure: figure };

        if (type && fn) {
            if (typeof fn === 'function')
                return new fn(attrs);
            else return new Ds[fn](attrs);
        }
        //    throw new Error('Cannot create figure for', figure);
    }

});



var Rectangle = Ds.Rectangle = Ds.Figure.extend({

    constructor: function(attributes) {
        if (!attributes) attributes = {};
        Ds.Figure.apply(this, [attributes]);
        this.defaults = Rectangle.defaults;
        this.attributes = _.extend({}, this.defaults, attributes.figure || attributes);
        this.initialize(attributes);
    },

    bounds: function() {
        if (this.wrapper)
            return this.wrapper.getABox();
        else
            return {
                width: this.get('width'),
                height: this.get('height'),
                x: this.get('x'),
                y: this.get('y')
            };
    },

    render: function() {
        this.remove();
        var renderer = this.renderer();

        this.wrapper = renderer.rect(
            this.get('x'), this.get('y'),
            this.get('width'), this.get('height'),
            this.get('r'));

        this.wrapper.attr(this.attributes);
        this.wrapper.control = this;
        this.bindEvents();

        return this;
    },

    resize: function(dx, dy, direction) {
        var min = this.minimumSize(),
            limits = this.limits(),
            x = this.wrapper.ox,
            y = this.wrapper.oy,
            w = this.wrapper.ow,
            h = this.wrapper.oh;

        if (direction !== 'n' && direction !== 's') {
            w = this.wrapper.ow + dx;
        }
        if (direction !== 'w' && direction !== 'e') {
            h = this.wrapper.oh + dy;
        }
        if (_.include(['sw', 'nw', 'w'], direction)) {
            w = this.wrapper.ow - dx;
            if (w < min.width) {
                dx = dx - (min.width - w);
            }
            x = this.wrapper.ox + dx;
        }
        if (_.include(['ne', 'nw', 'n'], direction)) {
            h = this.wrapper.oh - dy;
            if (h < min.height) {
                dy = dy - (min.height - h);
            }
            y = this.wrapper.oy + dy;
        }

        if (h < min.height) h = min.height;
        if (w < min.width) w = min.width;
        if (w > limits.width) w = limits.width;
        if (h > limits.height) h = limits.height;
        if (x < limits.x) x = limits.x;
        if (y < limits.y) y = limits.y;

        this.set({ width: w, height: h, y: y, x: x });
    },

    minimumSize: function() {
        var width = this.get('min-width');
        var height = this.get('min-height');
        if (!width) width = this.get('width');
        if (!height) height = this.get('height');

        return {
            width: width,
            height: height
        };
    }

}, {

    defaults: _.extend({}, Figure.defaults, {
        width: 0,
        height: 0,
        r: 0
    })

});



var Circle = Ds.Circle = Ds.Figure.extend({

    constructor: function(attributes) {
        if (!attributes) attributes = {};
        Ds.Figure.apply(this, [attributes]);
        this.attributes = _.extend({}, Circle.defaults, attributes.figure);
        this.defaults = Circle.defaults;
        this.initialize(attributes);
    },

    /**
     * @private
     */

    setValue: function(key, value) {
        if (_.has(this.defaults, key)) {
            this.attributes[key] = value;
            // circles have cx/cy instead of x/y
            if (key === 'x' || key === 'y') key = 'c' + key;
            if (key === 'r') {
                if (!this.attributes['min-r']) this.attributes['min-r'] = value;
            }
            if (this.wrapper) this.wrapper.attr(key, value);
        }
    },

    bounds: function() {
        if (this.wrapper)
            return this.wrapper.getABox();
        else return {
            width: this.get('width'),
            height: this.get('height'),
            x: this.get('x'),
            y: this.get('y')
        };
    },

    render: function() {
        this.remove();
        var renderer = this.renderer();
        if (!renderer)
            throw new Error('Cannot render figure, renderer is not available.');

        this.wrapper = renderer.circle(
            this.get('x'), this.get('y'),
            this.get('r'));

        this.wrapper.attr(this.attributes);
        this.wrapper.control = this;
        this.bindEvents();

        return this;
    },

    resize: function(dx, dy, direction) {
        if (_.include(['ne', 'nw', 'n'], direction)) {
            dy = -dy;
        }

        var min = this.minimumSize();
        var sumr = this.wrapper.or + (dy < 0 ? -1 : 1) * Math.sqrt(2*dy*dy);
        var r = isNatural(sumr) ? sumr : this.wrapper.or;
        if (r < min.r) r = min.r;

        this.set({ r: r });
    },

    /**
     * @private
     */

    calculateX: function(dx, parent) {
        var b = this.bounds();
        var bounds = parent ? parent.bounds() : this.wrapper.paper;
        var x = this.wrapper.ox + dx;
        var r = b.width /2;

        if (parent) {
            return Math.min(Math.max(bounds.x + r, x), (bounds.width - r) + bounds.x);
        } else {
            return Math.min(Math.max(r, x), bounds.width - r);
        }
    },

    /**
     * @private
     */

    calculateY: function(dy, parent) {
        var b = this.bounds();
        var bounds = parent ? parent.bounds() : this.wrapper.paper;
        var y = this.wrapper.oy + dy;
        var r = b.width /2;

        if (parent) {
            return Math.min(Math.max(bounds.y + r, y), (bounds.height - r) + bounds.y);
        } else {
            return Math.min(Math.max(r, y), bounds.height - r);
        }
    },

    minimumSize: function() {
        return { r: this.get('min-r') };
    },

     /**
     * Moves the figure according to the given dx, dy.
     */

    translate: function(dx, dy) {
        if (this.wrapper) {
            this.wrapper.transform('t' + dx + ',' + dy);
            this.set({ x: this.wrapper.attr('cx'), y: this.wrapper.attr('cy') });
        }
        return this;
    }

}, {

    defaults: _.extend({}, Figure.defaults, {
        r: 0
    })

});



var Ellipse = Ds.Ellipse = Ds.Figure.extend({

    constructor: function(attributes) {
        if (!attributes) attributes = {};
        Ds.Figure.apply(this, [attributes]);
        this.attributes = _.extend({}, Ellipse.defaults, attributes.figure);
        this.defaults = Ellipse.defaults;
        this.initialize(attributes);
    },

    render: function() {
        var renderer = this.renderer();

        this.wrapper = renderer.ellipse();
        this.wrapper.control = this;
        this.wrapper.attr(this.attributes);

        return this;
    },

    resize: function(dx, dy, direction) {
        if (_.include(['ne', 'nw', 'n'], direction)) {
            dy = -dy;
        }
        if (_.include(['nw', 'sw', 'n'], direction)) {
            dx = -dx;
        }
        var sumx = this.wrapper.orx + dx;
        var sumy = this.wrapper.orx + dy;
        this.set({
            rx: isNatural(sumx) ? sumx : this.wrapper.orx,
            ry: isNatural(sumy) ? sumy : this.wrapper.ory
        });
    }

}, {

    defaults: _.extend({}, Figure.defaults, {

    })

});


var Path = Ds.Path = Ds.Figure.extend({

    constructor: function(attributes) {
        if (!attributes) attributes = {};
        Ds.Figure.apply(this, [attributes]);
        this.attributes = _.extend({}, attributes.figure);
        this.defaults = Figure.defaults;
        this.initialize(attributes);
    },

    render: function() {
        this.remove();
        var renderer = this.renderer();
        if (!renderer)
            throw new Error('Cannot render figure, renderer is not available.');

        this.wrapper = renderer.path(this.get('path'));

        this.wrapper.attr(this.attributes);
        this.wrapper.control = this;
        this.bindEvents();

        return this;
    },

    bounds: function() {
        if (this.wrapper) return this.wrapper.getABox();
    }

}, {

    defaults: _.extend({} , Figure.defaults, {
        path: ''
    })

});


var Text = Ds.Text = Ds.Figure.extend({

    constructor: function(attributes) {
        if (!attributes) attributes = {};
        var attrs = attributes.figure || attributes;

        Ds.Figure.apply(this, [attributes]);

        this.defaults = _.extend({}, Text.defaults, Text.textDefaults);
        this.attributes = _.extend({}, Text.defaults,
            _.object(_.filter(_.pairs(attrs), this.filterAttributes)));
        this.textAttributes = _.extend({}, Text.textDefaults,
            _.object(_.filter(_.pairs(attrs), this.filterTextAttributes)));
        this.position = Text.getPosition(this, attrs);

        this.initialize(attributes);
    },

    filterAttributes: function(pair) {
        return _.has(Text.defaults, pair[0]);
    },

    /**
     * @private
     */

    filterTextAttributes: function(pair) {
        return _.has(Text.textDefaults, pair[0]);
    },

    get: function(attr) {
        if (this.textAttributes[attr])
            return this.textAttributes[attr];
        else
            return this.attributes[attr];
    },

    /**
     * @private
     */

    setValue: function(key, value) {
        if (_.has(this.textAttributes, key)) {
            this.textAttributes[key] = value;
            if (this.text) this.text.attr(key, value);
        } else {
            this.attributes[key] = value;
            if (this.wrapper) {
                if (_.contains(['width', 'height', 'x', 'y'], key)) {
                    this.layoutText();
                }
                this.wrapper.attr(key, value);
            }
        }
    },

    layoutText: function() {
        if (!this.text) return;

        var box = this.bounds();
        var text = this.text;
        var lbox = text.getABox();

        text.attr('y', box.yMiddle);

        if (this.position === 'center') {
            text.attr('x', box.xCenter);
        }
        if (this.position === 'left') {
            text.attr('x', box.x + (lbox.width / 2));
        }
        if (this.position === 'right') {
            text.attr('x', box.xRight - (lbox.width / 2));
        }
    },

    setPosition: function() {
        if (this.text) {
            this.wrapper.attr({ x: this.get('x'), y: this.get('y') });
            var bbox = this.text.getBBox();
            var x = this.get('x') + (bbox.width / 2);
            var y = this.get('y') + (bbox.height / 2);
            this.text.attr({ x: x, y: y });
        }
    },

    render: function() {
        this.remove();
        var renderer = this.renderer();

        this.wrapper = renderer.rect();
        this.text = renderer.text(0, 0, this.textAttributes.text);
        this.text.attr(this.textAttributes);

        var box = this.text.getBBox();
        var w = this.get('width');
        var h = this.get('height');
        if (w < box.width) this.set('width', box.width);
        if (h < box.height) this.set('height', box.height);
        this.set({ x : this.get('x'), y: this.get('y') });

        this.wrapper.attr(this.attributes).attr({
            stroke: 'none',
            'fill': 'white',
            'fill-opacity': 0
        });

        this.layoutText();
        this.toFront();
        this.wrapper.control = this;
        this.bindEvents();

        return this;
    },

    remove: function() {
        if (this.wrapper) {
            this.wrapper.remove();
            this.text.remove();
            this.unBindEvents(this.text);
            delete this.wrapper;
            delete this.text;
        }
        return this;
    },

    minimumSize: function() {
        var bbox = this.text.getBBox();
        return {
            width: bbox.width,
            height: bbox.height
        };
    },

    toFront: function() {
        if (!this.wrapper) return;
        this.text.toFront();
        this.wrapper.toFront();
    },

    toBack: function() {
        if (!this.wrapper) return;
        this.text.toBack();
        this.wrapper.toBack();
    }

}, {

    textDefaults: {
        'font-size': 12,
        text: 'Label',
        'font-weight': 'normal', // normal | bold | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
        'font-style': 'normal', // normal | italic | oblique
        'font-family': 'Arial',
        fill: 'black',
        'fill-opacity': 1,
        stroke: 'none',
        'stroke-opacity': 1,
        'stroke-width': 1
    },

    defaults: {
        width: 0,
        height: 0,
        x: 0,
        y: 0
    },

    positions: [ 'center', 'left', 'right' ],

    getPosition: function(text, properties)  {
        var position = text.position || 'center';
        if (properties && properties.position) {
            if (_.include(Text.positions, properties.position)) {
                position = properties.position;
            }
        }
        return position;
    }

});


/**
 * @name DiagramElement
 * @class Element that is part of a Diagram (Shape, Connection).
 * A DiagramElement is defined by a figure and is identified by a unique id.
 * @augments Element
 *
 */

var DiagramElement = Ds.DiagramElement = Ds.Element.extend(/** @lends DiagramElement.prototype */ {

    constructor: function(attributes) {
        if (!attributes) attributes = {};
        Ds.Element.apply(this, [attributes]);

        this.parent = attributes.parent || undefined;
        this.diagram = this.parent ? this.parent.diagram : attributes.diagram;

        this.set('id', attributes.id || _.uniqueId());
        this.setFigure(attributes.figure || this.figure);
        this.set(attributes);
    },

    setFigure: function(figure) {
        if (figure instanceof Figure)
            this.figure = figure;
        else
            this.figure = Figure.create(this, figure);
    },

    /**
     * Renders the element on the canvas.
     */

    render: function() {
        return this;
    },

    /**
     * Removes the element from the canvas.
     */

    remove: function() {
        if (this.figure) this.figure.remove();
        return this;
    },

    /**
     * Returns the Raphael instance for this DiagramElement
     */

    paper: function() {
        if (!this.diagram && this.parent) {
            this.diagram = this.parent.diagram;
        }
        if (!this.diagram) {
            throw new Error('Element must be associated to a diagram');
        }
        return this.diagram.paper();
    },

    get: function(key) {
        if (this.figure && _.has(this.figure.defaults, key)) {
            return this.figure.get(key);
        }
        return Element.prototype.get.apply(this, arguments);
    },

    /**
     * Setter method
     *
     * @param {string} key
     * @param {object} value
     */

    set: function(key, value) {
        var attrs;

        if (_.isObject(key))
            attrs = key;
        else (attrs = {})[key] = value;

        for (var attr in attrs) {
            if (this.figure && _.has(this.figure.defaults || {}, attr)) {
                this.figure.set(attr, attrs[attr]);
            } else {
                this.attributes[attr] = attrs[attr];
            }
        }

        return this;
    },

    setParent: function(parentShape) {
        this.parent = parentShape;
        if (!this.diagram) {
            this.diagram = parentShape.diagram;
        }
        return this;
    },

    /**
     * Show the DiagramElement if previously hidden
     */

    show: function() {
        if (this.figure) this.figure.show();
        return this;
    },

    /**
     * Hide the DiagramElement
     */

    hide: function() {
        if (this.figure) this.figure.hide();
        return this;
    },

    /**
     * Bring the DiagramElement on top of other elements
     */

    toFront: function() {
        if (this.figure) this.figure.toFront();
        _.each(this.children, function(child) { child.toFront(); });
        return this;
    },

    /**
     * Bring the DiagramElement behind other elements
     */

    toBack: function() {
        _.each(this.children, function(child) { child.toBack(); });
        if (this.figure) this.figure.toBack();
        return this;
    },

    isPointInside: function(point) {
        if (!this.figure)
            return false;
        return this.figure.isPointInside(point);
    },

    getByPoint: function(point) {
        var result = [];
        if (this.isPointInside(point)) {
            result.push(this);
            result.push(_.map(this.children, function(c) {
                return c.getByPoint(point);
            }));
        }
        return result;
    }

});

function isImage(shape) {
    return shape.figure && shape.figure.type === 'image';
}

function isLabel(shape) {
    return shape.figure && shape.figure.type === 'text';
}

function isCompartment(shape) {
    return shape.compartment === true;
}


/**
 * @name Layout
 * @class Abstract representation of a Layout
 *
 */

var Layout = function(shape, attributes) {
    this.shape = shape;
    this.type = attributes.type;
};

Layout.extend = extend;

Layout.layouts = function() {
    return {
        'xy': XYLayout,
        'flow': FlowLayout,
        'grid': GridLayout,
        'border': BorderLayout
//        'flex': FlexGridLayout
    };
};

Layout.create = function(shape, attributes) {
    var options = shape.layout || attributes.layout,
        type = options ? options.type : null,
        layout, fn;

    if (_.has(Layout.layouts(), type)) {
        fn = Layout.layouts()[type];
        layout = new fn(shape, options);
    }

    return layout;
};

Layout.prototype = {

    /**
     * Executes the layout algorithm
     */

    layout: function() {},
    minimumSize: function() {},
    maximumSize: function() {},
    preferredSize: function() {}

};


/**
 * @name LayoutElement
 * @class Represents a DiagramElement with Layouting capabilities. A Layout object
 * must be attached to the element via the layout property.
 *
 * @augments DiagramElement
 *
 */

var LayoutElement = Ds.LayoutElement = Ds.DiagramElement.extend(/** @lends LayoutElement.prototype */ {

    constructor: function(attributes) {
        Ds.DiagramElement.apply(this, [attributes]);

        if (attributes.gridData) this.gridData = attributes.gridData;
        this.initialize(attributes);
    },

    /**
     * Returns the element's position and size as an object with
     * properties x, y, with and height.
     *
     * @example
     *  var element = new DiagramElement(...);
     *  var bounds = element.bounds();
     *  // bounds => { x: 10, y: 10, width: 50, height: 50 }
     *
     * @return {object} bounds
     */

    bounds: function() {
        if (this.figure)
            return this.figure.bounds();
        else return {
            x: this.get('x'),
            y: this.get('y'),
            width: this.get('width'),
            height: this.get('height')
        };
    },

    /**
     * Returns the element's preferred size, as an object
     * with the properties width and height. The preferred size
     * is calculated according to the element's size and the preferred
     * size of it's children.
     *
     * @return {object}
     */

    preferredSize: function() {
        if (this.layout) {
            return this.layout.preferredSize();
        } else {
            return this.figure.preferredSize();
        }
        /*
        var min = this.minimumSize(),
            w = this.get('width'),
            h = this.get('height');

        if (!w) w = this.parent.get('width');
        if (!h) h = this.parent.get('height');

        if (this.children) {
            var ch = _.reduce(this.children, function(m, n) {
                return m + n.preferredSize().height;
            }, 0);
            if (ch > 0 && ch > h) h = ch;
        }

        if (min.width > w) w = min.width;
        if (min.height > h) h = min.height;

        return { width: w, height: h };
        */
    },

    /**
     * Returns the element's minimum size, as an object
     * with the properties width and height. The minimum size
     * is calculated according to the element's size and the minimum
     * size of it's children.
     *
     * @return {object}
     */

    minimumSize: function() {
        if (this.layout)
            return this.layout.minimumSize();
        else
            return this.figure.minimumSize();
    },

    /**
     * Returns the element's maximum size, as an object
     * with the properties width and height. The maximum size
     * is calculated according to the element's size and the maximum
     * size of it's children.
     *
     * @return {object}
     */

    maximumSize: function() {
        if (this.layout)
            return this.layout.maximumSize();
        else
            return this.figure.maximumSize();
    },

    /**
     * Performs the layout of the elemet by calling the layout method of
     * the Layout object associated to the element.
     */

    doLayout: function() {
        if (!this.layout) return;
        //this.set(this.layout.preferredSize());
        this.layout.layout();
        this.renderEdges();
    }

});


/**
 *  Diagram.
 *
 *  @name Diagram
 *
 *  @class Represents a Diagram
 *
 *  @example
 *
 *  // Creates a new diagram
 *  var d = new Ds.Diagram('canvas');
 *  var d = new Ds.Diagram(document.getElementById('canvas'));
 *  var d = new Ds.Diagram('canvas', 1000, 800);
 *
 *  var D = Diagram.extend({
 *      el: 'canvas',
 *      width: 1000,
 *      height: 800,
 *      children: [
 *          SomeRootShape,
 *          AnotherRootShape
 *      ]
 *  });
 *
 *  var d = new D();
 *
 * The element can be set after the instance of Diagram is created,
 * but before the call to render.
 *
 *  d.setElement('canvas');
 *  d.setElement(document.getElementById('canvas'));
 *
 * This returns the HTMLElement:
 *
 *  d.el;
 *
 * Call render will display all shapes and connections of the diagram.
 *
 *  d.render();
 *
 */

Ds.Diagram = Ds.Element.extend(/** @lends Diagram.prototype */ {

    constructor: function(attributes) {
        if (!attributes) attributes = {};
        Ds.Element.apply(this, [attributes]);

        this._selection = null;
        this._currentSource = null;
        this._currentEdge = null;
        this.isSelecting = false;
        this.isDragging = false;
        this._handlers = [];

        this.set('edges', []);

        if (attributes.el) this.el = attributes.el;
        if (this.el) this.setElement(this.el);

        this.initialize(attributes);
    },

    /**
     * Returns the current Raphael object.
     *
     * @name paper
     * @function
     * @memberOf Ds.Diagram
     * @returns {Raphael}
     */

    paper: function() {
        if (!this._paper) this._initPaper();
        return this._paper;
    },

    /**
     * Sets the HTML Element that will contain the diagram.
     * The parameter can be a string, or an HTMLElement.
     *
     * @name setElement
     * @param {HTMLElement}
     * @param {String}
     */

    setElement: function(el) {
        if (!el) return this;

        if (_.isString(el)) {
            var id = el.indexOf('#') === 0 ? el.slice(1, el.length) : el;
            this.el = document.getElementById(id);
        } else if (el instanceof HTMLElement) {
            this.el = el;
        }

        return this;
    },

    /**
     * Returns the SVG Element containing the diagram.
     *
     * @name canvas
     * @return {SVGObject} canvas
     */

    canvas: function() {
        return this._paper ? this._paper.canvas : null;
    },

    /**
     * Renders the content of the diagram.
     *
     */

    render: function() {
        // Insures the Raphael object is ready.
        var paper = this.paper();
        var canvas = paper.canvas;
        var x = canvas.clientLeft;
        var y = canvas.clientTop;
        var width = canvas.width.baseVal.value;
        var height = canvas.height.baseVal.value;

        if (this.wrapper) this.wrapper.remove();
        // creates wrapper that will receive events
        this.wrapper = this.paper().rect(x, y, width, height, 0).attr({
            fill: 'white', opacity: 0, stroke: 'none'
        });

        this.bindEvents();
        _.each(this.get('children'), function(child) { child.render(); });
        _.each(this.get('edges'), function(edge) { edge.render(); });

        this.on('mousedown touchstart', this.changeViewBox);
        this.on('mousedown touchstart', this.selectGroup);
        this.on('click', this.deselect, this);

        return this;
    },

    _events: [
        'click', 'dblclick',
        'mouseout', 'mouseup',
        'mouseover', 'mousedown',
        'mousemove', 'touchstart',
        'touchmove', 'touchend',
        'touchcancel'
    ],

    /**
     * @private
     */

    bindEvents: function() {
        var diagram = this;
        var wrapper = this.wrapper;
        var createHandler = function(eve) {
            return {
                eve: eve,
                handler: function(e) { diagram.trigger(eve, e); }
            };
        };
        var bind = function(call) { wrapper[call.eve](call.handler); };

        this._handlers = _.map(this._events, createHandler);
        _.each(this._handlers, bind);
    },

    /**
     * @private
     */

    unBindEvents: function() {
        var wrapper = this.wrapper;
        var unbind = function(call) { wrapper['un' + call.eve](call.handler); };

        _.each(this._handlers, unbind);
        this._handlers.length = 0;
    },

    /**
     * SetViewBox
     *
     * @param x
     * @param y
     * @param width
     * @param height
     */

    setViewBox: function(x, y, width, height) {
        var _x = x || 0;
        var _y = y || 0;
        var _width = width || this._paper.width;
        var _height = height || this._paper.height;
        if (this._paper && this._paper.setViewBox) {
            this._paper.setViewBox(_x, _y, _width, _height);
        }
    },

    /**
     * Zoom
     *
     * @param String
     */

    zoom: function(factor) {
        var x = this.wrapper.attr('x');
        var y = this.wrapper.attr('y');
        var paper = this.paper();
        var width = this._paper.width = paper.width + factor;
        var height = this._paper.height = paper.height + factor;

        this.setViewBox(x, y, width + factor, height + factor);
    },

    /**
     * Clears the content of the diagram.
     *
     * This methods does not remove the content of the diagram,
     * only
     */

    remove: function() {
        if (this._paper) {
            _.each(this.get('children'), function(child) { child.remove(); });
            _.each(this.get('edges'), function(child) { child.remove(); });
            this._paper.remove();
            this._paper = null;
        }
    },

    /**
     * @private
     */

    changeViewBox: function(e) {
        if (!this.isDragging) return;

        var startPoint = Point.get(this, e),
            endPoint;

        this.wrapper.toFront();
        var move = function(ee) {
            var wp = new Point(this.wrapper.attr('x'), this.wrapper.attr('y'));
            ee.stopImmediatePropagation();
            endPoint = Point.get(this, ee);
            wp.sub(startPoint.vector(endPoint));
            this.wrapper.attr(wp);
            this.setViewBox(wp.x, wp.y);
            startPoint = endPoint;
        };
        var up = function(ee) {
            ee.stopImmediatePropagation();
            this.wrapper.toBack();
            this.off('mouseup touchend touchcancel', up);
            this.off('mousemove touchmove', move);
        };
        this.on('mouseup touchend touchcancel', up);
        this.on('mousemove touchmove', move);
    },

    /**
     * @private
     */

    selectGroup: function(e) {
        if (!this.isSelecting) return;

        var startPoint = Point.get(this, e);
        var selectionBox = this.paper().rect(startPoint.x, startPoint.y, 0, 0);
        var endPoint, box, dx, dy, ow, w, oh, h;
        selectionBox.attr({
            'fill-opacity': 0.15,
            'stroke-opacity': 0.5,
            fill: '#007fff',
            stroke: '#007fff'
        });

        this.wrapper.toFront();
        var move = function(ee) {
            ee.stopImmediatePropagation();
            endPoint = Point.get(this, ee);
            box = selectionBox.getABox();
            dx = endPoint.x - startPoint.x;
            dy = endPoint.y - startPoint.y;
            ow = selectionBox.attr('width');
            oh = selectionBox.attr('height');

            // defaults
            w = ow + dx;
            h = oh + dy;

            // special cases
            if (box.x <= endPoint.x) {
                if (box.xRight > endPoint.x && dx > 0) {
                    selectionBox.attr('x', endPoint.x);
                    w = ow - dx;
                }
            } else {
                selectionBox.attr('x', endPoint.x);
                w = ow - dx;
            }
            if (box.y > endPoint.y || (dy > 0 && box.yBottom > endPoint.y)) {
                selectionBox.attr('y', endPoint.y);
                h = oh - dy;
            }
            if (w >= 0 && h >= 0) {
                selectionBox.attr({ width: w, height: h });
            }

            startPoint = endPoint;
        };
        var up = function(ee) {
            ee.stopImmediatePropagation();
            this.wrapper.toBack();
            this.isSelecting = false;
            this.off('mouseup touchend touchcancel', up);
            this.off('mousemove touchmove', move);

            // TODO
            // var shapes = this.getShapesByBox(selectionBox.getABox());
            // _.each(shapes, function(shape) { if (shape.select) shape.select(); });
            selectionBox.remove();
        };
        this.on('mouseup touchend touchcancel', up);
        this.on('mousemove touchmove', move);
    },

    /**
     * Creates a Shape and add it as children of the diagram.
     *
     * @param {function} Shape constructor
     * @param {object} Shape options
     * @return {Shape}
     */

    createShape: function(func, attributes) {
        var shape = null;
        var attrs = attributes || {};

        if (!func) {
            throw new Error('Cannot create Shape if Shape constructor is missing.');
        }

        attrs.diagram = this;
        shape = new func(attrs);

        return shape;
    },

    /**
     * Removes the given Shape. this triggers the
     * remove:children event.
     *
     * @param {Shape}
     */

    removeShape: function(shape) {
        if (!shape) return;

        var children = this.get('children');
        this.set('children', _.reject(children, function(child) {
            return child === shape;
        }));
        this.trigger('remove:children', shape);
    },

    /**
     * Gets a Shape by it's id.
     *
     * @param {integer} shape's id
     * @return {Shape}
     */

    getShape: function(id) {
        if (!id) return null;

        var shape = _.find(this.get('children'), function(child) {
            return child.get('id') === id;
        });

        return shape;
    },

    /**
     * Returns all shapes containing the given point.
     *
     * @param {Point}
     * @return {array}
     *
     */
    getShapesByPoint: function(point) {
        var args = arguments;

        if (!point)
            return null;
        if (args.length === 2)
            point = { x: args[0], y: args[1] };
        if (isNaN(point.x) || isNaN(point.y))
            return [];

        var findShapes = function(shape) {
            return shape.getByPoint(point);
        };
        return _.flatten(_.map(this.get('children'), findShapes));
    },

    /**
     * Returns all shapes inside the given box.
     *
     * @param {object} box
     * @return {array} shapes inside box
     */

    getShapesByBox: function(box) {
        if (!box || !box.x) return [];
        var bounds;
        var findShapes = function(shape) {
            bounds = shape.bounds();
            return box.x <= bounds.x && box.xRight >= bounds.x &&
                box.y <= bounds.y && box.yBottom >= bounds.y;
        };
        return _.filter(this.get('children'), findShapes);
    },

    /**
     * Creates a Connection and add it to the diagram. The options
     * argument can contain the source and target Shape.
     *
     * @param {function} Connection constructor
     * @param {object} Connection options
     * @return {Connection}
     */

    createConnection: function(func, attributes) {
        if (typeof func !== 'function') return;

        var connection = null,
            attrs = attributes || {},
            source = attrs.source,
            target = attrs.target;

        attrs.diagram = this;
        connection = new func( attrs );

        if (source && target) {
            connection.connect(source, target);
        }

        connection.on('remove:source remove:target', function(connection) {
            this.removeConnection( connection );
        }, this);

        return connection;
    },

    /**
     * Removes the Connection from the diagram.
     *
     * @param {Connection}
     */

    removeConnection: function(connection) {
        if (!connection) return;

        var edges = this.get('edges');
        this.set('edges', _.reject(edges, function( edge ) {
            return edge === connection;
        }));

        this.trigger('remove:edges', connection);
    },

    /**
     * Gets a Connection by it's id.
     *
     * @param {integer} Connection's id
     * @return {Connection}
     */

    getConnection: function(id) {
        if (!id) return null;

        var connection = _.find(this.get('edges'), function(child) {
            var childID = child.get('id');
            if (childID) {
                return childID === id;
            }
        });

        return connection;
    },

    /**
     * @private
     */

    canConnect: function(node) {
        if (this.currentEdge) {
            if (this.currentSource) {
                return true;
            } else {
                this.currentSource = node;
                return false;
            }
        } else {
            return false;
        }
    },

    /**
     * @private
     */

    connect: function(node) {
        var connection = null;

        if (this.currentEdge) {
            if (this.currentSource) {
                connection = this.createConnection(this.currentEdge, {
                    source: this.currentSource,
                    target: node
                });
                this.currentEdge = null;
                this.currentSource = null;
            }
        }

        return connection;
    },

    /**
     * Deselects all currently selected Shapes or Connections.
     */

    deselect: function() {
        if (this._selection && typeof this._selection.deselect === 'function') {
            this._selection.deselect();
            delete this._selection;
        }
    },

    /**
     * Sets the current selection.
     *
     * @param {DiagramElement}
     */

    setSelection: function(element) {
        if (this._selection) {
            this._selection.deselect();
        }
        this._selection = element;
        this.trigger('select', element);
    },

    /**
     * Returns the current selection
     *
     * @return {DiagramElement}
     */

    getSelection: function() {
        return this._selection;
    },

    parse: function(data) {

    },

    /**
     * Returns JSON representation of the diagram.
     */

    toJSON: function() {

    },

    /**
     * @private
     */

    _initPaper: function() {
        if (!this.el) {
            throw new Error('Cannot initialize Raphael Object, ' +
                    'Diagram Element is missing, use setElement() before.');
        }

        if (this._paper) return;

        this._paper = Raphael(this.el, this.width, this.height);
        this.setViewBox(0, 0, this._paper.width, this._paper.height);
    },

    /**
     * @private
     */

    _canCreate: function( func ) {
        var child = _.find(this.children, function(c) {
            return c === func;
        });
        return child !== undefined;
    }

});



// ToolBox

var ToolBox = Ds.ToolBox = Ds.DiagramElement.extend({

    constructor: function(attributes) {
        Ds.DiagramElement.apply(this, [attributes]);

        this.element = attributes.element;
        this.width = 70;
        this.height = 60;
    },

    render: function() {
        if (!this.element && !this.element.wrapper) {
            return;
        }

        if (this.wrapper) {
            this.wrapper.remove();
        }

        var paper = this.element.paper(),
            box = this.element.wrapper.getABox(),
            x = box.xRight - 40,
            y = box.y - 30;

        this.wrapper = paper.rect(x, y, this.width, this.height, 6).attr({
            fill: 'orange',
            'fill-opacity': 0,
            stroke: 'black',
            'stroke-opacity': 0,
            'stroke-width': 2
        }).toBack();

        this.wrapper.controller = this;

        this.wrapper.mouseover(this.handleMouseOver);
        this.wrapper.mouseout(this.handleMouseOut);

        box = this.wrapper.getABox();

        var control = this;
        this.addItem(box.xLeft + 20, box.y, Trash, function(evt) {
            control.element.remove(true);
        });
/*
        var propertyBox = this.propertyBox = new ToolBox.propertyBox({ diagram: control.diagram });
        if (ToolBox.propertyBox) {
            this.addItem(box.xLeft + 40, box.y + 20, Gear, function(evt) {
                var elBox = control.element.wrapper.getABox();
                propertyBox.x = elBox.xRight + 20;
                propertyBox.y = elBox.y;
                propertyBox.render();
            });
        }
*/
        return this;
    },

    addItem: function(x, y, text, action) {
        var control = this;
        var paper = this.element.paper();
        var wrapper = paper.path(text);

        wrapper.attr({fill: "#000", stroke: "none"});
        wrapper.attr({cursor: 'pointer'});
        wrapper.translate(x, y);
        wrapper.scale(0.8, 0.8);

        this.get('children').push(wrapper);
        wrapper.mouseover(function(e) {
            control.isOverChild = true;
        });

        wrapper.mouseout(function(e) {
            e.stopPropagation();
            control.isOverChild = false;
        });

        wrapper.click(action);

        return this;
    },

    remove: function() {
        if (this.wrapper) {
            this.wrapper.remove();
            _.each(this.get('children'), function(child) { child.remove(); });
            this.get('children').length = 0;
        }
    },

    handleMouseOver: function() {
        this.controller.isOver = true;
    },

    handleMouseOut: function(e) {
        e.stopPropagation();
    }

});


var Trash = 'M20.826,5.75l0.396,1.188c1.54,0.575,2.589,1.44,2.589,2.626c0,2.405-4.308,3.498-8.312,3.498c-4.003,0-8.311-1.093-8.311-3.498c0-1.272,1.21-2.174,2.938-2.746l0.388-1.165c-2.443,0.648-4.327,1.876-4.327,3.91v2.264c0,1.224,0.685,2.155,1.759,2.845l0.396,9.265c0,1.381,3.274,2.5,7.312,2.5c4.038,0,7.313-1.119,7.313-2.5l0.405-9.493c0.885-0.664,1.438-1.521,1.438-2.617V9.562C24.812,7.625,23.101,6.42,20.826,5.75zM11.093,24.127c-0.476-0.286-1.022-0.846-1.166-1.237c-1.007-2.76-0.73-4.921-0.529-7.509c0.747,0.28,1.58,0.491,2.45,0.642c-0.216,2.658-0.43,4.923,0.003,7.828C11.916,24.278,11.567,24.411,11.093,24.127zM17.219,24.329c-0.019,0.445-0.691,0.856-1.517,0.856c-0.828,0-1.498-0.413-1.517-0.858c-0.126-2.996-0.032-5.322,0.068-8.039c0.418,0.022,0.835,0.037,1.246,0.037c0.543,0,1.097-0.02,1.651-0.059C17.251,18.994,17.346,21.325,17.219,24.329zM21.476,22.892c-0.143,0.392-0.69,0.95-1.165,1.235c-0.474,0.284-0.817,0.151-0.754-0.276c0.437-2.93,0.214-5.209-0.005-7.897c0.881-0.174,1.708-0.417,2.44-0.731C22.194,17.883,22.503,20.076,21.476,22.892zM11.338,9.512c0.525,0.173,1.092-0.109,1.268-0.633h-0.002l0.771-2.316h4.56l0.771,2.316c0.14,0.419,0.53,0.685,0.949,0.685c0.104,0,0.211-0.017,0.316-0.052c0.524-0.175,0.808-0.742,0.633-1.265l-1.002-3.001c-0.136-0.407-0.518-0.683-0.945-0.683h-6.002c-0.428,0-0.812,0.275-0.948,0.683l-1,2.999C10.532,8.77,10.815,9.337,11.338,9.512z';

var Gear = 'M26.834,14.693c1.816-2.088,2.181-4.938,1.193-7.334l-3.646,4.252l-3.594-0.699L19.596,7.45l3.637-4.242c-2.502-0.63-5.258,0.13-7.066,2.21c-1.907,2.193-2.219,5.229-1.039,7.693L5.624,24.04c-1.011,1.162-0.888,2.924,0.274,3.935c1.162,1.01,2.924,0.888,3.935-0.274l9.493-10.918C21.939,17.625,24.918,16.896,26.834,14.693z';



/**
 * @name GridLayout
 * @class Grid layout implementation that lays out the element's
 * children in a grid and resizes each of them to the same size. This
 * layout can be configured to work with a certain number of columns
 * and rows.
 *
 * @example
 * // This example shows how to create a Shape
 * // with a 2x2 grid layout.
 *
 * var Shape = Ds.Shape.extend({
 *  figure: {
 *      ...
 *  },
 *  children: [ ... ],
 *  layout: {
 *      type: 'grid',
 *      columns: 2,
 *      rows: 2,
 *      marginHeight: 10,
 *      marginWidth: 10,
 *      hgap: 5,
 *      vgap: 5,
 *      columnsEqualWidth: true
 *  }
 * });
 *
 * @augments Layout
 *
 *
 */

var GridLayout = Layout.extend(/** @lends GridLayout.prototype */ {

    constructor: function(shape, attributes) {
        if (!attributes) attributes = {};
        Layout.apply(this, [shape, attributes]);

        this.columns = attributes.columns || 1;
        this.rows = attributes.rows || 0;
        this.marginHeight = attributes.marginHeight || 0;
        this.marginWidth = attributes.marginWidth || 0;
        this.vgap = attributes.vgap || 0;
        this.hgap = attributes.hgap || 0;
        this.columnsEqualWidth = attributes.columnsEqualWidth || false;
    },

    /**
     * @private
     */

    getRows: function() {
        var elements = this.shape.children;
        var columns = this.columns || elements.length;

        if (this.rows > 0)
            return this.rows;
        else
            return Math.floor((elements.length + columns - 1) / columns);
    },

    getColumns: function() {
        var elements = this.shape.children;

        if (this.rows > 0)
            return Math.floor((elements.length + this.rows - 1) / this.rows);
        else
            return this.columns;
    },

    /**
     * Executes the layout algorithm
     */

    layout: function() {
        if (!this.shape.children || !this.shape.children.length) return;

        _.each(this.computeRows('preferred'), function(row) {
            _.each(row.cells, function(cell) { cell.layout(); });
        }, this);
    },

    /**
     * @private
     */

    computeRows: function(type) {
        var bounds = this.shape.bounds();
        var columns = this.getColumns();
        var elements = this.shape.children;

        var rows = [];
        var current = { width: 0, height: 0, cells: [] };
        var previousCell;
        rows.push(current);

        // create the rows and cells
        for (var i = 0, j = 1; i < elements.length; i++, j++) {
            var shape = elements[i];
            var cell = new GridCell({ shape: shape, grid: this });
            cell.size = elements[i][type + 'Size']();
//            cell.size = elements[i].bounds();

            if (previousCell) {
                cell.previous = previousCell;
                previousCell.next = cell;
            }
            previousCell = cell;
            if (!shape.gridData || !(shape.gridData instanceof GridData)) {
                shape.gridData = new GridData(shape.gridData);
                shape.gridData.grid = cell.grid;
            }
            current.cells.push(cell);

            if (j >= columns) {
                if (i != elements.length - 1) {
                    var next = { previous: current, width: 0, height: 0, cells: [] };
                    current.next = next;
                    current = next;
                    rows.push(current);
                }
                j = 0;
            }
        }

        var marginWidth = this.marginWidth;
        var marginHeight = this.marginHeight;
        var createColumns = function() {
            var cols = [];
            for (var i = 0; i < columns; i++) {
                cols.push([]);
                for (var j = 0; j < rows.length; j++) {
                    var c = rows[j].cells[i];
                    if (c) cols[i].push(c);
                }
            }
            return cols;
        };

        var remainingHeightSpace = function(column) {
            var noGrabHeight = _.reduce(column, function(memo, cell) {
                if (cell.shape.gridData.grabExcessVerticalSpace)
                    return memo;
                else return memo + cell.size.height;
            }, 0);
            var nbGrabCells = _.reduce(column, function(memo, cell) {
                if (cell.shape.gridData.grabExcessVerticalSpace)
                    return memo + 1;
                else return memo;
            }, 0);
            return (bounds.height - (marginHeight * 2) - noGrabHeight) / nbGrabCells;
        };

        // adds witdh of all cells that are not grabExcessHorizontalSpace and
        //
        var remainingWidthSpace = function(row) {
            var noGrabCellWidth = _.reduce(row.cells, function(memo, cell) {
                if (cell.shape.gridData.grabExcessHorizontalSpace)
                    return memo;
                else return memo + cell.size.width;
            }, 0);
            var nbGrabCells = _.reduce(row.cells, function(memo, cell) {
                if (cell.shape.gridData.grabExcessHorizontalSpace)
                    return memo + 1;
                else return memo;
            }, 0);

            var remaining = (bounds.width - (marginWidth * 2) - noGrabCellWidth) / nbGrabCells;
            //console.log(remaining, noGrabCellWidth, bounds.width, (bounds.width - (marginWidth * 2) - noGrabCellWidth), nbGrabCells);

            return remaining;
        };

        // computes rows and cells position and sizes

        var baseX = bounds.x + this.marginWidth,
            y = bounds.y + this.marginHeight,
            x = baseX, size;

        _.each(createColumns(), function(column) {
            var remainingHeight = remainingHeightSpace(column);
            _.each(column, function(cell) {
                if (cell.shape.gridData.grabExcessVerticalSpace)
                    cell.height = remainingHeight;
                else cell.height = cell.size.height;
            }, this);
            // column.cell.height = _.max(row.cells, function(cell) { return cell.size.height; }).height;
        }, this);

        _.each(rows, function(row) {
            var remainingWidth = remainingWidthSpace(row);
            _.each(row.cells, function(cell) {
                cell.x = x;
                cell.y = y;

                if (this.columnsEqualWidth)
                    cell.width = bounds.width / columns;
                else
                    if (cell.shape.gridData.grabExcessHorizontalSpace) {
                        //console.log(remainingWidthSpace < cell.size.width, remaining, cell.size.width);
                        cell.width = remainingWidth;
                    } else cell.width = cell.size.width;

                row.width += cell.width;
                x += cell.width + this.hgap;
            }, this);

            var max = _.max(row.cells, function(cell) { return cell.height; });
            row.height = max ? max.height : 0;
            y += row.height + this.vgap;
            x = baseX;

        }, this);

        return rows;
    },

    /**
     * Returns the size of the element associated to the layout
     */

    size: function(type) {
        var width = 0, height = 0,
            elements = this.shape.children,
            columns = this.getColumns(),
            nbrows = this.getRows(),
            bounds = this.shape.bounds(),
            size;

        var rows = this.computeRows(type);
        var max = _.max(rows, function(row) { return row.width; });
        width = max ? max.width : 0;
        height = _.reduce(rows, function(memo, row) { return memo + row.height; }, 0);
        width = width + ((columns - 1) * this.hgap) + (this.marginWidth * 2);
        height = height + ((nbrows - 1) * this.vgap) + (this.marginHeight * 2);

        var min = this.shape.figure.minimumSize();
        width = Math.max(min.width, width);
        height = Math.max(min.height, height);

        if (bounds.width > width) width = bounds.width;
        if (bounds.height > height) height = bounds.height;

        return { width: width, height: height };
    },

    preferredSize: function() {
        return this.size('preferred');
    },

    minimumSize: function() {
        return this.size('minimum');
    },

    maximumSize: function() {
        return this.size('maximum');
    }

});

var GridCell = function(attributes) {
    if (!attributes) attributes = {};
    this.shape = attributes.shape;
    this.grid = attributes.grid;
    this.x = attributes.x;
    this.y = attributes.y;

    // width is the element width + hgap
    // or the computed width if columnsEqualWidth.
    if (this.grid.columnsEqualWidth) {
        this.width = this.grid.columnWidth;
    } else {
        this.width = this.shape.get('width');
    }
    // height should be max height in a row
    this.height = this.shape.get('height');
};

GridCell.prototype.layout = function() {
    this.shape.set(this.align());
    this.shape.doLayout();
};

GridCell.prototype.align = function() {
    var gridData = this.shape.gridData,
        halign = gridData.horizontalAlignment,
        valign = gridData.verticalAlignment,
        x = this.x,
        y = this.y,
        width = this.shape.get('width'),
        height = this.shape.get('height');

    if (halign === 'fill') width = this.width;
    if (valign === 'fill') height = this.height;

    if (halign === 'center') {
        x = x + (this.width / 2) - (width / 2);
    }
    if (valign === 'center') {
        y = y + (this.height / 2) - (height / 2);
    }
    if (halign === 'end') {
        x = (x + (this.width)) - width;
    }
    if (valign === 'end') {
        y = (y + (this.height)) - height;
    }

    return { x: x, y: y, width: width, height: height };
};

/**
 *  @class
 *  @name GridData
 *
 *  - verticalAlignment = 'center' | 'fill' | 'beginning' | 'end'
 *  - horizontalAlignment = 'beginning' |  'fill' | 'center' | 'end'
 *  - grabExcessVerticalSpace = false | true
 *  - grabExcessHorizontalSpace = false | true
 *  - verticalSpan = 1
 *  - horizontalSpan = 1
 */
var GridData = Ds.GridData = function(attributes) {
    if (!attributes) attributes = {};
    this.grid = attributes.grid;
    this.verticalAlignment = GridData.getVerticalAlignment(attributes);
    this.horizontalAlignment = GridData.getHorizontalAlignment(attributes);
    this.grabExcessVerticalSpace = attributes.grabExcessVerticalSpace || false;
    this.grabExcessHorizontalSpace = attributes.grabExcessHorizontalSpace || false;
    this.verticalSpan = attributes.verticalSpan || 1;
    this.horizontalSpan = attributes.horizontalSpan || 1;
};

GridData.alignments = [ 'center', 'fill', 'beginning', 'end' ];

GridData.getAlignment = function(attributes, type) {
    var alignment = attributes[type + 'Alignment'];
    if (_.contains(GridData.alignments, alignment))
        return alignment;
    return null;
};

GridData.getVerticalAlignment = function(attributes) {
    return GridData.getAlignment(attributes, 'vertical') || 'center';
};

GridData.getHorizontalAlignment = function(attributes) {
    return GridData.getAlignment(attributes, 'horizontal') || 'beginning';
};


/**
 * @name FlowLayout
 * @class Flow Layout implementation that lays out the element's
 * children on a row. If the children do not fit in the current row,
 * additional rows are created.
 * @augments Layout
 *
 */

var FlowLayout = Layout.extend(/** @lends FlowLayout.prototype */ {

    constructor: function(shape, attributes) {
        if (!attributes) attributes = {};
        Layout.apply(this, [shape, attributes]);
        this.vertical = attributes.vertical;
    },

    /**
     * Executes the layout algorithm
     */

    layout: function() {
        var offset = { x: this.shape.get('x'), y: this.shape.get('y') },
            bounds = this.shape.bounds(),
            elements = this.shape.children,
            elementSize,
            currentRow = [],
            rowSize = { width: 0, height: 0 };

        var align = function(row, off, eSize, pSize) {
            var position = { x: off.x, y: off.y },
                i = 0,
                length = row.length;

            position.x += (pSize.width - rowSize.width) / 2;

            for (; i<length; i++) {
                position.y = off.y;
                row[i].set(position);
                row[i].doLayout();
                position.x += row[i].bounds().width;
            }
        };

        _.each(elements, function(e) {
            elementSize = e.preferredSize();

            if ((rowSize.width + elementSize.width) > bounds.width) {
                align(currentRow, rowSize, bounds);
                currentRow = [];
                // new column
                offset.y += elementSize.height;
                rowSize.width = 0;
                rowSize.height = 0;
            }

            rowSize.height = Math.max(rowSize.height, elementSize.height);
            rowSize.width += elementSize.width;
            e.set(elementSize);
            currentRow.push(e);
        });

        align(currentRow, offset, elementSize, bounds);
    },

    /**
     * Returns the size of the element associated to the layout
     */

    size: function() {
        var bounds = this.shape.bounds(),
            elements = this.shape.children,
            i = 0,
            width = 0,
            height = 0,
            first = false,
            tSize,
            type = 'preferred';

        if (!elements || !elements.length)
            return { width: bounds.width, height: bounds.height };

        for (; i < elements.length; i++) {
            tSize = elements[i][type+'Size']();
            height = Math.max(height, tSize.height);
            width += tSize.width;
        }

        if (width < bounds.width) {
            width = bounds.width;
        }
        if (height < bounds.height) {
            height = bounds.height;
        }

        return { width: width, height: height };
    }

});


/**
 * @name XYLayout
 * @class A XYLayout implementation
 * @augments Layout
 *
 */

var XYLayout = Layout.extend(/** @lends XYLayout.prototype */ {

    constructor: function(shape, attributes) {
        if (!attributes) attributes = {};
        Layout.apply(this, [shape, attributes]);
    },

    /**
     * Executes the layout algorithm
     */

    layout: function() {
        var shape = this.shape,
            bounds = shape.bounds(),
            elements = shape.children,
            l = elements.length, i = 0, el;

        for (; i < l ; i++) {
            el = elements[i];
            el.figure.translate(bounds.x, bounds.y);
            el.doLayout();
        }
    },

    /**
     * Returns the size of the element associated with the layout
     */

    minimumSize: function() {
        return this.shape.figure.bounds();
    },

    preferredSize: function() {
        return this.shape.figure.bounds();
    },

    maximumSize: function() {
        return this.shape.figure.bounds();
    }

});



/**
 * @name BorderLayout
 * @class Border Layout implementation that lays out the element's children in five different
 * regions (north, west, center, east, south).
 * @augments Layout
 *
 */
var BorderLayout = Layout.extend(/** @lends BorderLayout.prototype */ {

    constructor: function(shape, attributes) {
        if (!attributes) attributes = {};
        Layout.apply(this, [shape, attributes]);
        this.vgap = attributes.vgap || 0;
        this.hgap = attributes.hgap || 0;
    },

    /**
     * Executes the layout algorithm
     */

    layout: function() {
        var bounds = this.shape.bounds();
        var top = bounds.y;
        var bottom = bounds.bottomLeft.y;
        var left = bounds.xLeft;
        var right = bounds.xRight;
        var tmpSize;

        if (this.north) {
            tmpSize = this.north.preferredSize();
            this.north.set({ x: left, y: top, width: right - left, height: tmpSize.height });
            this.north.doLayout();
            top += tmpSize.height + this.vgap;
        }

        if (this.south) {
            tmpSize = this.south.preferredSize();
            this.south.set({ x: left, y: bottom - tmpSize.height, width: right - left, height: tmpSize.height });
            this.south.doLayout();
            bottom -= tmpSize.height + this.vgap;
        }

        if (this.east) {
            tmpSize = this.east.preferredSize();
            this.east.set({ x: right - tmpSize.width, y: top, width: tmpSize.width, height: bottom - top });
            this.east.doLayout();
            right -= tmpSize.width + this.hgap;
        }

        if (this.west) {
            tmpSize = this.west.preferredSize();
            this.west.set({ x: left, y: top, width: tmpSize.width, height: bottom - top });
            this.west.doLayout();
            left += tmpSize.width + this.hgap;
        }

        if (this.center) {
            this.center.set({ x: left, y: top, width: right - left, height: bottom - top });
            this.center.doLayout();
        }
    },


    /**
     * Returns the size of the element associated to the layout
     */

    size: function() {
        return this.shape.bounds();
    }

});

/**
 * @name BoundBox
 * @class Displays the shape's bounds when the shape is moved or resized.
 * @augments DiagramElement
 */

Ds.BoundBox = Ds.DiagramElement.extend(/** @lends BoundBox.prototype */ {

    constructor: function(attributes) {
        Ds.DiagramElement.apply(this, [attributes]);
        this.control = attributes.control;
        this.control.on('start:move', this.stateMove, this);
        this.control.on('start:resize', this.stateSize, this);
        this.control.on('end:move end:resize', this.stateNone, this);
    },

    stateMove: function() {
        this.state = 'move';
        this._left = 'x';
        this._right = 'y';
    },

    stateSize: function() {
        this.state = 'resize';
        this._left = 'width';
        this._right = 'height';
    },

    stateNone: function() {
        delete this.state;
    },

    render: function() {
        this.remove();

        var paper = this.control.paper();
        var bounds = this.control.bounds();
        var x = bounds.xRight + 15;
        var y = bounds.yMiddle;

        this.text = paper.text(x, y, this.getText());

        var width = this.text.getABox().width;
        this.text.translate(width / 2 + 10, 10);

        this.shadow = paper.rect(x, y, width + 20, 20);
        this.shadow.attr({ fill: 'black', opacity: 0.2, stroke: 'none' });
        this.shadow.translate(2, 2);
        this.wrapper = paper.rect(x, y, width + 20, 20);
        this.wrapper.attr({ fill: '#FFFF99', opacity: 1, stroke: 'none' });

        this.text.toFront();

        return this;
    },

    remove: function() {
        if (!this.wrapper) return;

        this.wrapper.remove();
        this.shadow.remove();
        this.text.remove();
    },

    getText: function() {
        return this.getTemplate()({
            left: this.control.get(this._left),
            right: this.control.get(this._right)
        });
    },

    getTemplate: function() {
        if (this.state === 'move')
            return _.template('x: <%= left %>px y: <%= right %>px');
        else if (this.state === 'resize')
            return _.template('width: <%= left %>px  height: <%= right %>px');
        else
            return null;
    }

});


Ds.Selectable = {

    anchors: [
        'NorthAnchor', 'NorthEastAnchor', 'NorthWestAnchor',
        'SouthAnchor', 'SouthEastAnchor', 'SouthWestAnchor',
        'EastAnchor', 'WestAnchor'
    ],

    createAnchor: function(type) {
        return new Ds[type]({ box: this }).render();
    },

    createSelectionBox: function() {
        var bbox = this.figure.bounds();
        var x = bbox.x;
        var y = bbox.y;
        var width = bbox.width;
        var height = bbox.height;

        this.selectionBox = this.paper().rect(x, y, width, height, 0);
        this.selectionBox.attr(this.selectionStyle);
        this.selectionBox.toFront();
    },

    select: function() {
        if (!this.figure) return;

        this.diagram.setSelection(this);
        this.createSelectionBox();
        this.selectionAnchors =_.map(this.anchors, this.createAnchor, this);
    },

    deselect: function() {
        if (this._tool) {
            this._tool.remove();
        }
        if (this.selectionAnchors) {
            _.each(this.selectionAnchors, function( anchor ) { anchor.remove(); });
        }
        if (this.selectionBox) {
            this.selectionBox.remove();
        }
    }
};



/**
 * @name Anchor
 * @class Abstract representation of a resize box
 * @augments DiagramElement
 *
 */

var Anchor = Ds.Anchor = Ds.DiagramElement.extend( /** @lends Anchor.prototype */ {
    cursor: 'none',

    constructor: function(attributes) {
        Ds.DiagramElement.apply(this, [attributes]);

        this.box = attributes.box;
        this.diagram = this.box.diagram;

        this.initialize.apply(this, arguments);
    },

    initialize: function(attributes) {},

    /**
     * Renders the anchor on the canvas
     */

    render: function() {
        var paper = this.paper();
        this.wrapper = paper.rect(this.x, this.y, 6, 6, 0)
            .attr(this.box.anchorStyle);

        if (this.box.resizable) {
            this.wrapper.attr({ cursor: this.cursor });
        }

        this.wrapper.box = this.box;
        this.wrapper.anchor = this;

        if (this.box.resizable) {
            this.wrapper.drag(Anchor.move, Anchor.start, Anchor.end);
        }

        return this;
    },

    hide: function() {
        if (this.wrapper) this.wrapper.hide();
    },

    /**
     * Removes the anchor from the canvas
     */

    remove: function() {
        if (this.wrapper) {
            this.wrapper.remove();
        }
        if (this.box) {
            var box = this.box;
            this.box = null;
            if (box.anchor) {
                delete box.anchor;
            }
        }
    }

});

Anchor.start = function() {
    var current = this.anchor;
    var control = this.box;

    current.active = true;
    this.o();
    this.box.figure.wrapper.o();
    control.startResize();
};

Anchor.move = function( dx, dy, mx, my, eve ) {
    var control = this.box,
        direction = this.anchor.direction;

    this.attr( { x: this.ox + dx, y: this.oy + dy } );
    control.resize(dx, dy, direction);
};

Anchor.end = function() {
    var current = this.anchor;
    var control = this.box;

    current.active = false;
    control.endResize();
    current.box.select();
};

/**
 * @name NorthWestAnchor
 * @class
 * @augments Anchor
 *
 */

Ds.NorthWestAnchor = Anchor.extend({

    initialize: function( properties ) {
        var bbox = properties.box.figure.bounds();
        this.x = bbox.x - 3;
        this.y = bbox.y - 3;
        this.cursor = 'nw-resize';
        this.direction = 'nw';
    }

});

/**
 * @name SouthWestAnchor
 * @class
 * @augments Anchor
 *
 */

Ds.SouthWestAnchor = Anchor.extend({

    initialize: function( properties ) {
        var bbox = properties.box.figure.bounds();
        this.x = bbox.xLeft - 3;
        this.y = bbox.yBottom - 3;
        this.cursor = 'sw-resize';
        this.direction = 'sw';
    }

});

/**
 * @name NorthEastAnchor
 * @class
 * @augments Anchor
 *
 */

Ds.NorthEastAnchor = Anchor.extend({

    initialize: function( properties ) {
        var bbox = properties.box.figure.bounds();
        this.x = bbox.xRight - 3;
        this.y = bbox.y - 3;
        this.cursor = 'ne-resize';
        this.direction = 'ne';
    }

});

/**
 * @name SouthEastAnchor
 * @class
 * @augments Anchor
 *
 */

Ds.SouthEastAnchor = Anchor.extend({

    initialize: function( properties ) {
        var bbox = properties.box.figure.bounds();
        this.x = bbox.xRight - 3;
        this.y = bbox.yBottom - 3;
        this.cursor = 'se-resize';
        this.direction = 'se';
    }

});

/**
 * @name NorthAnchor
 * @class
 * @augments Anchor
 *
 */

Ds.NorthAnchor = Anchor.extend({

    initialize: function( properties ) {
        var bbox = properties.box.figure.bounds();
        this.x = bbox.xCenter - 3;
        this.y = bbox.y - 3;
        this.cursor = 'n-resize';
        this.direction = 'n';
    }

});

/**
 * @name SouthAnchor
 * @class
 * @augments Anchor
 *
 */

Ds.SouthAnchor = Anchor.extend({

    initialize: function( properties ) {
        var bbox = properties.box.figure.bounds();
        this.x = bbox.xCenter - 3;
        this.y = bbox.yBottom - 3;
        this.cursor = 's-resize';
        this.direction = 's';
    }

});

/**
 * @name WestAnchor
 * @class
 * @augments Anchor
 *
 */

Ds.WestAnchor = Anchor.extend({

    initialize: function( properties ) {
        var bbox = properties.box.figure.bounds();
        this.x = bbox.x - 3;
        this.y = bbox.yMiddle - 3;
        this.cursor = 'w-resize';
        this.direction = 'w';
    }

});

/**
 * @name EastAnchor
 * @class
 * @augments Anchor
 *
 */

Ds.EastAnchor = Anchor.extend({

    initialize: function( properties ) {
        var bbox = properties.box.figure.bounds();
        this.x = bbox.xRight - 3;
        this.y = bbox.yMiddle - 3;
        this.cursor = 'e-resize';
        this.direction = 'e';
    }

});





// LabelImage
//

var LabelImage = Ds.Image = Ds.DiagramElement.extend({

    constructor: function(attributes) {
        Ds.DiagramElement.apply(this, [attributes]);
    },

    render: function() {
        var paper = this.paper(),
            bBox = this.parent.wrapper.getBBox(),
            src = this.get('src'),
            width = this.get('width'),
            height = this.get('height');

        this.wrapper = paper.image(src, bBox.x, bBox.y, width, height);
        this.wrapper.toFront();
        this.wrapper.controller = this;

        return this;
    },

    center: function() {
        var ntbb = this.parent.wrapper.getABox();
        this.wrapper.attr({ x: ntbb.x - this.get('width') });
        this.wrapper.attr({ y: ntbb.yMiddle - (this.get('height') / 2) });
    }

});


/**
 * @name Label
 * @class Diagram Element that can display a text with an associated icon.
 * @augments LayoutElement
 *
 */

var Label = Ds.Label = Ds.LayoutElement.extend(/** @lends Label.prototype */ {
    resizable: false,
    editable: true,
    draggable: true,

    constructor: function(attributes) {
        if (!attributes) attributes = {};
        Ds.LayoutElement.apply(this, [attributes]);
        this.initProperties(attributes);
        var image = this.figure ? this.figure.image : attributes.figure.image;
        if (image) this.setImage(image);

        this.initialize(attributes);
    },

    /**
     * @private
     */

    initProperties: function(attributes) {
        var properties = ['resizable', 'editable', 'draggable'];
        var setBoolean = function(property) {
            if (_.isBoolean(attributes[property])) {
                this[property] = attributes[property];
            }
        };
        _.each(properties, setBoolean, this);
    },

    /**
    */

    setImage: function(attributes) {
        attributes.parent = this;
        var image = new Ds.Image( attributes );
        this.image = image;
        return image;
    },

    /**
     * Renders the Label on the canvas.
     */

    render: function() {
        this.figure.render();
        this.figure.toFront();

        if (this.image) this.image.render();
        if (this.editable) this.asEditable();
        if (this.draggable) this.figure.asDraggable();

        return this;
    },

    /**
     * Sets the text. It will trigger a
     * change:text event unless the silent
     * argument is set to false.
     *
     * @param {string} text
     * @param {boolean} silent event
     */

    setText: function(text, silent) {
        this.set('text', text);
        this.doLayout();
        if (!silent) this.trigger('change:text', this);
    },

    /**
     * Returns the text value.
     *
     * @return {string}
     */

    getText: function() {
        return this.get('text');
    },

    /**
     * Removes the Label from the canvas.
     */

    remove: function() {
        if (this.image) {
            this.image.remove();
        }
        if (this.figure) {
            this.figure.remove();
        }
    },

    removeContent: function() {},
    renderEdges: function() {},
    renderContent: function() {},

    doLayout: function() {
        if (this.figure) this.figure.layoutText();
    },

    toFront: function() {
        if (this.figure) this.figure.toFront();
        if (this.image) this.image.toFront();
    },

    preferredSize: function() {
        return {
            width: this.get('width'),
            height: this.get('height')
        };
    },

    minimumSize: function() {
        return this.figure.minimumSize();
    },

    /**
     * @private
     */

    asEditable: function() {
        var node = this;
        var diagram = node.diagram;
        var createInputTextForm = function(node) {
            var box = node.bounds(),
                px = node.diagram.el.offsetLeft,
                py = node.diagram.el.offsetTop,
                x = box.x + (isNaN(px) ? 0 : px),
                y = box.y + (isNaN(py) ? 0 : py),
                w = box.width,
                h = box.height,
                txt = node.textForm = document.createElement('form'),
                inputForm = document.createElement('input');

            txt.setAttribute('style', 'position: absolute; left: ' + x + 'px; top: ' + y + 'px;');
            inputForm.setAttribute('type', 'text');
            inputForm.value = node.getText() || '';
            inputForm.setAttribute('style', 'padding: 0; width:' + w + 'px; height: ' + h + 'px; z-index: 1;');
            txt.appendChild(inputForm);

            return { form: txt, input: inputForm };
        };
        var handleTextInput = function() {
            if (!node.el) return;
            var text = node.el.input.value;
            node.setText(text);
            node.domNode.removeChild(node.el.form);
            delete node.el;
            delete node.domNode;
            diagram.wrapper.toBack();
            diagram.off('click', handleTextInput);
        };
        node.on('dblclick', function() {
            var el = createInputTextForm( node );
            node.el = el;
            node.domNode = node.diagram.el.parentNode;
            node.domNode.appendChild(el.form);
            diagram.wrapper.toFront();
            diagram.on('click', handleTextInput);
        });
    }

});

_.extend(Ds.Label.prototype, Ds.Selectable, Ds.Resizable, Ds.Events);



/** @name Shape
 *  @class Represents a Shape
 *  @augments LayoutElement
 *
 *  @example
 *
 *  var BasicShape = Ds.Shape.extend({
 *      figure: {
 *          type: 'rect',
 *          width: 100,
 *          height: 100,
 *          fill: 'yellow'
 *      },
 *      layout: {
 *          type: 'flow',
 *          vertical: true
 *      },
 *      children: [{
 *          figure: {
 *              type: 'text',
 *              text: 'Label'
 *          }
 *      }]
 *  });
 */

var Shape = Ds.Shape = Ds.LayoutElement.extend(/** @lends Shape.prototype */ {
    /**
     * @property {boolean} connectable
     */
    connectable: true,
    /**
     * @property {boolean} shadow
     */
    showShadow: false,
    /**
     * @property {boolean} resizable
     */
    resizable: true,
    /**
     * @property {boolean} draggable
     */
    draggable: true,
    /**
     * @property {boolean} toolbox
     */
    showToolBox: true,
    /**
     * @property {boolean} boundBox
     */
    showBoundBox: true,

    constructor: function(attributes) {
        if (!attributes) attributes = {};
        Ds.DiagramElement.apply(this, [attributes]);

        this.ins = [];
        this.outs = [];

        if (_.isBoolean(attributes.draggable))
            this.draggable = attributes.draggable;
        if (_.isBoolean(attributes.resizable))
            this.resizable = attributes.resizable;
        if (_.isBoolean(attributes.showToolBox))
            this.showToolBox = attributes.showToolBox;
        if (_.isBoolean(attributes.showBoundBox))
            this.showBoundBox = attributes.showBoundBox;

        if (attributes.children) {
            this.children = attributes.children;
        }

        this.setUpChildren();
        this.setUpLayout(attributes);
        this.setUpStyles(attributes);
        this.setUpToolBox();
        this.setUpBoundBox();

        this.initialize.apply(this, arguments);

        if (this.diagram && !this.parent) {
            this.diagram.get('children').push(this);
            this.diagram.trigger('add:children', this);
        }
    },

    /**
     * @private
     */

    setUpToolBox: function(attributes) {
        if (this.showToolBox) {
            this.toolBox = new ToolBox({ element: this });
        }
    },

    setUpBoundBox: function() {
        if (this.showBoundBox) {
            this.boundBox = new Ds.BoundBox({ control: this });
        }
    },

    /**
     * @private
     */

    setUpStyles: function(attributes) {
        _.each(_.keys(Ds.Styles), function(style) {
            if (attributes[style]) {
                this[style] = _.clone(attributes[style]);
            } else {
                this[style] = _.clone(Ds.Styles[style]);
            }
        }, this);
    },

    /**
     * Renders the Shape
     */

    render: function() {
        if (this.layout) {
            this.set(this.layout.preferredSize());
        }
        this.figure.render();
        this.renderContent();

        this.on('click', this.select);
        this.on('click', this.showTool);
        this.on('mousedown', this.handleClick);
        this.on('mouseout', this.removeToolWhenOut);

        if (this.draggable) this.asDraggable();

        return this;
    },

    dragConnection: function(e, connectionType) {
        if (e) e.stopPropagation();
        if (!connectionType || typeof connectionType !== 'function') return;

        var me = this;
        me.connecting = true;
        var connection = new connectionType({ diagram: me.diagram });
        connection.connectByDragging(me, e);
        connection.render();
        var end = function() {
            me.connecting = false;
            connection.off('connect', end);
        };
        connection.on('connect', end);
    },

    /**
     * @private
     */

    showTool: function() {
        if (this._tool) this._tool.render();
    },

    /**
     * @private
     */

    removeToolWhenOut: function() {
        var me = this;
        // bug check something with children
        if (me.toolBox) {
            window.setTimeout(function(){
                if (me.toolBox && !me.toolBox.isOver)
                    me.toolBox.remove();
            }, 1000);
        }
    },

    /**
     * @param {Boolean} diagram - also removes from diagram.
     */

    remove: function(diagram) {
        this.deselect();

        this.figure.remove();
        _.each(this.children, function(c) { c.remove(); });
        _.each(this.ins, function(e) { e.remove(diagram); });
        _.each(this.outs, function(e) { e.remove(diagram); });

        // remove shadow if present.
        if (this.shadow) {
            this.shadowWrapper.remove();
            delete this.shadowWrapper;
        }

        if (this.selectionBox) {
            this.selectionBox.remove();
        }

        // remove toolbox if present.
        if (this.toolBox) {
            this.toolBox.remove();
            delete this.toolBox;
        }

        if (diagram) {
            this.diagram.removeShape(this);
        }
    },

    /**
     * Disconnect a connection from the shape
     *
     * @param Connection
     * @param String
     */

    disconnect: function(connection, direction) {
        if (!connection) return this;

        if (direction && (direction === 'in' || direction === 'out')) {
            this[direction+'s'] = _.without(this[direction+'s'], connection);
        } else {
            this.ins = _.without(this.ins, connection);
            this.outs = _.without(this.outs, connection);
        }

        return this;
    },


    canAdd: function(fn) {
        if (typeof fn !== 'function') return false;
        if (!this.accepts) return false;

        var dummy = new fn({});
        return _.some(this.accepts, function(a) { return dummy instanceof a; });
    },

    canConnect: function(connection) {
        return true;
    },

    /**
     * Add a child Shape
     *
     * @param Shape
     */

    add: function(shape) {
        shape.setParent(this);
        this.children.push(shape);
        this.trigger('add:children', shape);
        return this;
    },

    /**
     * Returns the JSON representation of the Shape
     *
     * @return JSONObject
     */

    toJSON: function() {
        return _.clone(this.attributes);
    },

    /**
     * @private
     */

    setUpLayout: function(attributes) {
        this.layout = Layout.create(this, attributes);
    },

    /**
     * @private
     */

    setUpChildren: function() {
        var children = this.children,
            shape;

        this.children = [];

        _.each(children, function(child) {
            if (isLabel(child)) {
                shape = new Label(child);
            } else if (isImage(child)) {
                shape = new Ds.Image(child);
            } else if (typeof child === 'function') {
                shape = new child({ parent: this });
            } else if (typeof child === 'object') {
                shape = new Shape(child);
            }
            if (shape) this.add(shape);
        }, this);
    },

    /**
     * @private
     */

    removeContent: function() {
        _(this.children).each(function(c) { c.remove(); });
    },

    /**
     * @private
     */

    renderContent: function() {
        _(this.children).each(function(c) {
            c.render();
        });
        if (!this.parent) { this.doLayout(); }
    },

    /**
     * @private
     */

    renderEdges: function() {
        _(this.ins).each(function(i) { i.render(); });
        _(this.outs).each(function(o) { o.render(); });
    },


    asDraggable: function() {
        if (this.figure) this.figure.asDraggable();
        return this;
    }

});

/**
 * @name Resizable
 * @class
 */

Ds.Resizable = {

     /**
     * @private
     */

    startResize: function() {
        if (this.toolBox) this.toolBox.remove();
        if (this.shadow) this.shadowWrapper.remove();

        _.each(this.selectionAnchors, function( anchor ) {
            if (anchor.active) anchor.hide(); else anchor.remove();
        });
        this.removeContent();

        if (this.figure) this.figure.startResize(this.resizeStyle);

        this.trigger('start:resize');
    },

    /**
     * Resizes the Shape by the given factors and direction
     *
     * @example
     *
     * var s = new BasicShape({ ... });
     * // will resize the shape by 10 on y coordinates
     * s.resize(0, 10);
     *
     *
     * @param Integer dx
     * @param Integer dy
     * @param String direction
     */

    resize: function(dx, dy, direction) {
        if (!this.resizable) return this;
        if (this.figure) this.figure.resize(dx, dy, direction);
        if (this.boundBox) this.boundBox.render();
        this.renderEdges();

        return this;
    },

    /**
     * @private
     */

    endResize: function() {
        if (this.figure) this.figure.endResize();

        this.renderContent();

        if (this.shadow) this.createShadow();
        if (this.boundBox) this.boundBox.remove();

        this.trigger('end:resize');
    }

};

_.extend(Ds.Shape.prototype, Ds.Selectable, Ds.Resizable, Ds.Events);


Ds.arrows = {

    none: function( size ) {
        if (!size) {
            size = 2;
        }
        return {
            path: 'M'+size+',0L'+(-size)+',0',
            dx: size,
            dy: size,
            attr: {
                opacity: 0
            }
        };
    },

    basic: function( p, size ) {
        if (!size) {
            size = 4;
        }
        return {
            path: [
                'M',size.toString(),'0',
                'L',(-size).toString(),(-size).toString(),
                'L',(-size).toString(),size.toString(),'z'
            ],
            dx: size,
            dy: size,
            attr: {
                stroke: 'black',
                fill: 'black'
            }
        };
    }
};



/**
 * @name ConnectionAnchor
 * @class Represents a connection anchor
 * @augments DiagramElement
 */

var ConnectionAnchor = Ds.ConnectionAnchor = Ds.DiagramElement.extend(/** @lends ConnectionAnchor.prototype */ {

    constructor: function(attributes) {
        Ds.DiagramElement.apply(this, [attributes]);

        this.connection = attributes.connection;
        this.diagram = this.connection.diagram;
    },

    bounds: function() {
        if (this.wrapper)
            return this.wrapper.getABox();
        else return null;
    },

    position: function() {
        if (this.connection.get('sourceAnchor') === this)
            return 'source';
        else return 'end';
    },

    /**
     * Moves the connection anchor to the given point
     *
     * @param {Point} point
     */

    move: function(point) {
        this.x = point.x;
        this.y = point.y;
        if (this.wrapper) {
            this.wrapper.attr({ x: this.x - 2, y: this.y - 2 });
        }
        return this;
    },

    /**
     * Renders the connection anchor on the canvas
     */

    render: function() {
        if (this.wrapper) return this;

        var paper = this.paper();
        this.wrapper = paper.rect( this.x - 3, this.y - 3, 6, 6 );
        this.wrapper.attr({ fill: 'black', stroke: 'none' });
        this.wrapper.anchor = this;
        this.asDraggable();

        return this;
    },

    /**
     * Removes the connection anchor from the canvas
     */

    remove: function() {
        if (this.wrapper) this.wrapper.remove();
    },

    getConnectableElement: function() {
        var anchor = this;
        var wrapper = this.wrapper;
        var connection = this.connection;
        var foundShapes = this.diagram.getShapesByPoint(this.x, this.y);

        var connectable = function(memo, shape) {
            if (connection.canConnect(shape, anchor.position()))
                memo.push(shape);
            return memo;
        };
        var connectables = _.reduceRight(foundShapes, connectable, []);

        return connectables.length ? connectables[0] : null;
    },

    establishConnection: function(shape) {
        var anchor = this;
        var wrapper = this.wrapper;
        var isTarget;

        if (shape) anchor.shape = shape;
        anchor.connection.state = null;

        if (this.position() === 'end') {
            anchor.connection.connect( anchor.connection.get('sourceAnchor').shape, anchor.shape );
        } else {
            anchor.connection.connect( anchor.shape, anchor.connection.get('targetAnchor').shape );
        }
        anchor.connection.render();
    },

    asDraggable: function() {

        var move = function( dx, dy ) {
            this.attr({ x: this.ox + dx, y: this.oy + dy });
            this.anchor.connection.state = 'dragging';
            this.anchor.connection.dragger = this.anchor;
            this.anchor.connection.render();
        };

        var start = function() {
            this.o();
            this.anchor.shape.disconnect( this.anchor.connection );
        };

        var end = function() {
            var shape = this.anchor.getConnectableElement();
            if (shape) this.anchor.establishConnection(shape);
        };

        this.wrapper.drag(move, start, end);

        return this;
    },

    attach: function( shape ) {
        var bounds = shape.bounds();
        if (bounds.xCenter && bounds.yMiddle) {
            this.x = bounds.xCenter;
            this.y = bounds.yMiddle;
        }
        this.shape = shape;
        return this;
    },

    hide: function() {
        if (this.wrapper) this.wrapper.hide();
        return this;
    },

    show: function() {
        if (this.wrapper) this.wrapper.show();
        return this;
    },

    toFront: function() {
        if (this.wrapper) this.wrapper.toFront();
        return this;
    },

    toBack: function() {
        if (this.wrapper) this.wrapper.toBack();
        return this;
    },

    /**
     * Returns the JSON representation
     */

    toJSON: function() {
        this.set('x', this.wrapper.x());
        this.set('y', this.wrapper.y());

        return this._deepClone(this.attributes);
    }

});


/*
 * @name ConnectionEnd
 * @class Represents a connection end
 *
 */

var ConnectionEnd = function( paper, point, angle, radians, attributes ) {
    this.paper = paper;
    this.point = point;
    this.angle = angle;
    this.radians = radians;
    this.attributes = {};
    this.attributes.attr = {};

    if (attributes) {
        this.attributes.type = attributes.type;
        var attrs = Raphael._availableAttrs;
        for (var key in attributes) {
            if (_.has(attrs, key)) {
                this.get('attr')[key] = attributes[key];
            }
        }
    }

    return this;
};

_.extend(ConnectionEnd.prototype, Ds.Element.prototype);

/**
 * Removes the ConnectionEnd from the canvas
 */

ConnectionEnd.prototype.remove = function() {
    if (this.wrapper) {
        this.wrapper.remove();
    }
};

/**
 * Renders the ConnectionEnd on the canvas
 */

ConnectionEnd.prototype.render = function() {
    var type = this.get('type');
    if (!type || type === 'none') {
        return this;
    }

    var arrow;
    if (typeof Ds.arrows[type] === 'function') {
        arrow = Ds.arrows[type]( this.point );
    } else {
        arrow = Ds.arrows.basic( this.point );
    }

    // Don't ask.
    var x = this.point.x + (-1.5 * (arrow.dx - 1) * Math.cos(this.radians));
    var y = this.point.y + (1.5 * (arrow.dy - 1) * Math.sin(this.radians));

    this.wrapper = this.paper.path( arrow.path.join(' ') );

    this.wrapper.attr( arrow.attr );
    this.wrapper.attr( this.get('attr') );
    this.wrapper.translate( x, y );
    this.wrapper.rotate( this.angle );

    return this;
};


/**
 * @name ConnectionLabel
 * @class Represents a label associated to a connection
 * @augments DiagramElement
 */

var ConnectionLabel = Ds.ConnectionLabel = Ds.DiagramElement.extend(/** @lends ConnectionLabel.prototype */ {

    constructor: function(attributes) {
        Ds.DiagramElement.apply(this, [attributes]);

        if (!attributes.connection) {
            throw new Error('ConnectionLabel must have a parent Connection');
        }

        this.connection = attributes.connection;
        this.diagram = this.connection.diagram;
        this.position = attributes.position;

        this.set('text', attributes.text);
    },

    /**
     * Removes the label from the canvas
     */

    remove: function() {
        if (this.wrapper) this.wrapper.remove();
    },

    /**
     * Renders the label on canvas
     */

    render: function() {
        this.remove();
        var paper = this.paper(),
            connection = this.connection,
            wrapper = this.wrapper = paper.text(0, 0, this.get('text'));

        var positionRelativeToShape = function( wrapper, sbox, x, y ) {
            // Determine position of shape relative to the anchor.
            var isLeft = sbox.xCenter < x;
            var isTop = sbox.yMiddle > y;

            var box = wrapper.getBBox();
            var xOffset = isLeft ? (10 + (box.width / 2)) : (10 - box.width);
            var yOffset = isTop ? -10 : 10;

            return { x: x + xOffset, y: y + yOffset };
        };

        var placeLabelEnd = function() {
            var anchor = connection.get('targetAnchor'),
                sbox = anchor.shape.bounds();
                abox = anchor.bounds(),
                x = abox.xCenter,
                y = abox.yMiddle;

            var r = Math.sqrt((x * x) + (y * y));
            var theta = Math.atan(y / x);

            return positionRelativeToShape( wrapper, sbox, x, y);
        };

        var placeLabelStart = function() {
            var anchor = connection.get('sourceAnchor'),
                sbox = anchor.shape.bounds(),
                abox = anchor.bounds(),
                x = abox.xCenter,
                y = abox.yMiddle;

            return positionRelativeToShape( wrapper, sbox, x, y);
        };

        var placeLabelMiddle = function() {
            var sa = connection.get('sourceAnchor'),
                ta = connection.get('targetAnchor'),
                sabox = sa.bounds(),
                tabox = ta.bounds(),
                x1 = sabox.xCenter,
                y1 = sabox.yMiddle,
                x2 = tabox.xCenter,
                y2 = tabox.yMiddle;

            var x = (x1 + x2) / 2;
            var y = (y1 + y2) / 2;

            y = y - 10;

            return { x: x, y: y };
        };

        var position;
        switch(this.position) {
            case 'start':
                position = placeLabelStart();
                break;
            case 'end':
                position = placeLabelEnd();
                break;
            default:
                position = placeLabelMiddle();
                break;
        }

        this.wrapper.transform(['t', position.x, ',', position.y].join('') );

        this.asEditable().asDraggable();

        return this;
    },

    /**
     * Changes the label's text. This method triggers the
     * change:text event.
     *
     * @param {string} text
     */

    setText: function(text) {
        this.set('text', text);
        this.trigger('change:text', text);

        if (this.wrapper) {
            this.wrapper.attr('text', text);
        }
    },

    /**
     * Sets the label as draggable
     */

    asDraggable: function() {
        var start = function() {
            this.o();
        };
        var end = function() {

        };
        var move = function( dx, dy, mx, my, ev ) {
            var x = this.ox + dx;
            var y = this.oy + dy;

            this.attr({ x: x, y: y });
        };

        if (this.wrapper) {
            this.wrapper.attr( {cursor: 'move'} );
            this.wrapper.drag( move, start, end );
        }

        return this;
    },

    /**
     * Sets the label as editable
     */

    asEditable: function() {
        var node = this;
        var diagram = this.connection.diagram;

        if (!node.wrapper) {
            return;
        }

        var createInputTextForm = function( label ) {
            var aBox = label.bounds();

            var diagram = label.connection.diagram;
            var px = diagram.canvas().offsetLeft;
            var py = diagram.canvas().offsetTop;

            var x = aBox.x + (isNaN(px) ? 0 : px);
            var y = aBox.y + (isNaN(py) ? 0 : py);

            var w = aBox.width + 20;
            var h = 20;

            var txt = document.createElement('form');
            txt.setAttribute('style', 'position: absolute; left: ' + x + 'px; top: ' + y + 'px;');

            var inputForm = document.createElement('input');
            inputForm.setAttribute('type', 'text');
            inputForm.setAttribute('placeholder', label.wrapper.attr('text'));
            inputForm.setAttribute('style', 'padding: 0; width:' + w + 'px; height: ' + h + 'px; z-index: 1;');
            txt.appendChild(inputForm);

            return {
                form: txt,
                input: inputForm
            };
        };

        var remove = function( node ) {
            if (node && node.parentNode) {
                node.parentNode.removeChild( node );
            }
        };

        node.wrapper.dblclick(function(event) {
            var ml = diagram.modifiedLabel;
            if (ml && ml !== node) {
                remove(diagram.inputText);
                remove(diagram.modifiedLabel.textForm);
            }

            if (node.textForm) {
                remove(node.textForm);
            }

            var el = createInputTextForm( node );

            node.textForm = el.form;
            diagram.inputText = el.input;
            diagram.modifiedLabel = node;

            diagram.canvas().parentNode.appendChild(el.form);
        });

        return this;
    }

});


/**
 * @name FlexPoint
 * @class Represents a flex point being part of a connection
 *
 */

function FlexPoint(connection, point) {
    this.connection = connection;
    this.paper = connection.paper();
    this.x = point.x;
    this.y = point.y;
}

/**
 * Renders the FlexPoint on the canvas
 */

FlexPoint.prototype.render = function() {
    this.remove();

    this.wrapper = this.paper.rect(this.x - 3, this.y - 3, 6, 6, 0);
    this.wrapper.attr({ fill: 'black', stroke: 'none', cursor: 'pointer' });

    this.drag();
    this.wrapper.toFront();

    return this;
};

/**
 * Removes the FlexPoint from the canvas
 */

FlexPoint.prototype.remove = function() {
    if (this.wrapper) this.wrapper.remove();
};

FlexPoint.prototype.drag = function() {
    if (!this.wrapper) return this;

    var point = this,
        connection = this.connection,
        move = function(dx, dy) {
            this.attr({ x: this.ox + dx, y: this.oy + dy });
            var box = this.getABox();
            point.x = box.center.x;
            point.y = box.center.y;
            connection.render();
        },
        start = function() {
            this.o();
            point.state = 'dragging';
            this.attr('cursor', 'move');
        },
        end = function() {
            delete point.state;
            connection.deselect();
        };

    this.wrapper.drag(move, start, end);
};


/**
 * @name Connection
 * @class Represents a connection between two shapes
 * @augments DiagramElement
 */

var Connection = Ds.Connection = Ds.DiagramElement.extend(/** @lends Connection.prototype */{
    toolbox: true,

    constructor: function(attributes) {
        Ds.DiagramElement.apply(this, [attributes]);

        this.set('sourceAnchor', new ConnectionAnchor({ connection: this }));
        this.set('targetAnchor', new ConnectionAnchor({ connection: this }));
        this.vertices = [];

        /*
        this.labels = _.map(this.labels || [], function(label) {
            return new ConnectionLabel({ connection: this,
                position: label.position,
                text: label.text
        });}, this);
        */
        this.labels = [];

        if (this.toolbox) this._tool = new ToolBox({ element: this });

        if (this.diagram) {
            this.diagram.get('edges').push(this);
            this.diagram.trigger('add:edges', this);
        }

        this.initialize.apply(this, arguments);
    },

    initialize: function() {},

    /**
     * Adds a FlexPoint at the given Point
     *
     * @param {Point}
     */

    addPoint: function(point) {
        var fp = new FlexPoint(this, point);
        this.vertices.push(fp);
        this.vertices = _.sortBy(this.vertices, function(v) { return v.x; });
        this.render();

        return this;
    },

    /**
     * Removes the connection from the canvas. if true is passed as
     * argument, also removes the connection from the diagram.
     *
     * @param {boolean} diagram - if true also removes from diagram
     *
     */

    remove: function(diagram) {
        if (this.wrapper) {
            this.unBindEvents();
            this.wrapper.remove();
            this.dummy.remove();
        }

        if (this.startArrow) this.startArrow.remove();
        if (this.endArrow) this.endArrow.remove();
        if (this._tool) this._tool.remove();
        if (this.labels) _.each(this.labels, function(l) { l.remove(); });

        _.each(this.vertices, function(v) {
            if (!v.state) v.remove();
        });

        if (diagram) {
            this.disconnect();
            this.get('sourceAnchor').remove();
            this.get('targetAnchor').remove();
            this.diagram.removeConnection(this);
        }

        this.off('click', this._handleClick);
        this.off('dblclick', this._createFlexPoint);

        return this;
    },

    renderConnectionEnd: function(boxes, points) {
        var paper = this.paper();
        var sbox = boxes[0];
        var tbox = boxes[1];
        var sPoint = points[0];
        var tPoint = points[1];
        var th;

        if (this.vertices.length) {
            th = Point.theta(this.vertices[this.vertices.length - 1], tbox.center);
        } else {
            th = Point.theta(sbox.center, tbox.center);
        }

        // angles for arrows
        var c1r = 360 - th.degrees + 180;
        var c2r = 360 - th.degrees;

        this.startArrow = new ConnectionEnd(paper, sPoint, c1r, th.radians, this.start);
        this.endArrow = new ConnectionEnd(paper, tPoint, c2r, th.radians, this.end);
        this.startArrow.render();
        this.endArrow.render();
    },

    renderAnchors: function(points) {
        var sPoint = points[0];
        var tPoint = points[1];

        this.get('sourceAnchor').move(sPoint).render().hide();
        this.get('targetAnchor').move(tPoint).render().hide();
    },

    /**
     * Creates the connection's path between the source and target anchors and the in
     * between flex points.
     *
     * @private
     */

    createPath: function() {
        var paths = path(this.get('sourceAnchor'), this.get('targetAnchor'), this.vertices, false),
            paper = this.paper();

        this.wrapper = paper.path(paths.join(' '));
        this.wrapper.attr(this.attributes);
        this.wrapper.controller = this;

        return paths;
    },

    /*
     * Creates a larger path on top of the connection's path to receive
     * user events.
     *
     * @private
     */

    createEventPath: function(paths) {
        var paper = this.paper();
        // Dummy is a larger line receiving clicks from users
        this.dummy = paper.path(paths.join(' '));
        this.dummy.connection = this;
        this.dummy.attr({ cursor: 'pointer', fill: 'none', opacity: 0, 'stroke-width': 8 });
    },

    _events: [
        'click', 'dblclick',
        'mouseover', 'mouseout'
    ],

    /**
     * @private
     */

    bindEvents: function() {
        var connection = this;
        var wrapper = this.dummy;
        var createHandler = function(eve) {
            return {
                eve: eve,
                handler: function(e) { connection.trigger(eve, e); }
            };
        };
        var bind = function(call) { wrapper[call.eve](call.handler); };

        this.eveHandlers = _.map(this._events, createHandler);
        _.each(this.eveHandlers, bind);
    },

    /**
     * @private
     */

    unBindEvents: function() {
        var wrapper = this.dummy;
        var unbind = function(call) { wrapper['un' + call.eve](call.handler); };

        _.each(this.eveHandlers, unbind);
        this.eveHandlers.length = 0;
    },

    /**
     * Renders the connection on canvas, will only render if the
     * source and target are set.
     */

    render: function() {
        var boxes = this.getBoxes();
        var points = this.getPoints(boxes);

        if (points.length !== 2) return this;

        this.remove();

        this.renderAnchors(points);
        this.createEventPath(this.createPath());
        this.renderConnectionEnd(boxes, points);
        this.bindEvents();

        this.on('click', this.showToolBox);
        this.on('click', this.select);
        this.on('dblclick', this.createFlexPoint);

        if (this.labels) _.each(this.labels, function(l) { l.render(); });

        return this;
    },

    showToolBox: function(e) {
        var tool = this._tool;
        var diagram = this.diagram;

        if (tool) tool.render();
    },

    createFlexPoint: function(e) {
        var point = Point.get(this.diagram, e);
        this.addPoint(point);
        this.select();
    },

    /**
     * Selects the connection. This method triggers a
     * select event
     */

    select: function() {
        this.diagram.setSelection(this);
        this.get('sourceAnchor').toFront().show();
        this.get('targetAnchor').toFront().show();
        _.each(this.vertices, function(v) { v.render(); });
        this.trigger('select');
    },

    /**
     * Deselects the connection. This method triggers a
     * deselect event
     */

    deselect: function() {
        this.get('sourceAnchor').toFront().hide();
        this.get('targetAnchor').toFront().hide();
        _.each(this.vertices, function(v) { v.remove(); });
        this.trigger('deselect');
    },

    /**
     * Connects the connection to a source and a target Shape. This
     * method triggers connect, connect:source and connect:target
     * events
     *
     * @param {Shape} source
     * @param {Shape} target
     */

    connect: function(src, tgt) {
        if (!src || !tgt) return this;

        this.set('source', src);
        this.set('target', tgt);

        this.get('sourceAnchor').attach( src );
        this.get('targetAnchor').attach( tgt );

        src.trigger('connect:source', this);
        tgt.trigger('connect:target', this);
        this.trigger('connect');

        src.outs.push(this);
        tgt.ins.push(this);

        return this;
    },

    /**
     * Disconnects the connection from it's source
     * and target shapes. This method triggers a disconnect
     * event
     */

    disconnect: function() {
        var source = this.get('source');
        var target = this.get('target');

        if (source) source.disconnect(this, 'out');
        if (target) target.disconnect(this, 'in');

        this.set('source', null);
        this.set('target', null);
        this.trigger('disconnect');

        return this;
    },

    connectByDragging: function(source, e) {
        var diagram = this.diagram;
        var paper = diagram.paper();
        var connection = this;
        var dragger = this.dragger = this.get('targetAnchor');
        var draggerPoint = Point.get(paper, e);

        this.set('source', source);
        this.get('sourceAnchor').attach(source);
        source.outs.push(this);

        this.state = 'dragging';
        this.dragger.move(draggerPoint);
        this.dragger.render();

        var onmove = function(e) {
            var point = Point.get(paper, e);
            dragger.move(point);
            connection.render();
        };
        var onup = function(e) {
            var underShape = dragger.getConnectableElement();
            if (underShape) {
                dragger.establishConnection(underShape);
                diagram.off('mouseup', onup);
                diagram.off('mousemove', onmove);
                diagram.wrapper.toBack();
            }
        };
        diagram.wrapper.toFront();
        diagram.on('mousemove', onmove);
        diagram.on('mouseup', onup);
    },

    canConnect: function(shape, position) {
        return true;
    },

    /**
     * Returns a JSON representation of the connection
     */

    toJSON: function() {
        var clone = {};
        clone.source = this.get('source').get('id');
        clone.target = this.get('target').get('id');
        clone.type = this.get('type');
        clone.id = this.get('id');
        clone.sourceAnchor = this.get('sourceAnchor');
        clone.targetAnchor = this.get('targetAnchor');
        clone.x = this.get('x');
        clone.y = this.get('y');

        if (this.wrapper) {
            clone.attr = this.wrapper.attr();
        }

        return clone;
    },

    // Returns the ABox of this source and target shapes, or if
    // during a drag state returns the dragged anchor ABox.

    getBoxes: function() {
        var paper = this.paper(),
        sbox, tbox;

        if (this.state === 'dragging') {
            if (this.dragger === this.get('sourceAnchor')) {
                sbox = this.get('sourceAnchor').bounds();
                tbox = this.get('target').bounds();
            } else {
                sbox = this.get('source').bounds();
                tbox = this.get('targetAnchor').bounds();
            }
        } else {
            sbox = this.get('source').bounds();
            tbox = this.get('target').bounds();
        }

        return [sbox, tbox];
    },

    // Returns the points of intersection between the source and target
    // boxes and the Line joining their center. The points of intersection
    // are the start and end of the Connection.

    getPoints: function(boxes) {
        var paper = this.paper(),
            sbox = boxes[0],
            tbox = boxes[1],
            line, sPoint, tPoint;

        if (this.vertices.length) {
            line = new Line(paper, sbox.center, this.vertices[0]);
            sPoint = line.findIntersection(sbox);
            line.remove();
            line = new Line(paper, this.vertices[this.vertices.length - 1], tbox.center);
            tPoint = line.findIntersection(tbox);
            line.remove();
        } else {
            line = new Line(paper, sbox.center, tbox.center);
            sPoint = line.findIntersection(sbox);
            tPoint = line.findIntersection(tbox);
            line.remove();
        }

        if (!sPoint) sPoint = { x: sbox.xCenter, y: sbox.yMiddle };
        if (!tPoint) tPoint = { x: tbox.xCenter, y: tbox.yMiddle };

        return [new Point(sPoint), new Point(tPoint)];
    }

});

_.extend(Ds.Connection.prototype, Ds.Events);

//
// Helpers
//

// Returns the Path for the Connection

function path(start, end, vertices, smooth) {
    var paths = ["M", start.x, start.y],
        i = 0,
        l = vertices.length;

    for (; i < l; i++) {
        paths.push("L", vertices[i].x, vertices[i].y);
    }
    paths.push("L", end.x, end.y);

    return paths;
}



})(this);
