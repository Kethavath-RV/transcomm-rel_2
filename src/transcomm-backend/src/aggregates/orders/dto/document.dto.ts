import { Document } from 'core';

export class DocumentDto implements Document {
  hash: string;
  path: string;
  name: string;
}
