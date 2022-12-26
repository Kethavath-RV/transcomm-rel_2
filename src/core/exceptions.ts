export type ApplicationErrorOptions = {
  status?: number | null;
  errorCode?: string;
  path?: string;
  timestamp?: string;
  descriptiveMessage?: string;
  errorMessage?: string;
  errorName?: string;
};

export class ApplicationErrorBase {
  public status: number | null;
  public errorCode: string;
  public timestamp: string;
  public path: string;
  public descriptiveMessage: string;
  public errorMessage: string;
  public errorName: string;

  constructor(options?: ApplicationErrorOptions) {
    this.status = options?.status ?? null;
    this.errorCode = options?.errorCode ?? '';
    this.timestamp = options?.timestamp ?? new Date().toISOString();
    this.path = options?.path ?? 'Unknown path';
    this.descriptiveMessage = options?.descriptiveMessage ?? 'Unknown Issue';
    this.errorMessage = options?.errorMessage ?? '';
    this.errorName = options?.errorName ?? '';
  }
}
