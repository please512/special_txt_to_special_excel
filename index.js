const { Menu,shell,ipcMain,BrowserWindow,app,dialog } = require('electron')
var http = require('http');
var fs = require('fs');
var path = require('path');
var json2xls = require('json2xls');

var template = [
    {
        label: '文件',
        submenu: [
            {
                label: '退出',
                accelerator:"Ctrl+Q",
                click: function(){
                    app.quit()
                     // BrowserWindow.getFocusedWindow().webContents.send('action','exit');
                }
            }
        ]
    },  
    {
        label: '视图',
        submenu: [
            {
                label: '重新加载',
                role: 'reload',
                accelerator:""
            },
           
            {
                label: '缩小',
                role: 'zoomout',
                accelerator:""
            },
            {   label: '放大',
                role: 'zoomin',
                accelerator:""
            },
            {   label: '重置缩放',
                role: 'resetzoom',
                accelerator:""
            },
            {
                label: '全/半屏',
                role: 'togglefullscreen',
                accelerator:""
            }
        ]
    },
    {
        label: '帮助',
        submenu: [
            {
                label: '关于',
                click() { 
                    dialog.showMessageBox({"title":"关于","type":"warning","message":"本程序特定输入固定格式的TXT文件，输出固定模板的Excel文件！开发者：李正阳。"});
                }
            }
        ]
    }
];

// 创建服务
var myServer = http.createServer(function(req,res){

    function back(data){
        res.end(data)
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    req.on('data',(data)=>{
        console.log(req.url)
        if(req.url=='/toExcel'){
            var arr=JSON.parse(data.toString())['content'].split('--')
            console.log(arr)
            var list=[]
            arr.forEach(s=>{
                let item=s.split(' ')
                console.log(item)
                let obj={
                    '姓名':item[0],
                    '性别':item[1],
                    '年龄':item[2],
                    '学校':item[3],
                    '所在省':item[4],
                    '所在市':item[5],
                    '居住地址':item[6],
                    '婚配':item[7],
                    '生育':item[8],
                }
                list.push(obj)
            })
            // console.log(list)
            let xls = json2xls(list);

            fs.writeFile('demo.xls', xls, 'binary',(err)=>{
                if(!err){
                    console.log('写入成功')
                    fs.readFile('./demo.xls',(err,data)=>{
                        if(!err){
                            console.log(data)
                            back(data)
                        }
                    })
                }
            });
        }
    })

})

//服务端等着客户端请求需要做一个监听。通过创建的服务。
//监听
myServer.listen('3000',function(err){
    if(err){
        console.log(err);
        throw err;
    }
    console.log("server start!");
    let mainWindow
    function createWindow () {
        mainWindow = new BrowserWindow({
            width: 800,
            height: 600,
            icon:'.\\favicon.ico',
            // backgroundColor:"#ccc",
            webPreferences: {
                nodeIntegration: true
            }
        })

        // mainWindow.webContents.openDevTools();
        mainWindow.loadFile('upload_txt.html')
        mainWindow.on('closed',()=>{
            console.log('window closed')
        })
        var m=Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(m);
    }

    const gotTheLock = app.requestSingleInstanceLock()
    if (!gotTheLock) {
      app.quit()
    } else {
      app.on('second-instance', (event) => {
        if (mainWindow) {
          if (mainWindow.isMinimized()) mainWindow.restore()
          mainWindow.focus()
        }
      })
      app.on('ready', () => {
        createWindow()
        // const { Menu } = require('electron')
        // Menu.setApplicationMenu(null) // 隐藏菜单栏
      })
    }

    // app.whenReady().then(createWindow)

    app.on('window-all-closed', () => {
        console.log('all window closed')
        if (process.platform !== 'darwin') {
            app.quit()
        }
    })
})


