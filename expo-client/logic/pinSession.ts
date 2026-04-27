//pinSession.ts
//
//after the user unlocks with their PIN, we need to remember it for the session
//so we can encrypt/decrypt data without asking for it every time.
//stored in memory only -- never written to disk, cleared when app closes.

let sessionPin: string | null = null;

//called right after successful unlock
export function setSessionPin(pin: string): void {
  sessionPin = pin;
}

//used by storageEncryption.ts to get the PIN when encrypting/decrypting
export function getSessionPin(): string | null {
  return sessionPin;
}

//clears PIN from memory if the app needs to relock
export function clearSessionPin(): void {
  sessionPin = null;
}