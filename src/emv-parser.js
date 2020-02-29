import emv from 'node-emv';
import { CustomError } from './types';
import { promisify } from 'util';

const parse = promisify(emv.parse);

/**
 * A function to check if QR payload can be used for payment in Poseidon POI system
 * Will throw an error with message if payload is not EMV BER TLV encoded string
 *
 * @param {string} str QR Payload
 * @return {boolean} `true` if card is accepted, `false` otherwise
 * @throw An error if payload doesn't match specification
 */
export async function checkPaymentStatus(str) {
  const data = await parse(str);

  if (data.length === 0) {
    throw new CustomError('Not EMV BER TLV encoded data', 400);
  }

  // check payload format indicator
  if (data[0].tag !== '85' || Buffer.from(data[0].value, 'hex').toString('utf8') !== 'CPV01') {
    throw new Error('Data doesn\'t match specification');
  }

  if (!data.some(tlv => tlv.tag === '61')) {
    throw new Error('Data should contain at least one "Application Template"');
  }

  for (const mainTag of data) {
    switch (mainTag.tag) {
      case '61': {
        for (const appTag of mainTag.value) {
          switch (appTag.tag) {
            case '4F': { // parse AID
              const aid = Buffer.from(appTag.value, 'hex').toString('utf8');

              if (!aid.startsWith(process.env.AID)) {
                throw new Error('Unsupported AID');
              }

              break;
            }
            case '57': { // parse Track 2 equivalent data
              const cleaned = appTag.value.replace('f', ''); // remove padding
              const separated = cleaned.split('d');
              const ccn = separated[0];
              const expTime = separated[1].slice(0, 4);
              const serviceCode = separated[1].slice(4, 7);
              const disData = separated[1].slice(7);

              if (ccn !== process.env.CCN) {
                return false;
              }

              const date = Date.parse(`${expTime.substring(0, 2)}-${expTime.substring(2, 4)}-${new Date().getDate()}`);

              if (date < new Date().getTime()) {
                throw new Error('Payment card has expired');
              }

              break;
            }
          }
        }
      }
    }
  }

  return true;
}
