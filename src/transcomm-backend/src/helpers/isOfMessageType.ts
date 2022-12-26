export function isOfMessageType(
  allowedMessageTypes: string | undefined,
  inputMessageType: string,
): boolean {
  if (!allowedMessageTypes) return false;
  return allowedMessageTypes
    .split(',')
    .map((msgType: string) => msgType.trim())
    .includes(inputMessageType.trim());
}
