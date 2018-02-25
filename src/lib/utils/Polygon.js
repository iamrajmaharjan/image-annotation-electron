import Shape from './Shape';
import { fabric } from 'fabric';

export default class Polygon extends Shape {
  constructor(props) {
    super(props);
    this.min = 99;
    this.max = 999999;
    this.polygonMode = true;
    this.lineArray = new Array();
    this.activeLine;
    this.activeShape = false;
    this.canvas;
    this.pointArray = new Array();
    this.line;
  }

  mousedown(options) {
    if (options.target && options.target.id == this.pointArray[0].id) {
      this.generatePolygon(this.pointArray);
    }
    if (this.polygonMode) {
      this.addPoint(options);
    }
  }

  mousemove(options) {
    if (this.activeLine && this.activeLine.class == 'line') {
      var pointer = this.canvas.getPointer(options.e);
      this.activeLine.set({ x2: pointer.x, y2: pointer.y });

      var points = this.activeShape.get('points');
      points[this.pointArray.length] = {
        x: pointer.x,
        y: pointer.y,
      };
      this.activeShape.set({
        points: points,
      });
      this.canvas.renderAll();
    }
    this.canvas.renderAll();
  }

  mouseup(e) {}

  drawPolygon() {
    this.polygonMode = true;
    this.pointArray = new Array();
    this.lineArray = new Array();
    this.activeLine;
  }

  addPoint(options) {
    var mouse = this.canvas.getPointer(options.e);
    var random =
      Math.floor(Math.random() * (this.max - this.min + 1)) + this.min;
    var id = new Date().getTime() + random;
    var circle = new fabric.Circle({
      radius: 5 / this.canvas.getZoom(),    // To make point smaller on zoomed screen as well
      fill: '#ffffff',
      stroke: '#333333',
      strokeWidth: 0.5,
      left: mouse.x,
      top: mouse.y,
      selectable: false,
      hasBorders: false,
      hasControls: false,
      originX: 'center',
      originY: 'center',
      id: id,
    });
    if (this.pointArray.length == 0) {
      circle.set({
        fill: 'red',
      });
    }

    var points = [
      mouse.x,
      mouse.y,
      mouse.x,
      mouse.y,
    ];

    this.line = new fabric.Line(points, {
      strokeWidth: 2,
      fill: '#999999',
      stroke: '#999999',
      class: 'line',
      originX: 'center',
      originY: 'center',
      selectable: false,
      hasBorders: false,
      hasControls: false,
      evented: false,
    });
    if (this.activeShape) {
      var pos = this.canvas.getPointer(options.e);
      var points = this.activeShape.get('points');
      points.push({
        x: pos.x,
        y: pos.y,
      });
      var polygon = new fabric.Polygon(points, {
        stroke: '#333333',
        strokeWidth: 1,
        fill: '#cccccc',
        opacity: 0.1,
        selectable: false,
        hasBorders: false,
        hasControls: false,
        evented: false,
      });
      this.canvas.remove(this.activeShape);
      this.canvas.add(polygon);
      this.activeShape = polygon;
      this.canvas.renderAll();
    } else {
      var pos = this.canvas.getPointer(options.e);
      var polyPoint = [
        {
          x: pos.x,
          y: pos.y
        },
      ];
      var polygon = new fabric.Polygon(polyPoint, {
        stroke: '#333333',
        strokeWidth: 1,
        fill: '#cccccc',
        opacity: 0.1,
        selectable: false,
        hasBorders: false,
        hasControls: false,
        evented: false,
      });
      this.activeShape = polygon;
      this.canvas.add(polygon);
    }
    this.activeLine = this.line;

    this.pointArray.push(circle);
    this.lineArray.push(this.line);

    this.canvas.add(this.line);
    this.canvas.add(circle);
    this.canvas.selection = false;
  }

  generatePolygon(pointArray) {
    var points = new Array();
    pointArray.forEach((point, index) => {
      points.push({
        x: point.left,
        y: point.top,
      });
      this.canvas.remove(point);
    });
    this.lineArray.forEach((line, index) => {
      this.canvas.remove(line);
    });
    this.canvas.remove(this.activeShape).remove(this.activeLine);
    var polygon = new fabric.Polygon(points, {
      stroke: '#333333',
      strokeWidth: 0.5,
      fill: 'red',
      opacity: 1,
      hasBorders: false,
      hasControls: false,
    });
    this.canvas.add(polygon);

    this.activeLine = null;
    this.activeShape = null;
    this.polygonMode = false;
    this.canvas.selection = true;

    this.isListening = false;

    if (this.afterDraw)
      this.afterDraw(
        {
          type: 'polygon',
          points: points,
          left: polygon.left,
          top: polygon.top,
          height: polygon.height,
        },
        id => {
          polygon.set('itemId', id);
        },
      );
  }
}
