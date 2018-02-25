export default class CaptionController {
  constructor(props) {
    this.modal = props.modal;
  }

  displayAddCaptionForm(e) {
    let modal = this.modal;

    modal.style.left = e.target.left + 'px';
    modal.style.top = e.target.top + e.target.height + 'px';
    modal.style.opacity = 1;
    modal.style.pointerEvents = 'auto';

    if (true) {
      return 'asdf';
    } else {
      return null;
    }
  }
}
