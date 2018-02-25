export default class Shape {
  constructor(props) {
    this.isListening = false;
    this.started = false;
    this.x = 0;
    this.y = 0;
    this.r = 0;
    this.canvas = props.canvas;
    this.showAnnCreateModal = props.showAnnCreateModal;

    this.init = this.init.bind(this);
    this.draw = this.draw.bind(this);
    this.clean = this.clean.bind(this);
    this.mousedown = this.mousedown.bind(this);
    this.mousemove = this.mousemove.bind(this);
    this.mouseup = this.mouseup.bind(this);
  }

  init({ afterDraw }) {
    this.afterDraw = afterDraw;
  }

  draw() {
    if (!this.isListening) {
      this.canvas.observe('mouse:down', this.mousedown);
      this.canvas.observe('mouse:move', this.mousemove);
      this.canvas.observe('mouse:up', this.mouseup);
      this.isListening = true;
    }
  }

  clean() {
    this.isListening = false;
    this.canvas.off('mouse:down', null);
    this.canvas.off('mouse:move', null);
    this.canvas.off('mouse:up', null);
  }
}
