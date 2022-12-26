export type SessionString = string | null;

interface ISessionStorage {
    id: SessionString;
    email: SessionString;
    firstName: SessionString;
    lastName: SessionString;
    role: SessionString;
    locked: SessionString;
    exp: SessionString;
}

export type SessionKeys = keyof ISessionStorage;

export class SessionStorageModel implements ISessionStorage {
    id: SessionString = null;
    email: SessionString = null;
    firstName: SessionString = null;
    lastName: SessionString = null;
    role: SessionString = null;
    locked: SessionString = null;
    exp: SessionString = null;
}
