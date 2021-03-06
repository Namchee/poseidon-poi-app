const emv = require('node-emv');
const CustomError = require('./types').CustomError;

const parse = (str) => new Promise((resolve, reject) => {
  emv.parse(str, (data) => {
    if (data) {
      resolve(data);
    }

    reject(new Error('Cannot parse data'));
  });
});

/**
 * A function to check if QR payload can be used for payment in Poseidon POI system
 * Will throw an error with message if payload is not EMV BER TLV encoded string
 *
 * @param {string} str QR Payload
 * @return {Promise<boolean>} `true` if card is accepted, `false` otherwise
 * @throw An error if payload doesn't match specification
 */
async function checkPaymentStatus(str) {
  const hexString = Buffer.from(str, 'base64').toString('hex');
  const data = await parse(hexString);

  if (data.length === 0) {
    throw new CustomError('Not EMV BER TLV encoded data', 400);
  }

  // check payload format indicator
  if (data[0].tag !== '85' || Buffer.from(data[0].value, 'hex').toString('utf8') !== 'CPV01') {
    throw new CustomError('Data doesn\'t match specification', 400);
  }

  if (!data.some(tlv => tlv.tag === '61')) {
    throw new CustomError('Data should contain at least one "Application Template"', 400);
  }

  for (const mainTag of data) {
    switch (mainTag.tag) {
      case '61': {
        for (const appTag of mainTag.value) {
          switch (appTag.tag) {
            case '4F': { // parse AID
              const aid = Buffer.from(appTag.value, 'hex').toString('utf8');

              if (!aid.startsWith(process.env.AID)) {
                throw new CustomError('Unsupported AID', 400);
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
                throw new CustomError('Credit card rejected', 400);
              }

              if (ccn === process.env.CCN && serviceCode != process.env.SVC) {
                throw new CustomError('Service code for this credit card is unsupported', 400);
              }

              /*
              const date = Date.parse(`${expTime.substring(0, 2)}-${expTime.substring(2, 4)}-${new Date().getDate()}`);
 
              if (date < new Date().getTime()) {
                throw new Error('Payment card has expired');
              }
              */

              if (disData !== process.env.DIS_DATA) {
                throw new CustomError('Unsupported dicretionary data', 400);
              }

              break;
            }
            default: {
              continue;
            }
          }
        }
      }
      default: {
        continue;
      }
    }
  }

  return true;
}

module.exports.checkPaymentStatus = checkPaymentStatus;