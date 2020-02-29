import express from 'express';
import dotenv from 'dotenv';
import { decodeEMVString } from './src/utils';
import { checkPaymentStatus } from './src/emv-parser';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.post('/poi-app', (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth || auth !== 'Bearer proif-kelompok-2') {
    return req.status(403).json({
      data: null,
      error: 'Unauthorized',
    });
  }

  const payload = req.body.payload;
  const pin = req.body.pin;

  try {
    const decodedPayload = decodeEMVString(payload, pin);

    return res.status(200).json({
      data: checkPaymentStatus(decodedPayload),
      error: null,
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      data: null,
      error: err.message
    });
  }
});

app.listen(port, () => {
  console.log(`App listening on ${port}`);
});