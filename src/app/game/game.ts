import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth';
import { ScoreService } from '../services/score';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';

interface Ball { x: number; y: number; vx: number; vy: number; r: number; }

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './game.html',
  styleUrls: ['./game.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private cdr = inject(ChangeDetectorRef);
  private auth = inject(AuthService);
  private router = inject(Router);
  private scoreSvc = inject(ScoreService);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  private get isBrowser() { return isPlatformBrowser(this.platformId); }

  ctx!: CanvasRenderingContext2D;
  width = 480;
  height = 720;

  targetX = this.width / 2;
  targetY = this.height - 40;
  targetR = 30;

  ball: Ball = { x: this.width / 2, y: 60, vx: 2.6, vy: 0, r: 12 };
  gravity = 0.45;
  oscillate = true;
  dropped = false;
  landed = false;
  lastScore: number | null = null;
  animId = 0;

  ngAfterViewInit(): void {
    if (!this.isBrowser) return; 
    const canvas = this.canvasRef.nativeElement;
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2D context');
    this.ctx = ctx;
    this.reset();
    this.loop();
  }

  goToLeaderboard() { this.router.navigate(['/leaderboard']); }

  reset() {
    if (!this.isBrowser) return;
    this.ball.x = this.width / 2;
    this.ball.y = 60;
    this.ball.vx = 3 + Math.random() * 2;
    this.ball.vy = 0;
    this.oscillate = true;
    this.dropped = false;
    this.landed = false;
    this.lastScore = null;
    this.cdr.markForCheck();
  }

  drop() { if (this.isBrowser && !this.dropped) { this.oscillate = false; this.dropped = true; } }

  logout() { this.auth.logout().then(() => this.router.navigateByUrl('/auth')); }

  private update() {
    if (!this.isBrowser) return;
    const b = this.ball;
    if (this.oscillate) {
      b.x += b.vx;
      if (b.x < b.r || b.x > this.width - b.r) b.vx *= -1;
    } else if (!this.landed) {
      b.vy += this.gravity;
      b.y += b.vy;
      if (b.y + b.r >= this.targetY) {
        b.y = this.targetY - b.r;
        this.landed = true;
        this.computeScore();
      }
    }
  }

  private computeScore() {
    const dx = Math.abs(this.ball.x - this.targetX);
    const score = Math.max(0, Math.round(100 * (1 - Math.min(dx, 200) / 200)));
    this.lastScore = score;
    
    if (this.isBrowser) this.scoreSvc.saveScore(score);
    this.cdr.markForCheck();
  }

  private draw() {
    if (!this.isBrowser) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, this.targetY, this.width, this.height - this.targetY);

    ctx.beginPath();
    ctx.arc(this.targetX, this.targetY, this.targetR, 0, Math.PI * 2);
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(this.targetX, this.targetY, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#444';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(this.ball.x, this.ball.y, this.ball.r, 0, Math.PI * 2);
    ctx.fillStyle = '#2e6be6';
    ctx.fill();

    ctx.fillStyle = '#222';
    ctx.font = '16px system-ui, Arial';
    ctx.fillText(`x: ${this.ball.x.toFixed(0)}`, 10, 24);
    if (this.lastScore !== null) ctx.fillText(`Score: ${this.lastScore}`, 10, 44);
  }

  private loop = () => {
    if (!this.isBrowser) return;
    this.update();
    this.draw();
    this.animId = requestAnimationFrame(this.loop);
  };

  ngOnDestroy(): void {
    if (this.isBrowser && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.animId);
    }
  }
}
