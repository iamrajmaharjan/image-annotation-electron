export default function EventController() {

  this.disableEvents = function (o) {
    o.selectable = false;
    o.lockScalingX = true;
    o.lockScalingY = true;
    o.lockMovementX = true;
    o.lockMovementY = true;
    o.lockRotation = true;
  }

  this.enableEvents = function (o) {
    o.selectable = true;
    o.lockScalingX = false;
    o.lockScalingY = false;
    o.lockMovementX = false;
    o.lockMovementY = false;
    o.lockRotation = false;
  }

  this.enableMouseHover = function() {
    // canvas.observe('object:selected', function(e) { mousedown(e); });
  }
}