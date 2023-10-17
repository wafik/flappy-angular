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
  isGameOver = false;
  score = 0;
  scoreBest = 0;

  @ViewChild('board', { static: true }) board!: ElementRef;
  constructor() {
    this.birdImg = new Image();
    // Bind the update function to the class instance
    this.update = this.update.bind(this);
    this.placePipes = this.placePipes.bind(this);
    this.moveBird = this.moveBird.bind(this);
    this.detectCollision = this.detectCollision.bind(this);
    this.playAudioPoint = this.playAudioPoint.bind(this);
    this.playAudioHit = this.playAudioHit.bind(this);
    this.playAudioWing = this.playAudioWing.bind(this);
    this.localStorageScoreBest = this.localStorageScoreBest.bind(this);
  }
  @HostListener('document:keydown', ['$event'])
  keyEventDown(event: KeyboardEvent) {
    if (
      event.code === 'Space' ||
      event.code == 'ArrowUp' ||
      event.code == 'KeyX'
    ) {
      this.moveBird();
    }
  }
  onClick(event: any) {
    this.moveBird();
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
    this.localStorageScoreBest();
  }

  moveBird() {
    this.velocityY = -6;

    this.playAudioWing();
    if (this.isGameOver) {
      this.bird.y = this.birdY;
      this.pipeArray = [];
      this.score = 0;
      this.isGameOver = false;
    }
  }
  update() {
    requestAnimationFrame(this.update);
    if (this.isGameOver) {
      return;
    }
    let canvas: HTMLCanvasElement = this.board.nativeElement;
    let context = canvas.getContext('2d');
    // clear drawing
    context?.clearRect(
      0,
      0,
      this.board.nativeElement.width,
      this.board.nativeElement.height
    );

    // bird
    this.velocityY += this.gravity;

    // validation bird cannot fly or jump out of canvas
    this.bird.y = Math.max(this.bird.y + this.velocityY, 0);
    context?.drawImage(
      this.birdImg,
      this.bird.x,
      this.bird.y,
      this.bird.width,
      this.bird.height
    );
    // context?.fillStyle="";
    if (this.bird.y > this.board.nativeElement.height) {
      this.isGameOver = true;
    }
    for (let i = 0; i < this.pipeArray.length; i++) {
      let pipe = this.pipeArray[i];
      pipe.x += this.velocityX;
      context?.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

      if (!pipe.passed && this.bird.x > pipe.x + pipe.width) {
        this.score += 0.5;
        pipe.passed = true;
        this.playAudioPoint();
        this.localStorageScoreBest();
      }
      if (this.detectCollision(this.bird, pipe)) {
        this.playAudioHit();
        this.isGameOver = true;
      }
    }
    // clear pipe
    while (this.pipeArray.length > 0 && this.pipeArray[0].x < -this.pipeWidth) {
      this.pipeArray.shift();
    }

    // score
    context!.fillStyle = 'white';
    context!.font = '45px sans-serif';
    context?.fillText(
      this.score.toString(),
      this.board.nativeElement.width / 2,
      45
    );

    if (this.isGameOver) {
      this.localStorageScoreBest();
      context?.fillText(
        'GAME OVER',
        this.board.nativeElement.width / 7,
        this.board.nativeElement.height / 2
      );
      context?.fillText(
        'Your Score : ' + this.score.toString(),
        this.board.nativeElement.width / 7,
        this.board.nativeElement.height / 2 + 45
      );

      context!.font = '20px sans-serif';
      context?.fillText(
        'Press To Restart',
        this.board.nativeElement.width / 3,
        this.board.nativeElement.height / 2 + 90
      );
      context!.font = '20px sans-serif';
      context?.fillText(
        'Best Score : ' + this.scoreBest.toString(),
        this.board.nativeElement.width / 3,
        this.board.nativeElement.height / 2 + 120
      );
    }
  }

  placePipes() {
    if (this.isGameOver) {
      return;
    }
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

  detectCollision(a: any, b: any) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  playAudioPoint() {
    let audio = new Audio();
    audio.src = '../assets/audio/point.wav';
    audio.load();
    audio.play();
  }
  playAudioHit() {
    let audio = new Audio();
    audio.src = '../assets/audio/hit.wav';
    audio.load();
    audio.play();
  }
  playAudioWing() {
    let audio = new Audio();
    audio.src = '../assets/audio/wing.ogg';
    audio.load();
    audio.play();
  }
  // localstorage for know best score
  localStorageScoreBest() {
    this.scoreBest = parseInt(localStorage.getItem('SCORE_BEST_KEY') ?? '0');
    if (this.scoreBest < this.score) {
      localStorage.setItem('SCORE_BEST_KEY', `${this.score}`);
      this.scoreBest = this.score;
    }
  }
}
