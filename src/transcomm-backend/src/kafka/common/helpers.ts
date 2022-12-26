export const recursiveSearch = (
  obj: any,
  searchKey: string,
  results: string[] = [],
): string[] => {
  const r = results;
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (key === searchKey && typeof value !== 'object') {
      if (!r.includes(value)) r.push(value);
    } else if (typeof value === 'object') {
      recursiveSearch(value, searchKey, r);
    }
  });
  return r;
};
