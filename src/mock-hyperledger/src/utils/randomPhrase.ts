export const randomPhrase = (...phrases: string[]) =>
  phrases[Math.floor(Math.random() * phrases.length)];
