import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';
import { AuthService } from './auth';

@Injectable({ providedIn: 'root' })
export class ScoreService {
  constructor(private db: Firestore, private auth: AuthService) {}

  async saveScore(score: number) {
    const user = this.auth.currentUser;
    if (!user) return;

    const name = user.displayName ?? user.email ?? 'Player';

    const gamesRef = collection(this.db, 'games');
    await addDoc(gamesRef, {
      uid: user.uid,
      name,               
      score,
      date: new Date().toISOString(),
    });
  }
}