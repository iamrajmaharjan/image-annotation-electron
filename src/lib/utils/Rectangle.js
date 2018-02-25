import Shape from "./Shape";
import { fabric } from "fabric";

export default class Rectangle extends Shape {
  mousedown(e) {
    var mouse = this.canvas.getPointer(e.e);
    this.started = true;
    this.x = mouse.x;
    this.y = mouse.y;

    var square = new fabric.Rect({
      width: 0,
      height: 0,
      left: this.x,
      top: this.y,
      fill: "transparent",
      stroke: "red"
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
    let h = Math.abs(mouse.y - this.y);

    let initialTop = this.y;
    let initialLeft = this.x;

    if (mouse.x < this.x) {
      initialLeft = mouse.x;
    }

    if (mouse.y < this.y) {
      initialTop = mouse.y;
    }

    if (!w || !h) {
      return false;
    }
    console.log("aaaaa");

    let square = this.canvas.getActiveObject();
    square.set("width", w).set("height", h);
    square.set("top", initialTop).set("left", initialLeft);
    this.canvas.renderAll();
  }

  mouseup(e) {
    if (this.started) {
      this.started = false;
    }

    // We can assign our id to this object
    // this.canvas.getActiveObject().id=your id value;
    // Later we can retrieve object with this id
    // MyObject = this.canvas.getActiveObject().get('id');
    var square = this.canvas.getActiveObject();

    if(!square || square.height === 0 || square.width === 0){
      this.canvas.discardActiveObject();
      return;
    }

    // if (square.height != 0 && square.width != 0) {
    //   //caption
    //   let caption = this.showAnnCreateModal(e);
    //   if (caption) {
    //     square.caption = caption;
    //     this.canvas.add(square);
    //   }
    // }
    //
    // this.canvas.discardActiveObject();
    // this.canvas.renderAll();
    this.isListening = false;

    if (this.afterDraw)
      this.afterDraw({
        type: "rectangle",
        left: square.left,
        top: square.top,
        width: square.width,
        height: square.height,
        angle: square.angle,
        scaleX: square.scaleX,
        scaleY: square.scaleY
      }, (id) => {
          square.set("itemId", id);
      });
  }
}
