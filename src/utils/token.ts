// Generates a random token of 6 digits
export const generateToken = (): string => {
  const token = Math.floor(100000 + Math.random() * 900000).toString();
  return token;
};
