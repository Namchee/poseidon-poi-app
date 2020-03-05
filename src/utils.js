const crypto = require('crypto');
const CustomError = require('./types').CustomError;

/**
 * A utility function to check if a string is a valid base64 encoded string
 * 
 * @param {string} str String to be checked
 * @return {boolean} `true` if the string is a base64 encoded string, `false`
 * otherwise
 */
function isBase64(str) {
  // Courtesy of: Philzen (https://stackoverflow.com/a/35002237/11202771)
  const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

  return base64regex.test(str);
}

/**
 * A utility function to generate MD5 hash from password to
 * hexadecimal string
 *
 * @param {string} pass Password to be hashed
 * @return {string} Hashed MD5 password in hex string
 */
function generatePasswordHash(pass) {
  return crypto.createHash('md5').update(pass).digest('hex');
}

/**
 * A function to decode input string with AES algorithm in CBC mode
 *
 * @param {string} str Encyrpted string
 * @param {string} pass String used for password, a.k.a key
 * @return {string} Decoded string 
 */
function decodeAES256(str, pass) {
  const passHash = generatePasswordHash(pass);
  const iv = 'proif-kelompok-2';

  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(passHash), Buffer.from(iv));

  let plainText = decipher.update(Buffer.from(str, 'base64'));
  plainText = Buffer.concat([plainText, Buffer.from(decipher.final())]);

  return plainText.toString();
}

/**
 * A function to perform basic decode and basic validation to QR payload
 * Will throw an error with proper message if payload is invalid
 *
 * @param {string} str String to be checked
 * @return {string} Decrypted EMV QR code payload
 */
function decodeEMVString(str, pass) {
  try {
    const payload = decodeAES256(str, pass);

    if (payload.substring(0, 8) !== 'hQVDUFY') {
      throw new CustomError('Wrong PIN or not EMV QR code', 401);
    }

    if (!isBase64(payload)) {
      throw new CustomError('Not base64 encoded string', 400);
    }

    return payload;
  } catch (err) {
    throw new Error('Decode error');
  }
}

module.exports.decodeEMVString = decodeEMVString;
