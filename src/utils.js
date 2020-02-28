import crypto from 'crypto';

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
 * A utility function to generate SHA 256 hash from password
 *
 * @param {string} pass Password to be hashed
 * @return {string} Hashed SHA256 password
 */
function generatePasswordHash(pass) {
  return crypto.createHash('sha256').update(pass).digest('base64').substring(0, 32);
}

/**
 * A function to decode input string with AES algorithm in CTR mode
 *
 * @param {string} str Encyrpted string
 * @param {string} pass String used for password, a.k.a key
 * @return {string} Decoded string 
 */
export function decodeAES256(str, pass) {
  const passHash = generatePasswordHash(pass);
  const iv = 'proif-kelompok-2';

  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(passHash), Buffer.from(iv));

  let plainText = decipher.update(Buffer.from(str, 'base64'));
  plainText = Buffer.concat([plainText, Buffer.from(decipher.final())]);
  
  return plainText.toString();
}

/**
 * A function to check if string is a valid EMV payload.
 * Will throw an error with proper message if payload is invalid
 *
 * @param {string} str String to be checked
 * @return {string} Decrypted EMV QR code payload
 */
export function isValidEMVString(str, pass) {
  const payload = decodeAES256(str, pass);

  if (payload.substring(0, 8) !== 'hQVDUFY') {
    throw new Error('Wrong PIN or not EMV QR code');
  }

  if (!isBase64(payload)) {
    throw new Error('Not base64 encoded string');
  }

  return payload;
}