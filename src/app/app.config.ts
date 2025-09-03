// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router'; // Using hash location strategy for simplicity
import { routes } from './app.routes';

import { provideClientHydration } from '@angular/platform-browser';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

import { environment } from '../environments';

export const appConfig: ApplicationConfig = {
  providers: [
     provideRouter(routes, withHashLocation()),
    provideClientHydration(),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
};
