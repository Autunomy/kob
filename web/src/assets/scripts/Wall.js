import {AcGameObject} from "@/assets/scripts/AcGameObject";

export class Wall extends AcGameObject{
    //r,c表示横纵坐标,gamemap是地图
    constructor(r,c,gamemap) {
        super();
        this.r = r;
        this.c = c;
        this.gamemap = gamemap;

        this.color = "#B37226"
    }

    update() {
        this.render();
    }

    render() {
        //首先取出来一个小正方形的边长，每一帧都要取，因为可能会变
        const L = this.gamemap.L;
        const ctx = this.gamemap.ctx;

        ctx.fillStyle = this.color;
        ctx.fillRect(this.c*L,this.r*L,L,L);

    }
}