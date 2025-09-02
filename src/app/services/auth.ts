import { Injectable, signal } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, User } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  user = signal<User | null>(null);

  constructor(private auth: Auth) {
    onAuthStateChanged(this.auth, (u) => this.user.set(u));
  }

  async register(email: string, password: string) {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    const name = (email || '').split('@')[0] || 'Player';
    await updateProfile(cred.user, { displayName: name });
    return cred;
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return signOut(this.auth);
  }

  get currentUser() {
    return this.auth.currentUser;
  }
}
