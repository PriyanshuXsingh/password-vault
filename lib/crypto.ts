// /lib/crypto.ts
export async function getKeyFromPassword(password: string, salt: string) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  return key;
}

export async function encryptData(
  plainText: string,
  password: string,
  salt: string
) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getKeyFromPassword(password, salt);

  const enc = new TextEncoder();
  const encoded = enc.encode(plainText);

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  // return base64 strings (safer for storage)
  const cipher = btoa(String.fromCharCode(...new Uint8Array(cipherBuffer)));
  const ivString = btoa(String.fromCharCode(...iv));

  return { cipher, iv: ivString };
}

export async function decryptData(
  cipherText: string,
  ivBase64: string,
  password: string,
  salt: string
) {
  try {
    const key = await getKeyFromPassword(password, salt);

    const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));
    const cipher = Uint8Array.from(atob(cipherText), (c) => c.charCodeAt(0));

    const plainBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      cipher
    );

    const dec = new TextDecoder();
    return dec.decode(plainBuffer);
  } catch (err) {
    console.error("Decryption failed:", err);
    return null;
  }
}
