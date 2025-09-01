import CryptoJS from "crypto-js";



export const encrypt = async (plainText , secret_key) => {
  return CryptoJS.AES.encrypt(plainText, secret_key).toString();
};
