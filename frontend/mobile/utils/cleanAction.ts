export const cleanAction = (action: string, capitalize=true) => {
  let result = action.replaceAll('_', ' ');
  if (capitalize) {
    result = action.charAt(0).toUpperCase() + result.slice(1);
  }
  return result;
};
