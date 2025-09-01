import CryptoJS from "crypto-js";

export const decrypt = async (plainText, secret_key) => {
  return CryptoJS.AES.decrypt(plainText, secret_key).toString(
    CryptoJS.enc.Utf8
  );
};
