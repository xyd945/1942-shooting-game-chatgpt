let f35;
let bullets = [];
let enemies = [];
let enemyBullets = [];
let f35Texture;
let enemyTexture;
let f35ShootSound;
let enemyShootSound;
let enemyHitSound;
let f35HitSound;
let score = 0;
let backgroundImage;

function preload() {
  f35Texture = loadImage('f35Texture.png');
  enemyTexture = loadImage('enemyTexture.png');
  f35ShootSound = new Audio('f35ShootSound.mp3');
  enemyShootSound = new Audio('enemyShootSound.mp3');
  enemyHitSound = new Audio('enemyHitSound.mp3');
  f35HitSound = new Audio('f35HitSound.mp3');
	backgroundImage = loadImage('background.png');
}

function setup() {
  createCanvas(1920, 960);
	
  f35 = new F35(width / 2, height - 50);
}

function draw() {
  background(51);
	background(backgroundImage);
  handleBullets();
  handleEnemies();
  handleEnemyBullets();

  f35.show();
  f35.move();

  checkCollisions();

  textSize(24);
  fill(255);
  text("Score: " + score, 10, 30);
  text("Health: " + f35.health, 10, 60);
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    f35.setDirection(-1);
  } else if (keyCode === RIGHT_ARROW) {
    f35.setDirection(1);
  } else if (keyCode === UP_ARROW) {
    f35.setDirection(0, -1);
  } else if (keyCode === DOWN_ARROW) {
    f35.setDirection(0, 1);
  } else if (key === ' ') {
    bullets.push(new Bullet(f35.x, f35.y - 20));
    f35ShootSound.play();
  }
}

function keyReleased() {
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
    f35.setDirection(0);
  }
	if (keyCode === UP_ARROW || keyCode === DOWN_ARROW) {
    f35.setDirection(f35.xDirection, 0);
  }
}

function handleBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].show();
    bullets[i].move();

    if (bullets[i].offscreen()) {
      bullets.splice(i, 1);
    }
  }
}

function handleEnemies() {
  if (random() < 0.01) {
    enemies.push(new Enemy(random(width), 0));
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].show();
    enemies[i].move();

    if (!enemies[i].hit && random() < 0.005) {
      enemies[i].shoot();
    }

    if (enemies[i].offscreen()) {
      enemies.splice(i, 1);
    }
  }
}


function handleEnemyBullets() {
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    enemyBullets[i].show();
    enemyBullets[i].move();

    if (enemyBullets[i].offscreen()) {
      enemyBullets.splice(i, 1);
    }
  }
}

function checkCollisions() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    for (let j = enemies.length - 1; j >= 0; j--) {
      if (bullets[i] && bullets[i].hits(enemies[j])) {
        bullets.splice(i, 1);
        enemies[j].hit = true;
        enemyHitSound.play();
        score++;
				enemies.splice(j, 1);
      }
    }
  }

  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    if (enemyBullets[i].hits(f35)) {
      enemyBullets.splice(i, 1);
      f35.hit();
      if (f35.health <= 0) {
        gameOver();
      }
    }
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
    if (enemies[i].hits(f35)) {
      f35.hit();
      if (f35.health <= 0) {
        gameOver();
      }
		}	
	}
  for (let i = enemies.length - 1; i >= 0; i--) {
    if (collidesWith(enemies[i], f35)) {
      f35.hit();
      if (f35.health <= 0) {
        gameOver();
      }			
    }
  }
}

function collidesWith(obj1, obj2) {
  let distance = dist(obj1.x, obj1.y, obj2.x, obj2.y);
  let radiusSum = obj1.r + obj2.r;
  return distance < radiusSum;
}
		

function gameOver() {
  textSize(32);
  textAlign(CENTER, CENTER);
  fill(255, 0, 0);
  text("GAME OVER", width / 2, height / 2);
  noLoop();
}

class F35 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 5;
    this.r = 20;
    this.health = 3;
    this.xDirection = 0;
    this.yDirection = 0;
  }

  show() {
    push();
    imageMode(CENTER);
    image(f35Texture, this.x, this.y, this.r * 2, this.r * 2);
    pop();
  }

  move() {
    this.x += this.xDirection * this.speed;
    this.y += this.yDirection * this.speed;
    this.x = constrain(this.x, this.r, width - this.r);
    this.y = constrain(this.y, this.r, height - this.r);
  }

  setDirection(xDir, yDir) {
    if (xDir !== undefined) this.xDirection = xDir;
    if (yDir !== undefined) this.yDirection = yDir;
  }

  hit() {
    this.health--;
    f35HitSound.play();
  }
}


class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = 5;
    this.speed = 10;
  }

  show() {
    fill(255);
    ellipse(this.x, this.y, this.r * 2);
  }

  move() {
    this.y -= this.speed;
  }

  offscreen() {
    return this.y < 0;
  }

  hits(obj) {
    let d = dist(this.x, this.y, obj.x, obj.y);
    return d < this.r + obj.r;
  }
}

class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = 20;
    this.hit = false;
		this.ySpeed = 2;
  }

  show() {
    push();
    imageMode(CENTER);
    image(enemyTexture, this.x, this.y, this.r * 2, this.r * 2);
    pop();
  }
	
	move() {
    this.y += this.ySpeed;
  }

  offscreen() {
    return this.y > height + this.r;
  }

  shoot() {
    enemyBullets.push(new EnemyBullet(this.x, this.y + this.r));
    enemyShootSound.play();
  }
	hits(obj) {
    let distance = dist(this.x, this.y, obj.x, obj.y);
    let radiusSum = this.r + obj.r;
    return distance < radiusSum;
  }
}

class EnemyBullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = 5;
    this.speed = 5;
  }

  show() {
    fill(255, 0, 0);
    ellipse(this.x, this.y, this.r * 2);
  }

  move() {
    this.y += this.speed;
  }

  offscreen() {
    return this.y > height;
  }

  hits(obj) {
    let d = dist(this.x, this.y, obj.x, obj.y);
    return d < this.r + obj.r;
  }
}
