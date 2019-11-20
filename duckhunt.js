class Sprite {
    constructor(x, y, sx, sy, totalFrames, spriteWidth, spriteHeight, image, context, sleepFor = 0) {
        this.image = image;
        this.context = context;
        this.x = x;
        this.y = y;
        this.frame = sx;
        this.sy = sy;
        this.totalFrames = totalFrames;
        this.width = spriteWidth;
        this.height = spriteHeight;
        this.sleepFor = sleepFor;
        this.nextFrame = 0;
    }

    render () {

        if (this.sleepFor === 0) {
            this.getNextFrame();
        } else {
            this.nextFrame++;

            if (this.nextFrame === this.sleepFor) {
                this.getNextFrame();
            }
        }

        if (this.nextFrame === this.totalFrames) {
            return true;
        }

        //img, sx, sy, sw, sh, dx, dy, dw, dh
        this.context.drawImage(
            this.image, //img
            this.width * this.frame / this.totalFrames, //sx
            this.sy, //sy
            this.width / this.totalFrames, //sw
            this.height, //sh
            this.x, //dx
            this.y, //dy
            this.width / this.totalFrames, //dw
            this.height); //dh

        return false;
    }

    getNextFrame() {
        if (this.frame === this.totalFrames - 1) {
            this.frame = 0;
        } else {
            this.frame++;
        }
    }

}

class Duck extends Sprite {
    constructor(x, y, sx, sy, totalFrames, spriteWidth, spriteHeight, dx, image, context) {
        super(x, y, sx, sy, totalFrames, spriteWidth, spriteHeight, image, context);
        this.dx = dx;
        this.dy = Math.random()*10-5;
    }

    render() {
        super.render();
        this.fly();
    }

    fly() {
        this.x+=this.dx;
        this.y+=this.dy;
    }
}

class DuckHunted extends Sprite {
    constructor(x, y, sx, sy, totalFrames, spriteWidth, spriteHeight, image, context) {
        super(x, y, sx, sy, totalFrames, spriteWidth, spriteHeight, image, context);
        this.life = 0;
    }

    render() {
        super.render();
        this.life++;
    }

}

class DogWalking extends Sprite {
    constructor(x, y, sx, sy, totalFrames, spriteWidth, spriteHeight, image, context) {
        super(x, y, sx, sy, totalFrames, spriteWidth, spriteHeight, image, context);
        this.dx = 5;
    }

    render() {
        super.render();
        this.walk();
    }

    walk() {
        this.x+=this.dx;
    }
}

class DogJumping extends Sprite {
    constructor(x, y, sx, sy, totalFrames, spriteWidth, spriteHeight, image, context) {
        super(x, y, sx, sy, totalFrames, spriteWidth, spriteHeight, image, context, 2);
    }
}

class DogResultAnimation extends Sprite {
    constructor(x, y, sx, sy, totalFrames, spriteWidth, spriteHeight, image, context) {
        super(x, y, sx, sy, totalFrames, spriteWidth, spriteHeight, image, context, 10);
        this.dy = -5;
    }

    render() {
        super.render();

        if (this.y > 455) {
            this.y += this.dy;
        } else {
            return "RENDERED";
        }
    }
}


class Game {
    constructor(sprite) {
        this.canvas = document.getElementById("canvas");
        this.context = this.canvas.getContext('2d');
        this.sprite = sprite;

        this.FPS = 15;
        this.DUCKS_ON_SCREEN = 2;
        this.duckSpeed = 3;
        this.level = 1;
        this.bullets = 4;
        this.nextRound = false;

        this.ducks = [
            //x, y, sx, sy, totalFrames, spriteWidth, spriteHeight, image, context
        ];

        this.ducksKilled = [
            //x, y, sx, sy, totalFrames, spriteWidth, spriteHeight, image, context
        ];

        this.dogState = "WALKING";
        this.dogTimeAnimation = 0;

        //sound effects
        this.sounds = {
            'shoot': 'gunshoot.mp3',
            'dog': 'dogsound.mp3',
            'laugh': 'laugh.mp3',
            'perfect': 'perfect.mp3',
            'gotduck': 'gotduck.mp3'
        };

        //dog sprites
        this.dogWalking = new DogWalking(200, 450, 0, 0, 5, 300, 45, this.sprite, this.context);
        this.dogJumping = new DogJumping(200, 450, 0, 60, 3, 175, 105, this.sprite, this.context);
        this.dogResult = null;

        this.canvas.addEventListener('click', (e) => {
            if(this.bullets > 0 && this.nextRound) {
                this.bullets--;
                (new Audio(this.sounds.shoot)).play();
                const x = e.offsetX;
                const y = e.offsetY;
                this.checkCollision(x, y);
            }
        });

        this.ducksKilledInRound = 0;
        this.ducksKilledInTotal = 0;

        //stats elements
        this.ducksKilledLbl = document.getElementById('ducks-killed');
        this.levelLbl = document.getElementById('level');
        this.bulletsContainer = document.getElementById('bullets-container');

        this.update();
    }

