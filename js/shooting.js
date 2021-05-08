// game params
let cont = true;
let score = 0;
let levelStart = 1;
let level = levelStart;
let levelTime = 0;
let kindEn = 3;
let genEn;

// player params
let posPl = [];
const rPl = 14;
let clPl;
let lifePl = 3;
let inv = false;
let invFC = 0;
let bulPlPerFC = 10;
let bulPlSp = 10;

// list
let buls = [];
let ens = [];
let input = [];

function setup() {
    textSize(50);
    createCanvas(1000, windowHeight-rPl);
    background(0);
    textAlign(LEFT,TOP);
    rectMode(CORNERS);
    noStroke();
    genEn = floor(random(kindEn));
    posPl[0] = width/2;
    posPl[1] = (height-50)/2;
    clPl = color(0, 255, 255, 255);
}

function draw() {

    if (!cont) {

        background(0);
        fill(255);
        text("Game Over", width/2-textWidth("Game Over")/2, height/2-50);
        text("Click to Replay", width/2-textWidth("Click to Replay")/2, height/2+25);
        
        // replay
        if (input[0]) {
            buls = [];
            ens = [];
            background(0);
            levelTime = 0;
            level = levelStart;
            score = 0;
            lifePl = 3;
            inv = false;
            invFC = 0;
            bulPlPerFC = 10;
            bulPlSp = 10;
            cont = true;
        }

    } else {

        // update player place
        if (rPl/2 < mouseX && mouseX < width - rPl/2) posPl[0] = mouseX;
        if (rPl/2 + 50 < mouseY && mouseY < height - rPl/2) posPl[1] = mouseY;
        
        // player damage & invincible time & game over
        if (inv) {
            let invFCU = max(32-level*2, 5);
            if (invFC % (invFCU*2) == 0) clPl = color(0, 255, 255, 100);
            else if (invFC % (invFCU*2) == invFCU)  clPl = color(0, 255, 255, 255);
            invFC++;
            if (invFC >= invFCU*10 -1) inv = false;
        } else {
            let clMouse = [];
            clMouse[0] = get(posPl[0], posPl[1]+rPl/2);
            clMouse[1] = get(posPl[0], posPl[1]-rPl/2);
            clMouse[2] = get(posPl[0]+rPl/2, posPl[1]);
            clMouse[3] = get(posPl[0]-rPl/2, posPl[1]);
            for (let i = 0; i < 4; ++i) {
                if (red(clMouse[i]) > 1 && saturation(clMouse[i]) > 1) {
                    lifePl--;
                    inv = true;
                    invFC = 0;
                    break;
                }
            }
            if (lifePl <= 0 || input[5]) cont = false;
        }

        // change level
        if (levelTime >= 1000) {
            levelTime -= 1000;
            level++;
        }

        // generate enemy
        if (levelTime % ceil(1000/(2+level)) == 0) {
            switch (genEn) {
                case 0 :
                    ens.push(new En1());
                break;
                case 1 :
                    ens.push(new En2(floor(random(2))));
                break;
                case 2 :
                    ens.push(new En3());
                break;	
                default :
                    alert("ないよ");
                break;	
            }
            //genEn = 1;
            genEn = floor(genEn+1+random(kindEn-1)) %kindEn;
        }

        // delete finished bullets & enemies
        
        for (let i = 0; i < buls.length; i++) {
            let bul = buls[i];
            if (bul.fin()) {
                if (blue(bul.c) < 250) score += level;
                buls.splice(i, 1);
            }
        }
        for (let i = 0; i < ens.length; i++) {
            let en = ens[i];
            en.updLife();
            if (en.finPos()) {
                ens.splice(i, 1);
                score += 100*(9+level);
            } else if (en.finLife()) {
                ens.splice(i, 1);
                score += 1000+(level-1)*level*50;
            }
        }

        background(0);

        // update player
        if (frameCount % (inv?bulPlPerFC*2:bulPlPerFC) == 0) buls.push(new Bul(posPl[0],posPl[1]-10,5,PI*3/2,0,0,bulPlSp,color(0,0,255)));
        fill(clPl);
        drawShip(PI, posPl[0], posPl[1], rPl);

        // draw bullets & enemies
        ens.forEach(en => {
            en.updPos();
            en.drawEn();
            en.attack();
        });
        buls.forEach(bul => {
            bul.drawBul();
        });
        levelTime++;

    }
    fill(255);
    rect(0, 0, width, 50);
    fill(0);
    text("level:" + str(level), 0, -1);
    text("score:" + str(score), 250, -1);
    for (let i = 0; i < lifePl-1; i++) drawShip(PI, width - i*45 - 25, 20, 16)
}

function drawShip(rot, x, y, r) {
    push();
    translate(x, y);
    rotate(rot);
    beginShape();
        vertex( 0, r);
        vertex( r, 0);
        vertex( r, -3*r/2);
        vertex( 0,   -r/2);
        vertex(-r, -3*r/2);
        vertex(-r, 0);
    endShape(CLOSE);
    blendMode(SCREEN);
    beginShape();
        vertex(   0,  r/2);
        vertex( r/2,    0);
        vertex(   0, -r/2);
        vertex(-r/2,    0);
    endShape(CLOSE);
    blendMode(BLEND);
    pop();
}

