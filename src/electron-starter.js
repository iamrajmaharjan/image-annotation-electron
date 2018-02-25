const electron = require('electron');
// Module to control application life.
const {app,Menu} = electron;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');
const DownloadManager = require("electron-download-manager");
const USER_TOKEN = 'userToken';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
DownloadManager.register({downloadFolder: app.getPath("downloads") + "/image-annotation"});

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({width: 1000, height: 600,"webPreferences":{
        "webSecurity":false
      }});
    mainWindow.maximize();
    // and load the index.html of the app.
    const startUrl = process.env.ELECTRON_START_URL || url.format({
            pathname: path.join(__dirname, '/../build/index.html'),
            protocol: 'file:',
            slashes: true
        });

    mainWindow.setMenu(null);    

    // build menu from template
    // const mainMenu= Menu.buildFromTemplate(mainMenuTemplate);

    // Insert Menu
    // Menu.setApplicationMenu(mainMenu);

    mainWindow.loadURL(startUrl);
    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

// create menu template
// const mainMenuTemplate=[
//     {
//         label:"Image",
//         submenu:[
//             {
//                 label:"Annotate",                
//                 click(){
//                     window.location.href='/';
//                 }
//             },
//             {
//                 label:"Download Image",                
//                 click(){
//                     window.location.href='/download';
//                 }
//             },
//             {
//                 label:"quit",
//                 accelerator:process.platform=='darwin'?'command+Q':'ctrl+Q',
//                 click(){
//                    app.quit(); 
//                 }
//             }
//         ]
//     },
//     {
//         label:"Account",
//         submenu:[
//             {
//                 label:"Log Out",
//                 click(){     
                    
//                     mainWindow.webContents.executeJavaScript('localStorage.removeItem("'+USER_TOKEN+'")');    
//                 }

//             }
//         ]
//     }
// ];

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
