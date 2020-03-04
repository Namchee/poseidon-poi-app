import { decodeAES256 } from './src/utils';
import crypto from 'crypto';
import emv from 'node-emv';

function generatePasswordHash(pass) {
  return crypto.createHash('md5').update(pass).digest('hex');
}

function encrypt(text) {
  const hash = generatePasswordHash('123456');

  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(hash), Buffer.from('proif-kelompok-2'));
  cipher.setAutoPadding(true);

  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return encrypted.toString('base64');
 }

const ganteng = encrypt('hQVDUFYwMWEjTxBwcm9pZi1rZWxvbXBvay0yVw8SNFZ4kBI0WNGRIgESNF8=');

console.log(ganteng);

console.log(decodeAES256('jcTkPAe87nVCb/tmb+JFg7nKdd4ZlILgrWzwpYd4UVUU4GgaqaH79JcBCke1b4XuVcKfRlSphuQhTB6x+lU7AQ==', '123456'));

emv.parse(Buffer.from('hQVDUFYwMWEaTwegAAAAVVVVVw8SNFZ4kBI0WNGRIgESNF8=', 'base64').toString('hex'), (data) => {
  console.log(JSON.stringify(data, null, 2));
});
