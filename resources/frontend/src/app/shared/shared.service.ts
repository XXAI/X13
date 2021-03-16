import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { iif } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor(private snackBar: MatSnackBar) { }

  showSnackBar(message, action, duration){
    this.snackBar.open(message, action,{
      duration: duration
    });
  }

  newCurrentApp(name){
    let newApp = {name:name, data:{}};
    localStorage.setItem('currentApp',JSON.stringify(newApp));
  }

  getCurrentApp(){
    let currentApp = JSON.parse(localStorage.getItem('currentApp'));
    if(!currentApp){
      currentApp = {name:''};
    }
    return currentApp;
  }

  getArrayDataFromCurrentApp(keys){
    let appData = {};
    let currentAppData = JSON.parse(localStorage.getItem('currentApp'));
    for(let i in keys){
      if(currentAppData.data[keys[i]]){
        appData[keys[i]] = currentAppData.data[keys[i]];
      }else{
        appData[keys[i]] = undefined;
      }
    }
    return appData;
  }

  getDataFromCurrentApp(key){
    let currentApp = JSON.parse(localStorage.getItem('currentApp'));
    if(currentApp){
      return currentApp.data[key];
    }else{
      return {};
    }
  }

  setDataToCurrentApp(key, data){
    let currentApp = JSON.parse(localStorage.getItem('currentApp'));
    if(currentApp){
      currentApp.data[key] = data;
    }
    localStorage.setItem('currentApp',JSON.stringify(currentApp));
  }
}
