export const calculateNumberOfPages = (
  numberOfRows: number,
  numberPerPage = 10,
): number => {
  return Math.ceil(numberOfRows / numberPerPage);
};
