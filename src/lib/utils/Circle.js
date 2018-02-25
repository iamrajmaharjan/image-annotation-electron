import Shape from './Shape';
import { fabric } from 'fabric';

export default class Circle extends Shape {
  mousedown(e) {
    var mouse = this.canvas.getPointer(e.e);
    this.started = true;
    this.x = mouse.x;
    this.y = mouse.y;

    var square = new fabric.Circle({
      width: 0,
      height: 0,
      left: this.x,
      top: this.y,
      fill: 'transparent',
      stroke: 'red',
    });

    this.canvas.renderAll();
    this.canvas.setActiveObject(square);
  }

  mousemove(e) {
    if (!this.started) {
      return false;
    }

    let mouse = this.canvas.getPointer(e.e);

    let w = Math.abs(mouse.x - this.x);

    if (!w) {
      return false;
    }

    let circle = this.canvas.getActiveObject();
    circle.set('radius', w);
    circle.set('top', this.y - w).set('left', this.x - w);
    this.canvas.renderAll();
  }

  mouseup(e) {
    if (this.started) {
      this.started = false;
    }
    var circle = this.canvas.getActiveObject();

    if(!circle || circle.height === 0 || circle.width === 0){
      this.canvas.discardActiveObject();
      return;
    }

    this.isListening = false;

    if (this.afterDraw)
      this.afterDraw(
        {
          type: 'circle',
          height: circle.height,
          left: circle.left,
          top: circle.top,
          radius: circle.radius,
          angle: circle.angle,
          scaleX: circle.scaleX,
          scaleY: circle.scaleY,
        },
        id => {
          circle.set('itemId', id);
        },
      );
  }
}
