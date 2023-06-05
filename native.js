var appdest = "/data/data/com.easy.abroad/_root/data/user/0/com.mxtech.videoplayer.ad/files"

Java.perform(function() {
// 获取文件路径
var srcFilePath = "/proc/self/status";
var destFilePath = appdest+"/status";

var srcFilePath2 = "/proc/self/stat";
var destFilePath2 = appdest+"/stat";

// 构造 cp 命令
var command = "cp " + srcFilePath + " " + destFilePath;
var command2 = "cp " + srcFilePath2 + " " + destFilePath2;

// 获取 Runtime 实例并执行命令
var Runtime = Java.use('java.lang.Runtime');
var runtimeInstance = Runtime.getRuntime();

runtimeInstance.exec(command);
runtimeInstance.exec(command2)

// function loadclass(className){
//     if(typeof className === "string"){
//         try{
//             var test = Java.use(className)
//         }catch(e){
//             for(let i=0;i<classLoaders.length;i++){
//                 try{
//                     var test = classLoaders[i].loadClass(className)
//                     break
//                 }catch(e){
//                     if(i+1 == classLoaders.length){
//                         console.log("无法找到类",className)
//                     }
//                 }
//             }
//         }
//     }else{
//         var test = className
//     }
//     return test
// }

// let dbg = loadclass("android.os.Debug")
// dbg.isDebuggerConnected.implementation = function(){
//     console.log("isDebuggerConnected call")
//     return false
// }
});



var libc = Process.findModuleByName("libc.so")

if (libc !== null) {
    var openAddr = Module.getExportByName('libc.so', 'open');
    console.log('libc.so\'s open is at ' + openAddr);
    var stat = Memory.allocUtf8String(appdest+"stat");
    var status = Memory.allocUtf8String(appdest+"status");

    Interceptor.attach(openAddr, {
        onEnter: function(args) {
            var path = Memory.readCString(args[0]);
            // console.log('Opening ' + path);

            if (path == "/proc/self/stat" || path == "/proc/"+Process.id+"/stat") {
                // Replace the original path with the new one. \
                args[0] = stat
            }

            if (path == "/proc/self/stat" || path == "/proc/"+Process.id+"/status") {
                args[0] = status
            }
        },
        onLeave: function(retval) {
            // console.log('open returned ' + retval);
        }
    });
}






