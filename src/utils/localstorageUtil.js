import {localStorageConstants} from '../config/localStorageConstants';
import jwt from 'jsonwebtoken';

export function getLoggedInUser(){
    let token = localStorage.getItem(localStorageConstants.USER_TOKEN);
    let user =null;
    if (token) {
        user=JSON.stringify(jwt.decode(token));
        localStorage.setItem(localStorageConstants.LOGGED_USER,user);
      }
    return JSON.parse(user);  
}

export function setData(index,data){
    if(data){
    localStorage.setItem(index,JSON.stringify(data));
    }
}

export function getData(index){
    let data=localStorage.getItem(index);
    if(!data)
        return null;
    return JSON.parse(data);  
}
