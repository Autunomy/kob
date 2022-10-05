import {AcGameObject} from "@/assets/scripts/AcGameObject";
import {Wall} from "@/assets/scripts/Wall";
import {Snake} from "@/assets/scripts/Snake";

export class GameMap extends AcGameObject {
    //ctx画布 parent画布的父元素 用于动态修改画布的长宽  因为用户可能会修改浏览的大小
    constructor(ctx, parent) {
        super();
        this.ctx = ctx;
        this.parent = parent;
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

    //判断蛇出生的位置是否连通
    check_connectivity(g,sx,sy,tx,ty) {
        if (sx === tx && sy === ty) return true;
        g[sx][sy] = true;

        let dx = [-1,0,1,0],dy = [0,1,0,-1];

        for(let i = 0;i<4;++i){
            let x = sx + dx[i],y = sy+dy[i];
            if(!g[x][y] && this.check_connectivity(g,x,y,tx,ty))
                return true;
        }
        return false;
    }


    //创建障碍物
    create_walls() {
        const g = [];//布尔数组表示这个位置是否有墙
        for (let r = 0; r < this.rows; r++) {
            g[r] = [];
            for (let c = 0; c < this.cols; c++) {
                g[r][c] = false;
            }
        }

        //给四周加上墙
        for (let r = 0; r < this.rows; ++r) {
            g[r][0] = g[r][this.cols - 1] = true;
        }
        for (let r = 0; r < this.cols; ++r) {
            g[0][r] = g[this.rows - 1][r] = true;
        }

        //创建随机障碍物，这些障碍物按照左上到右下的对角线对称，所以只需要随机一半即可
        for (let i = 0; i < this.inner_walls_count/2; i++) {
            for (let j = 0; j < 1000; j++) {
                let r = parseInt(Math.random() * this.rows);//得到随机横坐标
                let c = parseInt(Math.random() * this.cols);//得到随机纵坐标
                // 如果当前已经有障碍物了就重新放
                if(g[r][c] || g[this.rows - 1 - r][this.cols - 1 - c]) continue;

                //如果生成在了左下角或者右上角就要重新生成，因为我们需要让蛇初始位置在这两个位置
                if((r === this.rows-2 && c === 1) || (r === 1 && c === this.cols-2)) continue;

                g[r][c] = g[this.rows - 1 - r][this.cols - 1 - c] = true;//放置障碍物
                break;
            }
        }

        //将当前地图复制一份，防止被修改，这里需要使用的是深拷贝
        const copy_g = JSON.parse(JSON.stringify(g));
        if(!this.check_connectivity(copy_g,this.rows-2,1,1,this.cols-2)) return false;

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

    //获取用户输入
    add_listening_events(){
        this.ctx.canvas.focus();
        const [snake0,snake1] = this.snakes;
        this.ctx.canvas.addEventListener("keydown",e => {
            if(e.key === 'w') snake0.set_direction(0);
            else if(e.key === 'd') snake0.set_direction(1);
            else if(e.key === 's') snake0.set_direction(2);
            else if(e.key === 'a') snake0.set_direction(3);
            else if(e.key === 'ArrowUp') snake1.set_direction(0);
            else if(e.key === 'ArrowRight') snake1.set_direction(1);
            else if(e.key === 'ArrowDown') snake1.set_direction(2);
            else if(e.key === 'ArrowLeft') snake1.set_direction(3);
        });
    }

    start() {
        for(let i = 0;i<1000;++i)
            if(this.create_walls())
                break;
        this.add_listening_events();
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