export const calculateSkip = (page: number): number => {
  const adjustedPage = page - 1;

  if (adjustedPage === 0) {
    return 0;
  } else {
    return adjustedPage * 10;
  }
};
