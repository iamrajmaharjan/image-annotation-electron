import React, {Component} from 'react';
import {get, put} from '../../utils/httpUtils';
import {getLoggedInUser,setData,getData} from '../../utils/localstorageUtil';
import {baseUrl, uri} from '../../config/uri';
import ImageAnnotationEdit from '../../lib/components/ImageAnnotationEdit';
import {localStorageConstants} from '../../config/localStorageConstants';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import AutoComplete from 'material-ui/AutoComplete';
import Chip from 'material-ui/Chip';
import RaisedButton from 'material-ui/RaisedButton';
import DropdownTreeSelect from 'react-dropdown-tree-select'
import NavBar from '../NavBar';
import {
  Table,
  TableRow,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRowColumn,
} from 'material-ui/Table';

const electron=window.require("electron");

const ANNOTATIONS = 'annotation';
const SELECTED_INDEX = 'selectedIndex';
const IMAGE_WIDTH = 900;
const IMAGE_HEIGHT = 550;

class AnnotateEditor extends Component {

    constructor(props){
        super(props);

        this.state = {
          data: {
            items:{},
          },
          currentUser:{},
          open: false,
          confirmation_open:false,
          selectedTag:{},
          isLoading: true,
          annotations: [],
          tags:[],
          currentIndex: localStorage.getItem(SELECTED_INDEX)?JSON.parse(localStorage.getItem(SELECTED_INDEX)):0,
          imageUrl: "",
          isReject:false,
          pagination: {
            page: 1,
            pageSize: 1000,
            rowCount: 0,
            pageCount: 0
          },
          diagnosisList:[],
          diagnosisDropdownTree:[],
          hasChanges:false,
          goToIndex:0,
          options:[],          
          imagePath:''
        }
    }

    componentWillMount(){
    
      if(!getLoggedInUser()){
        this.props.history.push("/login")
      }
      
    }

    componentDidMount(){
      this.setState({imagePath:electron.remote.app.getPath("downloads") + "./image-annotation/"}); 
      this._fetchData();
      this._fetchAllTags();
      this._fetchOptions();
    }

