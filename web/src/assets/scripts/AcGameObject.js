const AC_GAME_OBJECTS=[];

export class AcGameObject{
    constructor() {
        AC_GAME_OBJECTS.push(this);
        this.has_called_start = false;//判断是否渲染了当前对象
        this.timedelta = 0;//两帧之间的时间间隔
    }

    start(){//初始化 只执行一次

    }

    update(){//每一帧执行一次  除了第一帧

    }

    on_destroy(){//删除之前执行

    }

    destroy(){//销毁对象 直接从 AC_GAME_OBJECT中删除这个对象即可
        this.on_destroy();

        for(let i in AC_GAME_OBJECTS){
            const obj = AC_GAME_OBJECTS[i];
            if(obj === this){
                AC_GAME_OBJECTS.splice(i);
                break;
            }
        }
    }
}


let last_timestamp;//上一次执行的时刻
const step = timestamp => {//timestamp是本次执行的时刻
    for(let obj of AC_GAME_OBJECTS){//遍历所有对象，对下一帧进行渲染
        if(!obj.has_called_start){//如果当前对象没有被渲染过就渲染
            obj.has_called_start = true;
            obj.start();//初始化
        }else{//渲染过
            obj.timedelta = timestamp - last_timestamp;
            obj.update();//直接更新
        }
    }
    last_timestamp = timestamp;
    //递归就可以实现不断渲染
    requestAnimationFrame(step);
}

//每次浏览器渲染下一帧的时候会执行step函数
requestAnimationFrame(step)