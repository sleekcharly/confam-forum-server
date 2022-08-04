// get required imports
import { User } from "./User";
import bcrypt from "bcryptjs";
import { isPasswordValid } from "../common/validators/PasswordValidator";
import { isEmailValid } from "../common/validators/EmailValidator";

// for password encryption
const saltRounds = 10;

// User result type to indicate whether an error occurred during authentication.
export class UserResult {
  constructor(public messages?: Array<string>, public user?: User) {}
}

// registration function
export const register = async (
  email: string,
  userName: string,
  password: string
): Promise<UserResult> => {
  const result = isPasswordValid(password);
  if (!result.isValid) {
    return {
      messages: [
        "Password must have min length 8, 1 upper character, 1 number, and 1 symbol",
      ],
    };
  }

  const trimmedEmail = email.trim().toLowerCase();
  const emailErrorMsg = isEmailValid(trimmedEmail);
  if (emailErrorMsg) {
    return {
      messages: [emailErrorMsg],
    };
  }

  // encrypt password using the saltRounds constant and bcryptjs
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);

  // if we pass our validations, we create our User entity and then
  // immediately save it. These two methods are both from TypeORM, and note that
  // when making changes to the Entities database, you must always run the save
  // function or else it will not complete on the server.
  const userEntity = await User.create({
    email: trimmedEmail,
    userName,
    password: hashedPassword,
  }).save();

  userEntity.password = ""; // blank out for security
  // return the new entity
  return {
    user: userEntity,
  };
};
