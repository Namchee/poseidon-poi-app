import express from 'express';
import dotenv from 'dotenv';
import logger from 'morgan';
import { decodeEMVString } from './src/utils.js';
import { checkPaymentStatus } from './src/emv-parser.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(logger('dev'));
const port = process.env.PORT || 3000;

app.post('/poi-app', (req, res, next) => {
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