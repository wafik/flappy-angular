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
  pipeArray: any[] = [];
  pipeWidth = 64;
  pipeHeight = 512;
  pipeX = this.boardWidth;
  pipeY = 0;

  pipeImageTop = new Image();
  pipeImageBottom = new Image();

  // Physics
  velocityX = -2; 
  velocityY = 0;
  gravity = 0.4;
  isGameOver = false;

  @ViewChild('board', { static: true }) board!: ElementRef;

  constructor() {
    this.birdImg = new Image();
    this.update = this.update.bind(this);
    this.placePipes = this.placePipes.bind(this);
    this.moveBird = this.moveBird.bind(this);
  }

  @HostListener('document:keydown', ['$event'])
  keyEventDown(event: KeyboardEvent) {
    if (
      event.code === 'Space' ||
      event.code === 'ArrowUp' ||
      event.code === 'KeyX'
    ) {
      this.moveBird();
    }
  }

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
    this.velocityY = -8; // Adjust this value for jump height
  }

  update() {
    requestAnimationFrame(this.update);
    const canvas: HTMLCanvasElement = this.board.nativeElement;
    const context = canvas.getContext('2d');

    // Bird
    this.velocityY += this.gravity;
    this.bird.y += this.velocityY;
    context?.clearRect(0, 0, this.boardWidth, this.boardHeight);
    context?.drawImage(
      this.birdImg,
      this.bird.x,
      this.bird.y,
      this.bird.width,
      this.bird.height
    );

    // Pipe drawing and game logic
    for (let i = this.pipeArray.length - 1; i >= 0; i--) {
      const pipe = this.pipeArray[i];
      pipe.x += this.velocityX;

      // Draw pipes
      context?.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

      // Check for collisions with the bird
      if (
        this.bird.x + this.bird.width > pipe.x &&
        this.bird.x < pipe.x + pipe.width &&
        (this.bird.y < pipe.y ||
          this.bird.y + this.bird.height > pipe.y + pipe.height)
      ) {
        // Game over condition
        this.isGameOver = true;
        // You can add game over logic here
      }

      // Remove pipes that are out of the canvas
      if (pipe.x + pipe.width < 0) {
        this.pipeArray.splice(i, 1);
      }
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