    /**
     * ImageAnnotationEdit Props:
     * imageURL
     * height
     * width
     * update
     * data
     * options
     */
    render(){

      const actions = [
        <FlatButton
          label="Cancel"
          primary={true}
          onClick={this._handleClose}
        />,
        <FlatButton
        label="Add Tag"
        primary={true}
        keyboardFocused={true}
        onClick={this._addTagToAnnotation}
      />,
      ];

      const actions_confirmation = [
        <FlatButton
          label="Cancel"
          primary={true}
          onClick={this._handleConfirmationClose}
        />,
          <FlatButton
          label="Proceed"
          primary={true}
          keyboardFocused={true}
          onClick={this._setAnnotationsIndex}
        />,
      ];

      const dataSourceConfig = {
        text: 'tagName',
        value: 'id',
      };

      if(this.state.isLoading){
        return 'loading.....'
      }

      return (
        <div id="asdf">
        <NavBar/>
         <div className="nextButton">
          {            
            this.state.annotations.length > 1 && this.state.currentIndex > 0 &&
            <button type="button" className="btn btn-primary"  style={{marginRight:'10px',marginBottom:'15px'}} onClick={this._onPrevious}>Previous Image</button>
          }

          {            
            this.state.annotations.length > 1 && this.state.currentIndex < this.state.annotations.length - 1 &&
            <button type="button" className="btn btn-primary" style={{marginBottom:'15px'}} onClick={this._onNext}>Next Image</button>
          }
          </div>
          <div style={{width:"75%",float:"left",paddingLeft:"10px"}}>
          <ImageAnnotationEdit
            imageURL={ this.state.imagePath + this.state.annotations[this.state.currentIndex].imageName}
            height={IMAGE_HEIGHT}
            width={IMAGE_WIDTH}
            update={this.update}
            data={this.state.data}
            options={this.state.options}
            add={this._add}
            remove={this._remove}
          />
          </div>
          <div style={{width:"25%",float:"left",paddingRight:"10px"}}>
          <DropdownTreeSelect className="tree-dropdown" data={this.state.diagnosisDropdownTree} onChange={this._onDiagnosisChange} />
          {/* <div>
            <label>Tags : </label>
            {this.state.annotations[this.state.currentIndex].tags.map((tag, index)=>{
              return(
              <Chip style={{display:"inline-block",marginLeft:"5px"}} key={index}>
              {tag.tagName}
              </Chip>
              )
            })
            }
            <RaisedButton label="Add Tags" primary={true} onClick={() => this._addTags(this.state.annotations[this.state.currentIndex])} style={{display:"block",marginTop:"10px"}}/>
          </div> */}
          <div  style={{maxHeight:"calc(100vh - 205px)",overflow:"auto",marginTop:"10px"}}>
          <Table className="tags-list">
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn>Patient Name</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody showRowHover displayRowCheckbox={false}  >
            {
              this.state.annotations &&
                this.state.annotations.map((annotation,index) =>
                  <TableRow key={annotation.id} style={{background:this.state.currentIndex==index?"rgba(224, 224, 223, 1)":""}}>
                    <TableRowColumn><a href="#" onClick={() => this._goToIndex(index)}>{`${annotation.patient.firstName} ${annotation.patient.lastName}`}</a></TableRowColumn>
                  </TableRow>
                )
            }
          </TableBody>
        </Table>
          </div>
          </div>
          
          <Dialog
          title={this.state.selectedAnnotation && this.state.selectedAnnotation.patient.firstName+' '+this.state.selectedAnnotation.patient.lastName}
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this._handleClose}
          >
            <div className="add-tag-dialog">
            <AutoComplete
              floatingLabelText="Search Tags"
              filter={AutoComplete.noFilter}
              openOnFocus={false}
              dataSource={this.state.tags}
              filter={AutoComplete.caseInsensitiveFilter}
              dataSourceConfig={dataSourceConfig}
              // onNewRequest={this._addTagToAnnotation}
              onUpdateInput={this._selectTag}
            />

            </div>
        </Dialog>

        
        <Dialog
          title="Confirmation"
          actions={actions_confirmation}
          modal={false}
          open={this.state.confirmation_open}
          onRequestClose={this._handleConfirmationClose}
          >
          You have not saved your changes. Are you sure you want to proceed to next image ?
          </Dialog>

        </div>
      );
    }

  update = (data) => {
    this.setState({hasChanges:false});
    let oldCanvas = document.getElementById('canvas');
    oldCanvas = null;
    let annotation = {...this.state.annotations[this.state.currentIndex], annotationInfo: JSON.stringify(data)};
    // this.setState({annotation}, () => {
      this._updateAnnotation(annotation);
    // })

  };

  _updateAnnotation(annotation){

    let foundIndex = this.state.annotations.findIndex(x => x.id == annotation.id);
    let newAnnotations=this.state.annotations;
    newAnnotations[foundIndex] =annotation;   
    this.setState({annotations:newAnnotations,open: false},()=>{
      setData(localStorageConstants.OFFLINE_IMAGES,newAnnotations);
    });

  }

  _selectTag=(tagName)=>{
    let tag=this.state.tags.find(t=>{return t.tagName.trim()==tagName.trim()});
    if(!tag){
      tag={id:"0",tagName:tagName.trim()};
    }
    this.setState({selectedTag:tag});
  }

  _addTagToAnnotation=()=>{
    if(this.state.selectedTag && this.state.selectedTag.tagName){
    let annotation=this.state.selectedAnnotation;
    annotation.tags.push(this.state.selectedTag);
    this._updateAnnotation(annotation);
    if(this.state.selectedTag.id==0){
      this.state.selectedTag={};
      this._fetchAllTags();
    }
    }
    else{
      alert("Tag cannot be empty.");
    }
  }

  _addTags=(annotation)=>{

    this.setState({open: true,selectedAnnotation:annotation});
  }

  _handleClose = () => {
    this.setState({open: false});
  }

  _handleConfirmationClose = () => {
    this.setState({confirmation_open: false});
  }

  _onNext = () => {
    if(this.state.hasChanges){
       this.setState({confirmation_open: true,goToIndex:this.state.currentIndex+1});
    }else{
    this._setAnnotationsIndex(this.state.currentIndex+1);
    }
  }

  _onPrevious = () => {
    if(this.state.hasChanges){
      this.setState({confirmation_open: true,goToIndex:this.state.currentIndex-1});
    }else{
      this._setAnnotationsIndex(this.state.currentIndex-1);
    }
  }

  _goToIndex = (index) => {
    if(this.state.hasChanges){
      this.setState({confirmation_open: true,goToIndex:index});
    }else{
      this._setAnnotationsIndex(index);
    }
  }

  _add = (item, cb) => {
    item.id = new Date().getTime();
    let data = this.state.data;
    data.items[item.id] = item;
    this.setState({
        data:data,hasChanges:true
    }, () => {
      cb && cb(item.id);
    });
  }

  _addWholeImageAnnotation = (node) => {
      let item={};
      item.id = new Date().getTime();
      item.type="whole_image";
      item.diagnosisCaption=node.label;
      item.diagnosisCode=node.value;
      let data = this.state.data;
      data.items[item.id] = item;
      this.setState({data},()=>{
        // console.log("after set data",data);
      });
  }

  _remove = (item) => {
    let data = this.state.data;
    let items = data.items;
    delete items[item.id];
    data.items = items;
    this.setState({data:data,hasChanges:true});
  }

  _setAnnotationsIndex=(index=0)=>{
    if(this.state.confirmation_open){
      index=this.state.goToIndex;
      this.setState({confirmation_open: false,hasChanges: false});
    }
    localStorage.removeItem('viewportTransform');
    let data = {items: {}};
    localStorage.setItem(SELECTED_INDEX,JSON.stringify(index));
    this.setState({currentIndex:index},()=>{  
      if(this.state.annotations[this.state.currentIndex].annotationInfo != null && this.state.annotations[this.state.currentIndex].annotationInfo != ""){
        data = JSON.parse(this.state.annotations[this.state.currentIndex].annotationInfo); 
      }
      this.setState({data},()=>{
        let selectedCodes=this._fetchSelectedCodeFromAnnotationInfo();
        this._resetDiagnosisList(selectedCodes);
      });
    });
  }

  _constructQueryParam = () => {
    let { page, pageSize } = this.state.pagination;
    // let batchId=this.props.location.query.batchId;
    let batchId=70;
    return `?annotation=all&page=${page}&pageSize=${pageSize}&batchId=${batchId}&isReject=${this.state.isReject}`;
  }


  _fetchData = () => { 
    let data=null;
    let offlineData= getData(localStorageConstants.OFFLINE_IMAGES);
    if(offlineData){
    this.setState({ annotations: getData(localStorageConstants.OFFLINE_IMAGES),isLoading: false,currentIndex:0},()=>{
      localStorage.removeItem('viewportTransform');
      if(this.state.annotations[this.state.currentIndex].annotationInfo != null && this.state.annotations[this.state.currentIndex].annotationInfo != ""){
        data = JSON.parse(this.state.annotations[this.state.currentIndex].annotationInfo);
      }
      this.setState({data:data},()=>{
        this._fetchAllDiagnosis();
      });
    })
    }
  }

  _fetchAllTags = () => {   
    let url = uri.tags;
    get(url)
      .then(response =>{
        this.setState({ tags: response.data });
        });
  }

  _fetchOptions=()=>{  
      this.setState({ options: getData(localStorageConstants.OFFLINE_IMAGE_LABELS) });
  }

  _fetchSelectedCodeFromAnnotationInfo=()=>{
    let selectedCodes=[];
    let data=this.state.data;
    Object.keys(data.items).forEach(itemId => {
      let item = data.items[itemId];
      if(item.type=="whole_image"){
        selectedCodes.push(item.diagnosisCode);
      }
    });
    return selectedCodes;
  }

  _fetchAllDiagnosis=(selectedCodes)=>{        
      this.setState({diagnosisList:getData(localStorageConstants.OFFLINE_WHOLE_IMAGE_LABELS)},()=>{
        let selectedCodes=this._fetchSelectedCodeFromAnnotationInfo();
        this._resetDiagnosisList(selectedCodes);
      })
  }

  _resetDiagnosisList=(selectedCodes)=>{
  let data=this.state.data;
  Object.keys(data.items).forEach(itemId => {
    let item = data.items[itemId];
    if(item.type=="whole_image"){
      delete data.items[itemId];
    }
  });

  this.setState({data},()=>{
    let diagnosisTree=[];
    this.state.diagnosisList.forEach(element => {
      if(element.parentId===0){
        let parent={label:element.displayLabel,value:element.value,checked:selectedCodes.includes(element.value),expanded:true};
        if(parent.checked){
          setTimeout(()=>{ this._addWholeImageAnnotation(parent); }, 1000);          
        }
        let childrens=[];
        this.state.diagnosisList.forEach((children)=>{
                      if(children.parentId==parseInt(element.id)){
                        let childItem={label:children.displayLabel,value:children.value,checked:selectedCodes.includes(children.value)};
                        childrens.push(childItem);
                        if(childItem.checked){
                          setTimeout(()=> { this._addWholeImageAnnotation(childItem); }, 1000);
                        }
                      }
                    });
        parent.children=childrens;            
        diagnosisTree.push(parent);            
      }
      
    });
    this.setState({ diagnosisDropdownTree: diagnosisTree });
  });
 
}

  _onDiagnosisChange=(currentNode, selectedNodes) => { 
      this.setState({hasChanges:true});
      let selectedCodes=[];
      if(currentNode._parent && currentNode.checked==true){
        selectedNodes=selectedNodes.filter(node=>{
          return (node._parent && node._parent != currentNode._parent) || node.value==currentNode.value ;
        });
      }

      selectedNodes.forEach(node=>{
        selectedCodes.push(node.value);
      });

      if(!selectedCodes.includes(currentNode.value) && currentNode.checked==true){
        selectedCodes.push(currentNode.value);
      }
      this._resetDiagnosisList(selectedCodes);
  }

};

export default AnnotateEditor;
