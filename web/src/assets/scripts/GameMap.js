import {AcGameObject} from "@/assets/scripts/AcGameObject";
import {Wall} from "@/assets/scripts/Wall";
import {Snake} from "@/assets/scripts/Snake";

export class GameMap extends AcGameObject {
    //ctx画布 parent画布的父元素 用于动态修改画布的长宽  因为用户可能会修改浏览的大小
    constructor(ctx, parent,store) {
        super();
        this.ctx = ctx;
        this.parent = parent;
        this.store = store;
        this.L = 0;//地图中每一个小方块的边长

        this.rows = 13;//地图的行数
        this.cols = 14;

        this.inner_walls_count = 20;//设置地图内部障碍物的数量
        this.walls = [];//墙的数组，用来存储所有的墙

        this.snakes = [
            new Snake({id:0,color:"#4876EC",r:this.rows-2,c:1},this),
            new Snake({id:1,color:"#F94848",r:1,c:this.cols-2},this),
        ]
    }

    //创建障碍物
    create_walls() {
        const g = this.store.state.pk.gamemap;
        //画出墙
        for (let r = 0; r < this.rows; ++r) {
            for (let c = 0; c < this.cols; ++c) {
                if (g[r][c]) {
                    this.walls.push(new Wall(r, c, this));
                }
            }
        }

        return true;
    }

    start() {
        this.create_walls();
        this.add_listening_events();
    }

    //获取用户输入
    add_listening_events(){
        this.ctx.canvas.focus();
        this.ctx.canvas.addEventListener("keydown",e => {
            let d = -1;
            if(e.key === 'w') d=0;
            else if(e.key === 'd') d=1;
            else if(e.key === 's') d=2;
            else if(e.key === 'a') d=3;

            if(d >= 0){
                this.store.state.pk.socket.send(JSON.stringify({
                    event:"move",
                    direction:d,
                }))
            }

        });
    }

    update_size() {//更新边长
        //由于不取整数的话会导致方格之间会产生缝隙，所以需要取整数
        this.L = parseInt(Math.min(this.parent.clientWidth / this.cols, this.parent.clientHeight / this.rows));
        this.ctx.canvas.width = this.L * this.cols;//画布的宽就是小正方形的数量乘以小正方形的宽
        this.ctx.canvas.height = this.L * this.rows;
    }

    check_ready(){ //判断两条蛇是否准备好下一回合了
        for(const snake of this.snakes){
            //如果当前状态是静止的话才能动
            if(snake.status !== "idle") return false;
            //如果没有接收到下一步的指令 就能动
            if(snake.direction === -1) return false;
        }
        return true;
    }

    next_step(){ // 让两条蛇进入下一回合
        for(const snake of this.snakes){
            snake.next_step();
        }
    }

    check_valid(cell) {//检测目标位置是否合法 ： 没有撞到某条蛇的身体和强
        for (const wall of this.walls) {
            if (wall.r === cell.r && wall.c === cell.c) return false;
        }

        for (const snake of this.snakes) {
            let k = snake.cells.length;
            if (!snake.check_tail_increasing()) { //当蛇尾会前进的时候 蛇尾可以走 不用判断
                k--;
            }
            for (let i = 0; i < k; ++i) {
                if (snake.cells[i].r === cell.r && snake.cells[i].c === cell.c) return false;
            }
        }
        return true;
    }
    update() {
        this.update_size();//更新一下地图的比例，防止用户修改了浏览器尺寸，导致游戏显示不正常，每次渲染都需要判断
        if(this.check_ready()){
            this.next_step();
        }
        this.render();
    }

    render() {//渲染函数 每一帧都要执行一次
        //地图背景的深浅相间的绿色格子，我们一个格子一个格子的渲染，只要横纵坐标之和为奇数就是深色反之为浅色
        const color_even = "#AAD751";//浅色
        const color_odd = "#A2D149";//深色
        for (let r = 0; r < this.rows; ++r) {
            for (let c = 0; c < this.cols; ++c) {
                if ((r + c) % 2 === 0) {
                    this.ctx.fillStyle = color_even;
                } else {
                    this.ctx.fillStyle = color_odd;
                }
                this.ctx.fillRect(c * this.L, r * this.L, this.L, this.L);
            }
        }
    }
}