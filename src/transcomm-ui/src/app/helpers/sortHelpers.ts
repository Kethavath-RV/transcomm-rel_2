export const compareAlphaNumericString = (
  a: string | number,
  b: string | number,
): number => {
  return ('' + a).localeCompare('' + b, undefined, {
    sensitivity: 'base',
    numeric: true,
  });
};

export const compareDate = (a: Date | string, b: Date | string): number => {
  return new Date(b).getTime() - new Date(a).getTime();
};
