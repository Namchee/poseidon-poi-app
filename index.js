import express from 'express';
import dotenv from 'dotenv';
import { isValidEMVString } from './src/utils';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.post('/poi-app', (req, res, next) => {
  const payload = req.body.payload;
  const pin = req.body.pin;

  if (!isValidEMVString(payload, pin)) {
    return res.status(400).json({
      data: null,
      error: 'Wrong PIN or not EMV QR code'
    });
  }
});

app.listen(port, () => {
  console.log(`App listening on ${port}`);
});