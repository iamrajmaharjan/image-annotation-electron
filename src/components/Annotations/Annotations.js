import {
  Table,
  TableRow,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRowColumn,
} from 'material-ui/Table';
import {Link} from 'react-router-dom';
import React, {Component} from 'react';
import AppBar from 'material-ui/AppBar';
import MenuItem from 'material-ui/MenuItem';
import Checkbox from 'material-ui/Checkbox';
import DropDownMenu from 'material-ui/DropDownMenu';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import {baseUrl,uri,} from '../../config/uri';
import {localStorageConstants} from '../../config/localStorageConstants';
import {get,post,put} from '../../utils/httpUtils';
import AutoComplete from 'material-ui/AutoComplete';
import ReactImageMagnify from 'react-image-magnify';
import NavBar from '../NavBar';
import {getLoggedInUser,setData,getData} from '../../utils/localstorageUtil';
import RefreshIndicator from 'material-ui/RefreshIndicator';
const electron=window.require("electron");

class Annotations extends Component{

  constructor(){
    super();

    this.state = {
      defaultShowAnnotationValue: 'all',
      defaultTagValue:0,
      currentUser:{},
      tags:[],
      isReject:false,
      open: false,
      selectedPatientName:'',
      selectedImageUrl:'',
      selectedBatchId:0,
      pagination: {
        page: 1,
        pageSize: 20,
        rowCount: 0,
        pageCount: 0
      },
      annotations: [],
      selectedIndexes: [],
      selectedTag:{},
      offlineData:[],
      isLoading:false,
      index:0,
      isDownloadLoading:false,
      selectAll:false
    }
  }

  componentDidMount(){ 
    if(!getLoggedInUser()){
      this.props.history.push("/login")
    }  
    this._checkInternetConnection();
    this.setState({offlineData:getData(localStorageConstants.OFFLINE_IMAGES)});
    this._fetchData();
    this._fetchAllTags();
    this._fetchLabels(localStorageConstants.OFFLINE_IMAGE_LABELS,'image_annotation');
    this._fetchLabels(localStorageConstants.OFFLINE_WHOLE_IMAGE_LABELS,'whole_image_annotation');
  }