    nextLevel() {
        if (this.ducksKilledInTotal % 10 === 0) {
            this.level++;
            this.duckSpeed++;
        }
    }

    generateDucks() {
        while (this.ducks.length < this.DUCKS_ON_SCREEN) {
            const y =  Math.floor(Math.random() * (460 - 0 + 1) + 0);
            this.ducks.push(new Duck(0, y, 0, 120, 3, 120, 30, this.duckSpeed, this.sprite, this.context));
        }
    }

    updateStats () {
        this.ducksKilledLbl.innerText = this.ducksKilledInTotal;
        this.levelLbl.innerText = this.level;
        this.bulletsContainer.innerHTML = '';
        for (let i = 0; i < this.bullets; i++) {
            this.bulletsContainer.innerHTML += '<img src="bullet.png" alt="">';
        }
    }


    dogAnimation() {
        this.dogTimeAnimation++;

        if (this.dogTimeAnimation >= 0 && this.dogTimeAnimation <= 10) {
            this.dogState = "WALKING";
        } else if (this.dogTimeAnimation > 10) {
            this.dogState = "JUMPING";
        }

        if (this.dogState === "WALKING") {
            this.dogWalking.render();
        } else if (this.dogState === "JUMPING") {
            if (this.dogTimeAnimation < 14) {
                this.dogJumping.x = this.dogWalking.x;
                this.dogJumping.render();
            }
        }

        return new Promise((resolve, reject) => {
            if (this.dogTimeAnimation === 16) {
                (new Audio(this.sounds.dog)).play();
                resolve(true);
            }
        })


    }

    checkCollision(x, y) {
        for (let i = 0; i < this.ducks.length; i++) {
            const duck = this.ducks[i];
            if ((x < (duck.x + (duck.width / duck.totalFrames)) && x >= duck.x)
                && (y < (duck.y + duck.height) && y >= duck.y)) {
                this.ducksKilled.push(
                    new DuckHunted(duck.x, duck.y, 0, 230, 1, 35, 45, this.sprite, this.context)
                );
                this.ducks.splice(i, 1);
                this.ducksKilledInRound++;
                this.ducksKilledInTotal++;
                this.nextLevel();
            }
        }
    }

    huntedDucksClearScreen() {
        for (let i = 0; i < this.ducksKilled.length; i++) {
            const duck = this.ducksKilled[i];
            if (duck.life > 10) {
                this.ducksKilled.splice(i, 1);
            }
        }
    }


    startNextRound() {
        setTimeout(()=> {
            this.ducksKilledInRound = 0;
            this.bullets = 4;
            this.dogResult = null;
            this.nextRound = false;
        }, 1000);
    }

    checkIfDucksAreOutOfBounds() {
        for (let i = 0; i < this.ducks.length; i++) {
            const duck = this.ducks[i];
            if (duck.x > 500 || duck.y + duck.height < 0 || duck.y > 500) {
                this.ducks.splice(i, 1);
            }
        }

        if (this.ducks.length === 0) {
            if (this.dogResult === null) {
                if (this.ducksKilledInRound === 0) {
                    this.dogResult = new DogResultAnimation(220, 500, 0, 270, 1, 50, 50, this.sprite, this.context);
                    (new Audio(this.sounds.laugh)).play();
                } else if (this.ducksKilledInRound === 1) {
                    this.dogResult = new DogResultAnimation(220, 500, 0, 320, 1, 50, 50, this.sprite, this.context);
                    (new Audio(this.sounds.gotduck)).play();
                } else {
                    this.dogResult = new DogResultAnimation(220, 500, 0, 375, 1, 60, 50, this.sprite, this.context);
                    (new Audio(this.sounds.perfect)).play();
                }
            }
        }
    }


    update() {

        this.updateStats();

        //clear screen
        this.context.fillStyle = "rgb(55,181,255)";
        this.context.fillRect(0,0,500,500);

        //paint ducks
        for (let i = 0; i < this.ducksKilled.length; i++) {
            this.ducksKilled[i].render();
        }

        //clear killed ducks
        this.huntedDucksClearScreen();

        //render dog result after round
        if (this.dogResult !== null) {
            if(this.dogResult.render()) {
                this.startNextRound();
            }
        }

        if (!this.nextRound) {
            this.dogAnimation().then((finished) => {
                if (finished) {
                    this.dogState = "WALKING";
                    this.dogWalking.x = 200;
                    this.dogTimeAnimation = 0;
                    this.nextRound = true;
                    this.generateDucks();
                }
            });
        } else {
            for (let i = 0; i < this.ducks.length; i++) {
                this.ducks[i].render();
            }
            this.checkIfDucksAreOutOfBounds();
        }

        setTimeout(() => {
            requestAnimationFrame(()=> {
                this.update();
            });
        }, 1000/this.FPS);
    }
}

class ImageSprite {
    constructor(url) {
        this.url = url;
        this.image = null;
    }

    createImage () {
        this.image = new Image();
        this.image.src = this.url;
        return this.image;
    }
}

let image = new ImageSprite('duckhunt.png');
let sprite = image.createImage();
sprite.onload = (e) => {
    (new Game(sprite));
}
