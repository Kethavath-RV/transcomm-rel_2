export function strToBool(val: string | boolean): boolean {
  return String(val).toLowerCase() === 'true';
}