  componentDidUpdate(){
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 400);
  }

  render(){
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={this._handleClose}
      />
    ];

    const dataSourceConfig = {
      text: 'tagName',
      value: 'id',
    };

    const customContentStyle = {
      width: '90%',
      maxWidth: 'none'      
    };

    return(      
      <div>
         <NavBar/>
        <DropDownMenu value={this.state.selectedBatchId} onChange={this._selectBatch}>
          <MenuItem value={0} primaryText="Select Batch" />
          {                          
            this.state.currentUser.batches && this.state.currentUser.batches.map(batch=>
              <MenuItem key={batch.id} value={parseInt(batch.id)} primaryText={batch.batchName} />
            )
          }
        </DropDownMenu>

        <DropDownMenu value={this.state.defaultShowAnnotationValue} onChange={this._handleDropDownChange}>
          <MenuItem value={'all'} primaryText="Display All Images" />
          <MenuItem value={'true'} primaryText="Display Annotated Images" />
          <MenuItem value={'false'} primaryText="Display Images Without Annotation" />
          <MenuItem value={'reject'} primaryText="Display Rejected Images" />
        </DropDownMenu>

        <DropDownMenu value={this.state.defaultTagValue} onChange={this._changeTag}>
          <MenuItem value={0} primaryText="Display All Tags" />
          {
            this.state.tags.map(tag=>
              <MenuItem key={tag.id} value={parseInt(tag.id)} primaryText={tag.tagName} />
            )
          }
        </DropDownMenu>

        {                  
          this.state.annotations.length != 0 &&
            <div style={{float: 'right', marginTop: '15px',paddingRight:'10px'}}> 
              <button className="btn btn-success" onClick={()=>this._syncData()} > 
              { this.state.isLoading && 
              <RefreshIndicator
              size={20}
              left={5}
              top={0}
              loadingColor="#FF9800"
              status="loading"
              style={{display: 'inline-block', position: 'relative',marginRight:"10px"}}
              /> 
              }
             Sync Offline Data</button>
            </div>
        }
        
        <div className="downloadButtons">
        <Checkbox
          label="Select All"
          style={{display:"inline-block",marginLeft:"15px",marginRight:"10px",width:"150px"}}
          checked={this.state.selectAll}
          onCheck={()=> this._checkAllImages()}
        />
        {
          this.state.selectedIndexes.length > 0 &&
          <button className="btn btn-success" onClick={() => this._downloadSelectedImage()}>
          { this.state.isDownloadLoading && 
              <RefreshIndicator
              size={20}
              left={5}
              top={0}
              loadingColor="#FF9800"
              status="loading"
              style={{display: 'inline-block', position: 'relative',marginRight:"10px"}}
              /> 
          }
          Download Selected Images
          </button>
        }
        </div>

        <Table>
          <TableHeader displaySelectAll={false}  adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn style={{ width:'100px' }}>Select</TableHeaderColumn>
              <TableHeaderColumn>Patient Name</TableHeaderColumn>
              {/* <TableHeaderColumn>Is Annotated</TableHeaderColumn> */}
              <TableHeaderColumn>Tags</TableHeaderColumn>
              {/* <TableHeaderColumn>Remarks</TableHeaderColumn> */}
              <TableHeaderColumn>Action</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody showRowHover  displayRowCheckbox={false}>
            {
              this.state.annotations &&
                this.state.annotations.map(annotation =>
                  <TableRow key={annotation.id}>
                    <TableRowColumn style={{ width:'100px' }}>
                    <Checkbox
                      checked={this.state.selectedIndexes.includes(annotation.id)}
                      onCheck={() => this._manageBatchUpdate(annotation.id)}
                    />
                    </TableRowColumn>
                    <TableRowColumn >{`${annotation.patient.firstName} ${annotation.patient.lastName}`}</TableRowColumn>
                    {/* <TableRowColumn>{`${annotation.annotationInfo != ''}`}</TableRowColumn> */}
                    <TableRowColumn >{annotation.tags.map((tag)=>{return tag.tagName}).join(',')}</TableRowColumn>
                    {/* <TableRowColumn>{annotation.remarks}</TableRowColumn> */}
                    <TableRowColumn >
                      {
                        this._containsOffline(annotation.id)==false &&
                      <a href="#" style={{marginRight:"10px"}} onClick={() => this._downloadImage()}>{"Download"}</a>
                      }
                      <a href="#" onClick={() => this._previewImage(annotation)}>Preview</a>
                    </TableRowColumn>
                  </TableRow>
                )
            }
          </TableBody>
        </Table>

        <Dialog
          title={this.state.selectedPatientName}
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this._handleClose}
          contentStyle={customContentStyle}
          bodyClassName="image-preview"
        >
        <div style={{overflow:"scroll",maxHeight:"400px"}}>
        <div style={{width:"60%",display:"inline-block"}}>
        <ReactImageMagnify {...{
          smallImage: {
              alt: this.state.selectedPatientName,
              isFluidWidth: true,
              src: this.state.selectedImageUrl,
              srcSet: [
                  `${this.state.selectedImageUrl} 687w`,
                  `${this.state.selectedImageUrl} 770w`,
                  `${this.state.selectedImageUrl} 861w`,
                  `${this.state.selectedImageUrl} 955w`
              ].join(', '),
              sizes: '(min-width: 480px) 30vw, 80vw'
          },
          largeImage: {
              alt: '',
              src: this.state.selectedImageUrl,
              width: 1200,
              height: 1200
          },
          isHintEnabled: true,
          shouldHideHintAfterFirstActivation: false,
          enlargedImagePosition:"over"
      }} />
          {/* <img width="100%" src={this.state.selectedImageUrl} />           */}
        </div>
        <div className="add-tag-dialog" style={{width:"40%",display:"inline-block",paddingLeft:"20px",verticalAlign:"top"}}>
            <AutoComplete
              floatingLabelText="Search Tags"
              filter={AutoComplete.noFilter}
              openOnFocus={false}
              dataSource={this.state.tags}
              filter={AutoComplete.caseInsensitiveFilter}
              dataSourceConfig={dataSourceConfig}
              onUpdateInput={this._selectTag}
            />
            <FlatButton
              label="Add Tag"
              primary={true}
              keyboardFocused={true}
              onClick={this._addTagToAnnotation}
            />

        </div>
        </div>
       
        </Dialog>

        {
          this.state.annotations.length != 0 &&
          <nav aria-label="Pagination">
            <ul className="pagination">
              {
                this.state.pagination.page != 1 &&
                <li className="page-item">
                  <a className="page-link" href="#" onClick={() => this._onClickPagination(this.state.pagination.page - 1)}>Previous</a>
                </li>
              }
              <li className="page-item disabled"><a className="page-link" href="#">Total: {this.state.pagination.rowCount}</a></li>

              {
                this.state.pagination.page != this.state.pagination.pageCount &&
                <li className="page-item">
                  <a className="page-link" href="#" onClick={() => this._onClickPagination(this.state.pagination.page + 1)}>Next</a>
                </li>
              }
            </ul>
          </nav>
        }
      </div>
    );
  }

  _isOnline=()=>{
    return navigator.onLine;
  }

  _checkInternetConnection=()=>{
  if(!this._isOnline()){
    electron.remote.dialog.showMessageBox({
      title:"There's no internet",
      message:"No internet available, Please check you internet connection",
      type:'warning'        
    });
  }
  }

  _downloadSelectedImage=()=>{
    let selectedAnnotations=[];
    let imageUrls=[];
    this.state.selectedIndexes.forEach(selectedAnn=>{
      let annotation = this.state.annotations.find((ann)=>{return ann.id===selectedAnn})
      if(annotation){
        let imageUrl=baseUrl + annotation.imageName;
        imageUrls.push(imageUrl);
        selectedAnnotations.push(annotation);
      }    
    })
    this._bulkDownload(imageUrls,selectedAnnotations);

  }

  _downloadImage=(annotation)=>{
    let imageUrls=[];
    let selectedAnnotations=[];
    if(annotation){
      let imageUrl=baseUrl + annotation.imageName;
      imageUrls.push(imageUrl);
      selectedAnnotations.push(annotation);
    }  
    this._bulkDownload(imageUrls,selectedAnnotations);
  }

  _bulkDownload=(imageUrls,selectedAnnotations)=>{
    this.setState({isDownloadLoading:true});
    electron.remote.require("electron-download-manager").bulkDownload({
      urls: imageUrls
    }, (error, url)=>{
        if(error){
            alert("ERROR: " + url);
            return;
        }
        this._StoreImagesOffline(selectedAnnotations);
        alert("Download Complete");

    });
  }

  _StoreImagesOffline=(selectedAnnotations)=>{
    let offlineData=this.state.offlineData;

    if(offlineData && offlineData.length>0){  
      offlineData=offlineData.filter((images)=>{
        return !this.state.selectedIndexes.includes(images.id);
      });
      offlineData=offlineData.concat(selectedAnnotations);
   }
   else{
     offlineData=selectedAnnotations;
   }
   this.setState({offlineData:offlineData,isDownloadLoading:false});
    setData(localStorageConstants.OFFLINE_IMAGES,offlineData);

  }

  _containsOffline=(id)=>{

    if(!this.state.offlineData){
      return false;
    }

    let image=this.state.offlineData.find(img=>{
      return img.id ===id;
    })

    return image?true:false;
  }

  _syncData=()=>{
    this.setState({isLoading:true,index:0});
    this.state.offlineData.forEach((image)=>{
     this._updateAnnotation(image);
    })
  }


    

  _selectBatch=(event, index, value)=>{
    this.setState({selectedBatchId:value}, () => {
      this._fetchImagesByBranch();
    });
  }

  _constructQueryParam = () => {  
    let { page, pageSize } = this.state.pagination;
    let batchId=this.state.currentUser.batches.length > 0 ? this.state.currentUser.batches[0].id : 0;
    return `?annotation=${this.state.isReject?'all':this.state.defaultShowAnnotationValue}&page=${page}&pageSize=${pageSize}&batchId=${this.state.selectedBatchId}&isReject=${this.state.isReject}&tagId=${this.state.defaultTagValue}`;
  }

  _fetchData = () => { 
    let userId=getLoggedInUser().id;
    let url = uri.users+'/'+userId; 
    get(url)
    .then(response => {
        this.setState({currentUser: response.data},()=>{
        if(this.state.currentUser.batches.length > 0){ 
            this.setState({selectedBatchId:parseInt(this.state.currentUser.batches[0].id) },()=>{
              this._fetchImagesByBranch();
            });         
            
         }
         else{
           alert("No Batch Found.");
         }

        });
        

      });
   }

   _fetchImagesByBranch = () =>{
      let url = uri.images + this._constructQueryParam();
      get(url)
      .then(response => this.setState({annotations: response.data, pagination: response.pagination}))
   }

  _fetchAllTags = () => {   
    let url = uri.tags;
    get(url)
      .then(response =>{
        this.setState({ tags: response.data });
        setData(localStorageConstants.OFFLINE_TAGS,response.data);
        });
  }

  _fetchLabels = (dest,source) => {   
    let url = uri.annotationLabels+'/'+source;
    get(url)
      .then(response =>{
        setData(dest,response.data);
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

  _updateAnnotation=(annotation)=>{ 
    put(`${uri.annotation}/${annotation.id}`,annotation).then(response=>{
      let foundIndex = this.state.annotations.findIndex(x => x.id == annotation.id);
      let newAnnotations=this.state.annotations;
      newAnnotations[foundIndex] = response.data;     
      this.setState({annotations:newAnnotations,open: false,index:this.state.index+1},()=>{
          if(this.state.index==this.state.offlineData.length){
            this.setState({isLoading:false});
          }
      });
      
    });
    
  }

  _previewImage=(annotation)=>{
    let imageUrl=baseUrl + annotation.imageName;
    this.setState({open: true,selectedImageUrl:imageUrl,selectedPatientName:annotation.patient.firstName+' '+annotation.patient.lastName,selectedAnnotation:annotation});
    
  }

  _handleClose = () => {
    this.setState({open: false});
  };

  _onClickPagination = (gotoPage) => {
    let pagination = {...this.state.pagination, page: gotoPage};
    this.setState({pagination}, () => {
      this._fetchData();
    })
  }

  _handleDropDownChange = (event, index, value) => {
      this.setState({defaultShowAnnotationValue:value,isReject:value=='reject'?true:false}, () => {
        this._fetchImagesByBranch();
       });
  }

  _changeTag = (event, index, value) => {
    this.setState({defaultTagValue:value}, () => {
      this._fetchImagesByBranch();
     });
}

  _manageBatchUpdate = (annotationId) => {
    let selectedIndexes = [];
    if(this.state.selectedIndexes.includes(annotationId)){
      const index = this.state.selectedIndexes.indexOf(annotationId);
      selectedIndexes = [...this.state.selectedIndexes];
      selectedIndexes.splice(index, 1);
    } else {
      selectedIndexes = this.state.selectedIndexes.concat([annotationId])
    }
    this.setState({selectedIndexes});
  }


  _checkAllImages =()=>{  
   this.setState({selectAll:!this.state.selectAll},()=>{
     if(this.state.selectAll){
      let selectedIndexes=[]; 
      this.state.annotations.forEach(image=>{
        selectedIndexes.push(image.id);
       });
       this.setState({selectedIndexes:selectedIndexes});
     }
     else{
      this.setState({selectedIndexes:[]});
     }
   })
  }

}

export default Annotations;
