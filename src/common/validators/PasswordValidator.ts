export interface PasswordTestResult {
  message: string;
  isValid: boolean;
}

export const isPasswordValid = (password: string): PasswordTestResult => {
  const passwordTestResult: PasswordTestResult = {
    message: "",
    isValid: true,
  };

  if (password.length < 8) {
    passwordTestResult.message = "Password must be at least 8 characters";
    passwordTestResult.isValid = false;
    return passwordTestResult;
  }

  const strongPassword = new RegExp(
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
  );

  if (!strongPassword.test(password)) {
    passwordTestResult.message =
      "passowrd must contain at least 1 special character, 1 cap letter, and 1 number";
    passwordTestResult.isValid = false;
  }

  return passwordTestResult;
};

// add validator for email
export const isEmailValid = (email: string) => {
  // check for empty email address
  if (!email) return "Email cannot be empty";

  // check for the @ symbol
  if (!email.includes("@")) {
    return "Please enter a valid email address.";
  }

  // check for white space
  if (/\s+/g.test(email)) {
    return "Email cannot have whitespaces";
  }

  // if no issues are found return an empty string
  return "";
};
