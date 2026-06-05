// Toy shift cipher per brief — not real cryptography
export function encrypt(str: string, shift = 3): string {
  return str
    .split('')
    .map((char) => String.fromCharCode(char.charCodeAt(0) + shift))
    .join('')
}

export function decrypt(str: string, shift = 3): string {
  return str
    .split('')
    .map((char) => String.fromCharCode(char.charCodeAt(0) - shift))
    .join('')
}
