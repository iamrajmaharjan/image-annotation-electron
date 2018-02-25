import axios from 'axios';
import {localStorageConstants} from '../config/localStorageConstants';
import { error } from 'util';

axios.defaults.headers.common['x-access-token'] = localStorage.getItem(localStorageConstants.USER_TOKEN);

export function get(url){
  return axios(url).then(response => response.data).catch(error=>{
    if(error.response && error.response.data.error.code==401){
    window.location.href='/login';
    }
  });
}

export function put(url, body){
  return axios.put(url, body).then(response => response.data).catch(error=>{
    if(error.response && error.response.data.error.code==401){
      window.location.href='/login';
      }
  });
}

export function post(url, body){ 
  return axios.post(url, body).then(response => response.data).catch(error=>{
    if(error.response && error.response.data.error.code==401){
      window.location.href='/login';
      }
  });
}
