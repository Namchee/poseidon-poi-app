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
 * A utility function to generate MD5 hash from password
 *
 * @param {string} pass Password to be hashed
 * @return {string} Hashed MD5 password
 */
function generatePasswordHash(pass) {
  return crypto.createHash('md5').update(pass).digest('hex');
}

/**
 * A function to decode input string with AES algorithm in CTR mode
 *
 * @param {string} str Encyrpted string
 * @param {string} pass String used for password, a.k.a key
 * @return {string} Decoded string 
 */
function decodeAES256(str, pass) {
  const passHash = generatePasswordHash(pass);
  const iv = process.env.IV_STRING;

  const decipher = crypto.createDecipheriv('aes-256-ccm', Buffer.from(passHash), Buffer.from(iv));
  let plainText = decipher.update(Buffer.from(str));
  plainText = Buffer.concat([plainText, decipher.final()]);
  return plainText.toString();
}

/**
 * A function to check if string is a valid EMV payload
 *
 * @param {string} str String to be checked
 * @return {boolean} `true` if string is a valid EMV payload, `false` otherwise 
 */
export function isValidEMVString(str, pass) {
  const payload = decodeAES256(str, pass);

  return payload.substring(0, 8) === 'hQVDUFY' && isBase64(payload);
}