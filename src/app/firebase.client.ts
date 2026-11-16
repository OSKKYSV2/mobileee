import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import { environment } from '../environments/environment';

// initializeApp() voláme na jediném místě, ostatní soubory importují hotové instance.
const app = initializeApp(environment.firebase);

export const firebaseAuth = getAuth(app);
export const firestore = getFirestore(app);
