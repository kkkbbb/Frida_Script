Java.perform(function(){
    var isLoging = false
    var log = Java.use("android.util.Log");
    var throwable = Java.use("java.lang.Throwable");
    var system = Java.use("java.lang.System");
    var classLoaders = Java.enumerateClassLoadersSync();
    function hash(obj){
        var m = system.identityHashCode(obj)
        return m.toString(16)
    }

    function delay(ms) {
        return Java.use('java.lang.Thread').sleep(ms);
      }

    function logStack(){
        let t = throwable.$new();
        let stackTrace = t.getStackTrace();
        let stackString = ''

        stackTrace.forEach((element)=>{
            let className = element.getClassName();
            let methodName = element.getMethodName();
            let fileName = element.getFileName() == null ? "Unknow Source":element.getFileName();
            let lineNumber = element.getLineNumber();
            let paras = null
            Java.use(className).class.getDeclaredMethods().forEach((item)=>{
                if(item.getName() == methodName){
                    paras = item.getParameters()
                }
            })

            stackString += className + "." + methodName+'('
            stackString += paras
            stackString += ") [" + fileName + ":" + lineNumber + "]\n"
        })
        return stackString  
    };

    function range(stop) {
        var start=0
        var step=1
        const result = [];
        for (let i = start; i < stop; i += step) {
          result.push(i);
        }
        return result;
    }

    //线程互斥封装
    class logMessage{
        constructor(){
            this.Messages = new Array();
        } 
        add(...msg){
            var msg2 = ''
            msg.forEach((item) => msg2=msg2+item)
            this.Messages.push(msg2)
        }
        send(){
            while(true){
                if(isLoging==false){
                    isLoging=true
                    try{
                        for(var i=0;i<this.Messages.length;i++){
                            console.log(this.Messages[i])
                        }
                    }catch(e){
                        console.log("输出时发生了异常")
                        console.error('Caught exception:', e.message);
                    }
                    isLoging=false
                    break
                }
            } 
        }
    }

    function currentTime(){
        const currentDate = new Date();

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const day = currentDate.getDate();
        const hours = currentDate.getHours();
        const minutes = currentDate.getMinutes();
        const seconds = currentDate.getSeconds();
        const milliseconds = currentDate.getMilliseconds();

        return `Current time: ${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
    }

    function loadclass(className){
        if(typeof className === "string"){
            try{
                var test = Java.use(className)
            }catch(e){
                for(let i=0;i<classLoaders.length;i++){
                    try{
                        var test = classLoaders[i].loadClass(className)
                        break
                    }catch(e){
                        if(i+1 == classLoaders.length){
                            console.log("无法找到类",className)
                        }
                    }
                }
            }
        }else{
            var test = className
        }

        return test
    }


    var hook = function(className,methodName,filter=null,custom=null,custom2=null){
        
        var test = loadclass(className)
        
        range(test[methodName].overloads.length).forEach((i) => {
            test[methodName].overloads[i].implementation = function(){
                let print = new logMessage()
                let aargument = {thiz:this,printer:print,args:arguments}
                if(filter!=null){
                    var flag = filter(aargument)
                }else{
                    var flag =true
                }
                
                if(flag){
                    console.log(className,methodName,"函数已进入调用")
                    print.add(currentTime())
                    print.add("当前重载函数index: ",i)
                    for(var k=0;k<arguments.length;k++){
                        print.add(arguments[k],":  ",arguments[k] == null ? null:arguments[k].$className)
                    }
                    print.add("-------------")
                    if(custom!=null){
                        custom(aargument)
                    }

                    print.add(logStack())
                }
                
                var res = this[methodName].apply(this,arguments);
                
                var margument = {thiz:this,printer:print,result:res,flag:true}
                if(custom2!=null){
                    custom2(margument)
                }
                if(flag){
                    print.add("返回结果：",margument.result)
                    print.add("   ")
                    if(margument.flag){
                        print.send()
                    }
                }
                
                return margument.result
            }
        }
        
        )}

     var hook2 = function(className,methodName){
        var test = loadclass(className);
        test.class.getDeclaredMethods().forEach(function(item){
            if(item.getName().indexOf(methodName)!=-1){
                hook(className,item.getName())
            }
        })

     }

     var hook3 = function(className,exclued=[]){
        var mclass = loadclass(className);
        mclass.class.getDeclaredMethods().forEach(function(item){
            if(!exclued.includes(item.getName())){
                hook(className,item.getName())
            }
            
        })
     }


     function list(className){
        var  test = Java.use(className)
        test.class.getMethods().forEach(function(item){
            console.log(item)
        })
     }


     var choose = function(className,FieldName=null,custom=null){
        Java.choose(className,{
            onMatch: function(instance){
                if(FieldName!=null){
                    console.log(hash(instance))
                    console.log(instance[FieldName].value);
                }
                if(custom!=null){
                    custom(instance)
                }
            },
            onComplete: function(){}
        })
     }

    function uptime(){
        let systemclock = Java.use("android.os.SystemClock")
        return systemclock.uptimeMillis()
    }

    function check(value,type=null){
        if(type!=null){
            var mtype = Java.use(type)
        }else{
            var mtype = Java.use(value.$className)
        }
        return Java.cast(value,mtype)
    }
    
    function refField(mclass,FieldName){
        var field = mclass.getClass().getField(FieldName)
        field.setAccessible(true)
        return field.get(mclass)
    }
    

});