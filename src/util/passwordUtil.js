const crypto = require("crypto");

const HASH_ALGORITHM = "scrypt";
const SALT_BYTES = 16;
const KEY_LENGTH = 64;

const hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(SALT_BYTES).toString("hex");
    crypto.scrypt(password, salt, KEY_LENGTH, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
};

const verifyPassword = (password, storedHash) => {
  return new Promise((resolve, reject) => {
    if (!storedHash || typeof storedHash !== "string" || !storedHash.includes(":")) {
      return resolve(false);
    }

    const [salt, key] = storedHash.split(":");
    crypto.scrypt(password, salt, KEY_LENGTH, (err, derivedKey) => {
      if (err) return reject(err);

      const storedBuffer = Buffer.from(key, "hex");
      const derivedBuffer = Buffer.from(derivedKey.toString("hex"), "hex");

      if (storedBuffer.length !== derivedBuffer.length) {
        return resolve(false);
      }

      resolve(crypto.timingSafeEqual(storedBuffer, derivedBuffer));
    });
  });
};

module.exports = {
  hashPassword,
  verifyPassword,
  HASH_ALGORITHM,
};
