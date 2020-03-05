const express = require('express');
const decodeEMVString = require('./src/utils').decodeEMVString;
const checkPaymentStatus = require('./src/emv-parser').checkPaymentStatus;

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
  const logger = require('morgan');
  const dotenv = require('dotenv');
  dotenv.config();
  
  app.use(logger('dev'));
}

app.post('/poi-app', async (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth || auth !== 'Bearer proif-kelompok-2') {
    return res.status(403).json({
      data: null,
      error: 'Unauthorized',
    });
  }

  const payload = req.body.payload;
  const pin = req.body.pin;

  if (!payload || !pin) {
    return res.status(400).send({
      data: null,
      error: 'Incomplete data',
    });
  }

  try {
    const decodedPayload = decodeEMVString(payload, pin);
    const verdict = await checkPaymentStatus(decodedPayload);

    console.log(verdict);

    return res.status(200).json({
      data: verdict,
      error: null,
    });
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({
      data: null,
      error: err.message
    });
  }
});

app.listen(port, () => {
  console.log(`App listening on ${port}`);
});