class Bul {
    constructor(x, y, spAbs, rad, spShipX, spShipY, r, c) {
        this.x = x;
        this.y = y;
        this.dx = spAbs*cos(rad) + spShipX;
        this.dy = spAbs*sin(rad) + spShipY;
        this.r = r;
        this.c = c;
        this.t = 0;
    }
    drawBul() {
        this.x += this.dx;
        this.y += this.dy;
        fill(this.c);
        ellipse(this.x, this.y, this.r, this.r);
        this.t++;
    }
    fin() {
        return this.x>width+2*this.r || this.x<-2*this.r || this.y>height+2*this.r || this.y<-2*this.r || this.t>1000;
    }
}

class En0 {
    constructor(x, y, r, c, life) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.c = c;
        this.life = life;
        this.t = 0;
        this.rot = 0;
    }
    updLife() {
        let clEn = [];
        clEn[0] = get(this.x, this.y+this.r/2);
        clEn[1] = get(this.x, this.y-this.r/2);
        clEn[2] = get(this.x+this.r/2, this.y);
        clEn[3] = get(this.x-this.r/2, this.y);
        for (let i = 0; i < 4; ++i) {
            if (blue(clEn[i]) > 250 && saturation(clEn[i]) > 1) {
                this.life--;
                break;
            }
        }
    }
    updPos() {
        alert("undefined");
    }
    drawEn() {
        fill(this.c);
        drawShip(this.rot, this.x, this.y, this.r);
        this.t++;
    }
    attack() {
        alert("undefined");
    }
    finPos() {
        alert("undefined");
    }
    finLife() {
        return this.life<=0;
    }
}

class En1 extends En0{
    constructor(){
        super(
            random(width*.1, width*.9),
            -(9+level),
            9+level,color(255,127,0),1);

        let spAbs = random(1,(level+1)/2);
        let rad = PI/2+random(-.1,.1)*min((level-1),10);
        this.dx = spAbs*cos(rad);
        this.dy = spAbs*sin(rad);;
    }
    updPos() {
        this.x += this.dx;
        this.y += this.dy;
        if (this.x < 0 || this.x > width) {
            this.dx *= -1;
            this.x += this.dx;
        }
    }
    attack() {
        if (random(90/(2+level)) < 1) {
            buls.push(new Bul(this.x,this.y+this.r,
                random(2,2+(level-1)/3),
                PI/2+random(-.1, .1)*(level+7),
                this.dx, this.dy,
                10+random(level),color(255,0,0)));
        }
    }
    finPos() {
        return this.y>height+this.r;
    }
}

class En2 extends En0 {
    constructor(side){
        super(
            width*side + (9+level)*(side*2-1),
            0,
            9+level,color(255,191,0),1);
        
        this.dx = random((level+7)/8,(level+3)/4)*(-side*2+1);
        this.yCenter = 150+20*min(level, 20)
        this.yNoiseSeed = random(10);
    }
    updPos() {
        this.x += this.dx;
        this.y = this.yCenter + (noise(frameCount/100. + this.yNoiseSeed)-.5)*(this.yCenter-150)*2;
        this.rot = atan2(this.y-posPl[1],this.x-posPl[0]) + PI/2;
    }
    attack() {
        if (random(200/(3+level)) < 1) {
            buls.push(new Bul(this.x,this.y+this.r,
                3+level/2,
                atan2(this.y-posPl[1],this.x-posPl[0])+PI+random(-.1,.1)*sqrt(level),
                this.dx/2, 0,
                10+random(level),color(255,63,0)));
        }
    }
    finPos() {
        return this.x>width+this.r || this.x<-this.r;
    }
}

class En3 extends En0 {
    constructor(){
        super(
            random(width*.3, width*.7),
            -(14+level*2),
            14+level*2,color(255,63,0),3);

        this.dy = 1+level/10.;
        this.rot = random(PI*2);
        this.dir = floor(random(2))*2-1;
    }
    updPos() {
        this.rot += .0025*this.dir*(level+3);
        this.x += cos(this.rot + PI/2)*level/4;
        this.y += sin(this.rot + PI/2)*level/4 + this.dy;
    }
    attack() {
        if (this.t%floor(1500/(6+level)) == floor(1500/(12+level))) {
            let iMax = 7+level;
            let rad = 2*PI/iMax;
            let radRand = random(rad);
            for (let i = 0; i < iMax; ++i) {
                buls.push(new Bul(
                    this.x+this.r*cos(rad*i+radRand), this.y+this.r*sin(rad*i+radRand),
                    1+level/5,
                    rad*i+radRand,
                    cos(this.rot + PI/2)*level/5, sin(this.rot + PI/2)*level/5,
                    10+random(level),color(255,0,63)));   
            }
        }
    }
    finPos() {
        return this.y>height+this.r*3;
    }
}

function keyPressed() {
    switch (keyCode) {
        case UP_ARROW:    input[1] = true; 
            level++;
            break;
        case DOWN_ARROW:  input[2] = true;
            if (level > 1) level--;
            break;
        case LEFT_ARROW:  input[3] = true; break;
        case RIGHT_ARROW: input[4] = true; break;
        case ESCAPE:      input[5] = true; break;
        default: break;	
    }
}

function keyReleased() {
    switch (keyCode) {
        case UP_ARROW:    input[1] = false; break;
        case DOWN_ARROW:  input[2] = false; break;
        case LEFT_ARROW:  input[3] = false; break;
        case RIGHT_ARROW: input[4] = false; break;
        case ESCAPE:      input[5] = false; break;
        default: break;	
    }
}

function mousePressed() {
    input[0] = true;
}

function mouseReleased() {
    input[0] = false;
}

function windowResized() {
    resizeCanvas(1000, windowHeight-rPl);
}