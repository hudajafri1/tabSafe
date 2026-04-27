//storageEncryption.ts
//in tabSafe, all medication and schedule data is encrypted before being saved to the device. even if someone gains access to storage, they can't read
//anything without the user's PIN.

//HOW IT WORKS:
//user's PIN is used to derive an encryption key using PBKDF2 (a standard key derivation function). this means the key is never stored anywhere,
//it's just regenerated from the PIN each time. data is then encrypted using AES-256-GCM. a fresh random "salt" + IV are generated every encryption call for extra security.

// - PBKDF2 with 600k iterations makes brute forcing the PIN expensive
// - AES-256-GCM provides both encryption AND authentication (detects tampering)
// - crypto.subtle is the browser/JS runtime's built-in crypto API, no third party libraries needed
//
//references 
//AES-GCM + PBKDF2 implementation: https://medium.com/@thomas_40553/how-to-secure-encrypt-and-decrypt-data-within-the-browser-with-aes-gcm-and-pbkdf2-057b839c96b6
//crypto.subtle (Web Crypto API): https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt

async function deriveKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
    const encodedPin = new TextEncoder().encode(pin);
    const baseKey = await crypto.subtle.importKey(
      "raw", encodedPin, { name: "PBKDF2" }, false, ["deriveKey"]
    );
    return await crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: 600000, hash: "SHA-256" },
      baseKey,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  }
  
  export async function encryptData(plaintext: string, pin: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(pin, salt);
    const encodedData = new TextEncoder().encode(plaintext);
    const encryptedContent = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv, tagLength: 128 }, key, encodedData
    );
    const ciphertext = new Uint8Array(encryptedContent.slice(0, encryptedContent.byteLength - 16));
    const authTag = new Uint8Array(encryptedContent.slice(encryptedContent.byteLength - 16));
    return JSON.stringify({
      ciphertext: Array.from(ciphertext),
      iv: Array.from(iv),
      authTag: Array.from(authTag),
      salt: Array.from(salt),
    });
  }
  
  export async function decryptData(encryptedJson: string, pin: string): Promise<string> {
    const { ciphertext, iv, authTag, salt } = JSON.parse(encryptedJson);
    const key = await deriveKey(pin, new Uint8Array(salt));
    const dataWithAuthTag = new Uint8Array(ciphertext.length + authTag.length);
    dataWithAuthTag.set(ciphertext, 0);
    dataWithAuthTag.set(authTag, ciphertext.length);
    const decryptedContent = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(iv), tagLength: 128 }, key, dataWithAuthTag
    );
    return new TextDecoder().decode(decryptedContent);
  }