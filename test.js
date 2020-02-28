import { decodeAES256 } from './src/utils';
import crypto from 'crypto';
import emv from 'node-emv';

function generatePasswordHash(pass) {
  return crypto.createHash('sha256').update(pass).digest('base64').substring(0, 32);
}

function encrypt(text) {
  const hash = generatePasswordHash('123456');

  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(hash), Buffer.from('proif-kelompok-2'));
  cipher.setAutoPadding(true);

  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return encrypted.toString('base64');
 }

const ganteng = encrypt('hello world');

console.log(ganteng);

console.log(decodeAES256(ganteng, '123456'));

emv.parse(Buffer.from('hQVDUFYwMWEaTwegAAAAVVVVVw8SNFZ4kBI0WNGRIgESNF8=', 'base64').toString('hex'), (data) => {
  console.log(data);
});
