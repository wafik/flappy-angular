import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'flappy-Bird';
  // Board
  boardWidth = 360;
  boardHeight = 640;

  // Bird
  birdWidth = 34;
  birdHeight = 24;
  birdX = this.boardWidth / 8;
  birdY = this.boardHeight / 2;

  // Define bird as an object
  bird = {
    x: this.birdX,
    y: this.birdY,
    width: this.birdWidth,
    height: this.birdHeight,
  };
  birdImg = new Image();

  // PIPE
  pipeArray: any[] = []; // You might want to implement this for managing pipes
  pipeWidth = 64;
  pipeHeight = 512;
  pipeX = this.boardWidth;
  pipeY = 0;

  pipeImageTop = new Image();
  pipeImageBottom = new Image();

  // physics
  velocityX = -2; //pipe move
  velocityY = 0; //bird jump speed
  gravity = 0.4;

  @ViewChild('board', { static: true }) board!: ElementRef;
  constructor() {
    this.birdImg = new Image();
    // Bind the update function to the class instance
    this.update = this.update.bind(this);
    this.placePipes = this.placePipes.bind(this);
    this.moveBird = this.moveBird.bind(this);
  }
  @HostListener('document:keydown', ['$event'])
  keyEventDown(event: KeyboardEvent) {
    if (event.code === 'Space'|| event.code == "ArrowUp" || event.code == "KeyX") {
      this.moveBird;
    }
  }
  // @HostListener('document:keyup', ['$event'])
  // keyEventUp(event: KeyboardEvent) {
  //   if(event.code === 'Space') this.spacePressed = true;

  // }
  createCanvas() {
    const canvas: HTMLCanvasElement = this.board.nativeElement;
    const context = canvas.getContext('2d');
    this.board.nativeElement.height = this.boardHeight;
    this.board.nativeElement.width = this.boardWidth;
    if (context) {
      this.birdImg.src = '../assets/flappybird.png';
      this.birdImg.onload = () => {
        context.drawImage(
          this.birdImg,
          this.bird.x,
          this.bird.y,
          this.bird.width,
          this.bird.height
        );
      };
      this.pipeImageTop.src = '../assets/toppipe.png';
      this.pipeImageBottom.src = '../assets/bottompipe.png';
    }
    requestAnimationFrame(this.update);
    setInterval(this.placePipes, 1500);
  }

  ngOnInit(): void {
    this.createCanvas();
  }

  moveBird() {
    this.velocityY = -6;
  }
  update() {
    requestAnimationFrame(this.update);
    const canvas: HTMLCanvasElement = this.board.nativeElement;
    const context = canvas.getContext('2d');
    // bird
    this.velocityY += this.gravity;
    this.bird.y += this.velocityY;
    context?.drawImage(
      this.birdImg,
      this.bird.x,
      this.bird.y,
      this.bird.width,
      this.bird.height
    );
    // You can implement pipe drawing and other game logic here
    for (let index = 0; index < this.pipeArray.length; index++) {
      const element = this.pipeArray[index];
      element.x += this.velocityX;
      context?.drawImage(
        element.img,
        element.x,
        element.y,
        element.width,
        element.height
      );
    }
  }

  placePipes() {
    let randomPipeY =
      this.pipeY - this.pipeHeight / 4 - Math.random() * (this.pipeHeight / 2);
    let openingSpace = this.board.nativeElement.height / 4;
    let topPipe = {
      img: this.pipeImageTop,
      x: this.pipeX,
      y: randomPipeY,
      width: this.pipeWidth,
      height: this.pipeHeight,
      passed: false,
    };
    this.pipeArray.push(topPipe);

    let bottomPipe = {
      img: this.pipeImageBottom,
      x: this.pipeX,
      y: randomPipeY + this.pipeHeight + openingSpace,
      width: this.pipeWidth,
      height: this.pipeHeight,
      passed: false,
    };
    this.pipeArray.push(bottomPipe);
  }
}
