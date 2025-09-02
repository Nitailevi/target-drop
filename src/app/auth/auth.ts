import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.html',
  styleUrls: ['./auth.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService) as AuthService;
  private router = inject(Router);

  mode: 'login' | 'register' = 'login';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  error = '';
  loading = false;

async submit() {
  this.error = '';
  if (this.form.invalid) return;
  const { email, password } = this.form.value as { email: string; password: string };
  this.loading = true;
  try {
    if (this.mode === 'login') {
      await this.auth.login(email, password);
    } else {
      await this.auth.register(email, password);
    }
    this.router.navigateByUrl('/game');
  } catch (e: any) {
    //
    
    console.error('AUTH ERROR:', e?.code, e?.message, e);
    // 
    const code = e?.code || '';
    if (code === 'auth/email-already-in-use') this.error = 'email in use';
    else if (code === 'auth/invalid-email') this.error = 'invalid email';
    else if (code === 'auth/weak-password') this.error = 'סweak password (min 6 chars)';
    else if (code === 'auth/operation-not-allowed') this.error = 'Email/Password not available.';
    else if (code === 'auth/network-request-failed') this.error = '. connection issue .';
    else this.error = e?.message || 'Auth error';
  } finally {
    this.loading = false;
  }
}

}
