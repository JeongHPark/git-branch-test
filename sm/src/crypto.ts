// import bcrypt from "bcryptjs";

// const hashPassword = async (plain: string): Promise<string> => {
//   return bcrypt.hash(plain, 10);
// };

// const comparedPassword = async (plain: string,hashed: string): Promise<boolean> => {
//   return bcrypt.compare(plain, hashed);
// };

import crypto, { verify } from "crypto";
import util from "util";

const pdkdf2Promise = util.promisify(crypto.pbkdf2);
const randomBytesPromise = util.promisify(crypto.randomBytes);

const createSalt = async () => {
  const salt = await randomBytesPromise(64);
  console.log("1");
  return salt.toString("base64");
};

const KEY_STRECTING = 10000;

const createHashedPassword = async (userPwd: string) => {
  try {
    const salt = await createSalt();
    const key = await pdkdf2Promise(
      userPwd,
      salt,
      Number(KEY_STRECTING),
      64,
      "sha512"
    );

    console.log("key = ", key);

    const hashedPassword = key.toString("base64");
    console.log("hashedPassword = ", hashedPassword);
    return hashedPassword;
  } catch (err) {
    return null;
  }
};

const userPwd = "1234";

const verifyPassword = async (DBPwd: string, userPwd: string) => {
  try {
    const key = await pdkdf2Promise(
      userPwd,
      "NigvdPsUabgU1/TrAv9BB6m2lTUIBEv29oQDZtnp5Pcb10j4UX0MWmrDiXbH5z9PiQq1cixE+65KSxq82r2nYw==",
      Number(KEY_STRECTING),
      64,
      "sha512"
    );

    const hashedPassword = key.toString("base64");
    console.log(hashedPassword);
    if (DBPwd !== userPwd) return false;
    return true;
  } catch (err) {
    return false;
  }
};
const abc =
  "GQh75XGbf02vEjw120hc0EPEVToNqq8sbUHZOjz/3nA6IOveTEA6WKT8oEsfbCqFBKAoccrK05gwtccQowLRnA==GQh75XGbf02vEjw120hc0EPEVToNqq8sbUHZOjz/3nA6IOveTEA6WKT8oEsfbCqFBKAoccrK05gwtccQowLRnA==";
verifyPassword(abc, "1234").then((a) => {
  console.log(a);
});
