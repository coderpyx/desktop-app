'use strict'

import { app, protocol, BrowserWindow, dialog } from 'electron'
// ---------------------------------------------------------------------------

var path = require("path");
var fs = require("fs");
var dirs = [];
console.log(__dirname);
var pathName = "C:/Users/吴/Desktop/审核辅助视频";
fs.readdir(pathName, function(err, files){
  console.log(files);
  let imgSrcList = [];
    for (var i=0; i<files.length; i++) {
      //  fs.stat(path.join(pathName, files[i]), function(err, data){
      //    console.log(data);
      //       if(data.isFile())
      //       {               
      //           dirs.push(files[i]);
      //       }
      //   });
      console.log(`${pathName}/${files[i]}`);
      fs.readFileSync(`${pathName}/${files[i]}`,(err, data)=>{
        imgSrcList.push("data:image/jpg;base64," + data.toString('base64'));
      })
      console.log(imgSrcList[0]);
    }
    console.log(dirs);

})

// ---------------------------------------------------------------------------

const { autoUpdater } = require('electron-updater')

import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])


// ---------------------------------
//检测更新
autoUpdater.checkForUpdates()

async function checkUpdate() {
  if(process.platform == 'darwin'){  
    //我们使用koa-static将静态目录设置成了static文件夹，
    //所以访问http://127.0.0.1:9005/darwin，就相当于访问了static/darwin文件夹，win32同理
    autoUpdater.setFeedURL('http://127.0.0.1:9005/darwin')  //设置要检测更新的路径
    
  }else{
    autoUpdater.setFeedURL('http://127.0.0.1:9005/win')
  }
}

//监听'error'事件
autoUpdater.on('error', (err) => {
  console.log(err)
})

//监听'update-available'事件，发现有新版本时触发
autoUpdater.on('update-available', () => {
  console.log('found new version')
})

 //默认会自动下载新版本，如果不想自动下载，设置autoUpdater.autoDownload = false
  
  //监听'update-downloaded'事件，新版本下载完成时触发
  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
      type: 'info',
      title: '应用更新',
      message: '发现新版本，是否更新？',
      buttons: ['是', '否']
    }).then((buttonIndex) => {
      if(buttonIndex.response == 0) {  //选择是，则退出程序，安装新版本
        autoUpdater.quitAndInstall() 
        app.quit()
      }else {
        
      }
    })
  })

// ---------------------------------

async function createWindow() {
  console.log(process.versions);
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  checkUpdate()
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

app.on('close', (e)=>{
  e.preventDefault();
  dialog.showMessageBox({
    type: 'warning',
    title: 'info tips',
    message: 'Do you want to close the application?',
    buttons:['取消', '确认'],
  },(idx)=>{
    if(idx == 0) {
      e.preventDefault();
    }else{
      app = null
      app.exit()
    }
  })
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
