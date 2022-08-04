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
