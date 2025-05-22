import bcrypt from "bcrypt";

// function to hash passwords
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// function to compare passwords
export const comparePassword = async (
  enteredPassword: string,
  storedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(enteredPassword, storedPassword);
};
