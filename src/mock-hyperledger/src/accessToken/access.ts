import { v4 as uuidv4 } from 'uuid';

let MOCK_JWT_TOKEN: string = uuidv4();

export function getJwt(): string {
  return MOCK_JWT_TOKEN;
}

export function generateNewJwt(): void {
  MOCK_JWT_TOKEN = uuidv4();
}
