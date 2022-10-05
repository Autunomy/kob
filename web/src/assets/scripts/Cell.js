
export class Cell{
    constructor(r,c) {
        this.r = r;
        this.c = c;
        this.x = c+0.5;//当前格子中心点坐标 也就是圆心
        this.y = r+0.5;
    }
}