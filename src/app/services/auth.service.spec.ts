import { TestBed } from '@angular/core/testing';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from './auth.service';

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn(() => () => undefined),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('should be ready after Firebase reports the session', () => {
    expect(service.ready()).toBe(false);

    const callback = vi.mocked(onAuthStateChanged).mock.calls[0][1] as (user: unknown) => void;
    callback({ uid: 'abc', isAnonymous: false });

    expect(service.ready()).toBe(true);
    expect(service.userId()).toBe('abc');
  });

  it('should ignore an anonymous session', () => {
    const callback = vi.mocked(onAuthStateChanged).mock.calls[0][1] as (user: unknown) => void;
    callback({ uid: 'anon', isAnonymous: true });

    expect(service.userId()).toBeNull();
  });

  it('should register and log in with e-mail and password', async () => {
    await service.register('a@b.cz', 'heslo123');
    await service.login('a@b.cz', 'heslo123');

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith({}, 'a@b.cz', 'heslo123');
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith({}, 'a@b.cz', 'heslo123');
  });
});
