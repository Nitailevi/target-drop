import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth';
import { GameComponent } from './game/game';
import { LeaderboardComponent } from './leaderboard/leaderboard'; 

export const routes: Routes = [
  { path: 'auth', component: AuthComponent },
  { path: 'game', component: GameComponent },
  { path: 'leaderboard', component: LeaderboardComponent },
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth' },
];
