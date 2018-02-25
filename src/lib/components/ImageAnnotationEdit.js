import React from 'react';

import Rectangle from '../utils/Rectangle';
import Circle from '../utils/Circle';
import Polygon from '../utils/Polygon';

import { fabric } from 'fabric';

export default class ImageAnnotationEdit extends React.Component {
  constructor(props) {
    super(props);

    this.data = {
      items: [],
    };
    this.state = {
      annModal: {
        position: {
          left: 0,
          top: 0,
        },
        display: 'none',
        text: '',
        searchText: '',
      },
    };

    this.selectedItem = null;
    this.selectedItemId = null;

    this.enableDrawRect = this.enableDrawRect.bind(this);
    this.enableDrawCircle = this.enableDrawCircle.bind(this);
    this.enableDrawPolygon = this.enableDrawPolygon.bind(this);
    this.enableMovement = this.enableMovement.bind(this);
    this.saveState = this.saveState.bind(this);
    this.loadState = this.loadState.bind(this);
    this.hideAnnModal = this.hideAnnModal.bind(this);
    this.showAnnModal = this.showAnnModal.bind(this);
    this.updateItem = this.updateItem.bind(this);
    this.addItem = this.addItem.bind(this);
    this.saveAnn = this.saveAnn.bind(this);
    this.resetState = this.resetState.bind(this);
    this.init = this.init.bind(this);
    this.mouseOut = this.mouseOut.bind(this);
    this.enableAnnModalEdit = this.enableAnnModalEdit.bind(this);
    this.showAnnCreateModal = this.showAnnCreateModal.bind(this);
    this.handleAnnModalSearchChange = this.handleAnnModalSearchChange.bind(
      this,
    );
    this.deleteAnn = this.deleteAnn.bind(this);
    this.getOptions = this.getOptions.bind(this);
    this.zoomIn = this.zoomIn.bind(this);
    this.zoomOut = this.zoomOut.bind(this);
    this.resetZoom = this.resetZoom.bind(this);
    this.handleEscKey = this.handleEscKey.bind(this);
  }

  componentDidMount() {
    this.init();
    document.addEventListener("keydown", this.handleEscKey, false);
  }

