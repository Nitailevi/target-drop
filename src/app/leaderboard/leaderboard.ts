import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, query, orderBy, limit, collectionData } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';


type GameRow = { uid: string; name?: string; score: number; date: string };

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaderboard.html',
  styleUrls: ['./leaderboard.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardComponent {
  private db = inject(Firestore);
  top$!: Observable<Array<GameRow & { when: string; display: string }>>; 

  constructor() {
    const gamesRef = collection(this.db, 'games');
    const q = query(gamesRef, orderBy('score', 'desc'), limit(10));

    this.top$ = collectionData(q, { idField: 'id' }).pipe(
      map((rows: any[]) =>
        rows.map(r => ({
          ...r,
          when: new Date(r.date).toLocaleString(),
          display: r.name || r.uid,   
        }))
      )
    );
  }
}