  componentWillReceiveProps(newProps) {
    this.data=newProps.data;
    this.init();
    this.forceUpdate();
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleEscKey, false);
  }

  init() {
    let preElem = this.elem.querySelector('.canvas-container');
    if (preElem) this.elem.removeChild(preElem);

    let canvasElement = document.createElement('canvas');
    canvasElement.setAttribute('width', this.props.width);
    canvasElement.setAttribute('height', this.props.height);
    this.elem.appendChild(canvasElement);
    let canvas = new fabric.Canvas(canvasElement);
    canvas.selection = false;
    var panning = false;

    var img = new Image();
    var that = this;
    img.onload = function() {
        canvas.setBackgroundImage(img.src, canvas.renderAll.bind(canvas), {width: that.props.width, height: that.props.height});
    }
    img.src = this.props.imageURL;

    canvas.observe('object:selected', e => {
      let itemId = e.target.itemId;
      if (!itemId) return;
      this.showAnnModal(itemId);
      this.selectedItem = e.target;
    });

    canvas.on('mouse:over', e => {
      let itemId = e.target.itemId;
      if (!itemId) return;
      this.selectedItem = e.target;
      this.selectedItemId = itemId;
    });

    // for image movement after zoom
    canvas.on('mouse:up', function (e) {
        panning = false;
    });

    canvas.on('mouse:down', function (e) {
        panning = true;
    });
    canvas.on('mouse:move', function (e) {
        if (panning && e && e.e) {
            var units = 10;
            var delta = new fabric.Point(e.e.movementX, e.e.movementY);
            canvas.relativePan(delta);
        }
    });

    canvas.on('mouse:out', ({ e }) => {});

    canvas.on('object:rotating', e => {
      panning=false;
      let itemId = e.target.itemId;
      if (!itemId) return;

      this.updateItem(itemId, e);
    });

    canvas.on('object:moving', e => {
      panning=false;
      let itemId = e.target.itemId;
      if (!itemId) return;
      this.updateItem(itemId, e);
    });

    canvas.on('object:scaling', e => {
      panning=false;
      let itemId = e.target.itemId;
      if (!itemId) return;
      this.updateItem(itemId, e);
    });

    let showAnnCreateModal = this.showAnnCreateModal;

    let rectangle = new Rectangle({
      canvas,
      showAnnCreateModal,
    });
    let circle = new Circle({
      canvas,
      showAnnCreateModal,
    });
    let polygon = new Polygon({
      canvas,
      showAnnCreateModal,
    });

    rectangle.init({
      afterDraw: this.addItem,
    });

    circle.init({
      afterDraw: this.addItem,
    });
    polygon.init({
      afterDraw: this.addItem,
    });

    this.canvas = canvas;
    this.rectangle = rectangle;
    this.circle = circle;
    this.polygon = polygon;
    this.loadState();

    this.checkCanvasPosition();
  }

  shouldComponentUpdate(props, nextState) {
    return true;
  }

  enableDrawRect() {
    this.rectangle.clean();
    this.polygon.clean();
    this.circle.clean();
    this.rectangle.draw();
  }

  enableDrawCircle() {
    this.rectangle.clean();
    this.polygon.clean();
    this.circle.clean();
    this.circle.draw();
  }

  enableDrawPolygon() {
    this.rectangle.clean();
    this.circle.clean();
    this.polygon.clean();
    this.polygon.draw();
  }

  enableMovement() {
    this.rectangle.clean();
    this.circle.clean();
    this.canvas.renderAll();
  }

  zoomIn(){
    this.canvas.setZoom(this.canvas.getZoom() *1.1);
    this.canvas.renderAll();
  }

  zoomOut() {
    let zoomScale=1;
    if((this.canvas.getZoom() * 0.9) > 1 ){
      zoomScale=this.canvas.getZoom() * 0.9;
    }
    else{
      zoomScale=1;
    }
    this.canvas.setZoom(zoomScale);
    this.canvas.renderAll();

  }

  resetZoom(){
    this.canvas.setZoom(1);
    this.canvas.renderAll();
  }

  enableAnnModalEdit() {
    let annModal = {
      ...this.state.annModal,
      isEdit: true,
    };
    this.setState({ annModal });
  }

  mouseOut(e) {
    if (!this.elem.contains(e.relatedTarget)) {
      this.hideAnnModal();
    }
  }

  hideAnnModal() {
    let selectedItemId = null;
    // this.selectedItem = null;
    this.selectedItemId = selectedItemId;

    let annModal = { ...this.state.annModal };
    annModal.text = '';
    annModal.display = 'none';
    annModal.searchText = '';
    this.setState({ annModal });
  }

  showAnnModal(itemId) {
    let selectedItemId = itemId;
    this.selectedItemId = selectedItemId;

    let item = this.data.items[itemId];
    if (!item) return;
    let { top, left, height, caption } = item;

    let annModal = { ...this.state.annModal };
    annModal.position.top = top + height;
    annModal.position.left = left;
    annModal.text = caption;
    annModal.display = 'block';
    annModal.isEdit = !caption;
    annModal.searchText = '';

    this.setState({ annModal });
  }

  showAnnCreateModal({ top, left, height }) {
    let annModal = { ...this.state.annModal };
    annModal.position.top = top + height;
    annModal.position.left = left;
    annModal.text = '';
    annModal.display = 'block';
    annModal.isEdit = true;

    this.setState({ annModal });
    this.enableMovement();

    if (true) {
      return 'asdas';
    } else {
      return null;
    }
  }

  saveAnn(option) {
    return () => {
      if (!this.selectedItemId) return;
      let item = this.data.items[this.selectedItemId];
      if (!item) return;
      this.data.items[this.selectedItemId]['code'] = option.value;
      this.data.items[this.selectedItemId]['caption'] = option.displayLabel;
      this.data.items[this.selectedItemId]['stroke'] = option.color;
      if(this.selectedItem != null){
        this.selectedItem['stroke'] = option.color
      }

      this.canvas.renderAll();
      this.hideAnnModal();
    };
  }

  deleteAnn() {
    let itemId = this.selectedItemId;
    let item = this.data.items[itemId];
    if (!item) return;
    this.props.remove(item);
    this.hideAnnModal();
  }

  resetState() {
    this.setState({
      resetComponentState: true,
    });
  }

  handleEscKey(){
    let itemId = this.selectedItemId;
    let item = this.data.items[itemId];
    if(item != null && !item.caption){ // newly created item will not have caption key
      this.deleteAnn();
    } else {
      this.hideAnnModal();
    }
  }

  async checkCanvasPosition() {
    let viewportTransform = await localStorage.getItem('viewportTransform');
    if(viewportTransform != null){
      this.canvas.viewportTransform=JSON.parse(viewportTransform);
    }
  }

  addItem(item) {
    localStorage.setItem('viewportTransform', JSON.stringify(this.canvas.viewportTransform));
    this.props.add(item, itemId => {
      this.showAnnModal(itemId);
    });
  }

  updateItem(itemId, e) {
    let target = e.target;
    if (!target) return;

    let item = { ...this.data.items[itemId] };

    item.width = target.width;
    item.height = target.height;
    item.left = target.left;
    item.top = target.top;
    item.angle = target.angle;
    item.scaleX = target.scaleX;
    item.scaleY = target.scaleY;

    this.data.items[itemId] = item;
  }

  saveState() {
    if (this.props.update) this.props.update(this.data);
  }

  loadState() {
    let data = this.data || { items: {} };

    let lastId = this.lastId;

    Object.keys(data.items).forEach(itemId => {
      let item = data.items[itemId];
      let shape = null;

      if (item.type === 'rectangle') {
        shape = new fabric.Rect({
          width: item.width,
          height: item.height,
          left: item.left,
          top: item.top,
          fill: 'transparent',
          stroke: item.stroke || 'red',
          angle: item.angle,
          scaleX: item.scaleX,
          scaleY: item.scaleY,
        });
      }

      if (item.type === 'circle') {
        shape = new fabric.Circle({
          radius: item.radius,
          left: item.left,
          top: item.top,
          fill: 'transparent',
          stroke: item.stroke || 'red',
          angle: item.angle,
          scaleX: item.scaleX,
          scaleY: item.scaleY,
        });
      }

      if (item.type === 'polygon') {
        shape = new fabric.Polygon(item.points, {
          top: item.top,
          left: item.left,
          fill: 'transparent',
          stroke: item.stroke || 'red',
          opacity: 1,
          hasBorders: false,
          hasControls: false,
        });
      }

      if(shape){
      shape.set('itemId', itemId);
      this.canvas.add(shape);
      lastId = lastId < itemId ? itemId : lastId;
      }
    });

    this.data = data;
  }

  handleAnnModalSearchChange(e) {
    let annModal = { ...this.state.annModal, searchText: e.target.value };
    this.setState({ annModal });
  }

  getOptions() {
    return this.props.options.filter(option => {
      return (
        option.displayLabel
          .toLowerCase()
          .indexOf(this.state.annModal.searchText.toLowerCase()) > -1
      );
    });
  }

  render() {
    let { annModal } = this.state;

    return (
      <div
        className="image-annotation-wrapper"
        ref={e => (this.elem = e)}
        onMouseOut={this.mouseOut}
      >
        <div className="image-annotation-toolbar">
          <button onClick={this.enableDrawRect}>Draw Rectangle</button>
          <button onClick={this.enableDrawCircle}>Draw Circle</button>
          <button onClick={this.enableDrawPolygon}>Draw Polygon</button>
          <button onClick={this.enableMovement}>Select Tool</button>
          <button onClick={this.zoomIn}>Zoom In</button>
          <button onClick={this.zoomOut}>Zoom Out</button>
          <button onClick={this.resetZoom}>Reset Zoom</button>
          <button onClick={this.saveState}>Save</button>
          {/* <button onClick={this.resetState}>Reset</button> */}
        </div>
        {/* <img
          src={this.props.imageURL}
          height={this.props.height}
          width={this.props.width}
        /> */}
        <canvas height={this.props.height} width={this.props.width} />
        <div
          className="image-annotation-selection"
          style={{
            position: 'absolute',
            zIndex: 1,
            left: annModal.position.left,
            top: annModal.position.top,
            display: annModal.display,
            opacity: 1,
          }}
        >
          <p>{annModal.text}</p>
          <div style={{ display: 'inline-block' }}>
            {!annModal.isEdit && (
              <button className="edit-button" onClick={this.enableAnnModalEdit}>
                Edit
              </button>
            )}
            <button className="edit-button" onClick={this.deleteAnn}>
              Delete
            </button>
          </div>
          {annModal.isEdit && (
            <ul>
              <li>
                <input
                  type="text"
                  value={annModal.searchText}
                  onChange={this.handleAnnModalSearchChange}
                />
              </li>
              {this.getOptions().map((option, index) => {
                return (
                  <li key={index}>
                    <a href="#" onClick={this.saveAnn(option)}>{option.displayLabel}</a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    );
  }
}
