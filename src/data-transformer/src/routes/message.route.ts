import express from 'express';
import { CancelOrder, ConfirmReturnDelivery, Order, ReturnOrder } from 'core';
import asyncHandler from 'express-async-handler';
import {
  validateConfirmReturnDeliveryData,
  validateData,
} from '../validation/schemaValidator';
import axios, { AxiosRequestConfig } from 'axios';
const FormData = require('form-data');

const blessURL = process.env.BLESS_URL;
const blessRoute = process.env.BLESS_ROUTE;

const router = express.Router();

axios.interceptors.request.use((request) => {
  console.log(`Sending Request to: ${request.url}`);
  return request;
});

router.post('/submitOrder', asyncHandler(submitOrder));
router.post('/confirmReturnDelivery', asyncHandler(confirmReturnDelivery));

async function submitOrder(
  request: express.Request,
  response: express.Response,
) {
  try {
    const order: Order | ReturnOrder | CancelOrder = request.body.data;
    if (!order || Object.keys(order).length === 0) {
      response.status(400).send();
    }
    const isValid = validateData(order);
    if (isValid !== 'Success') {
      response.status(422).send({
        status: 'Order validation error',
        message: JSON.parse(isValid),
      });
    } else {
      // TEMPORARY ONLY -
      // In accordance with Shyams mail:
      // Bless trusted API URL is https in nature, so we will provide the cert certification details later on,
      // but as of now you can make unsecure connection by adding following code snippet before making axios call.
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

      const reqData = JSON.stringify([order], null, 2);

      const req = new FormData();
      req.append('message', reqData);

      const config: AxiosRequestConfig = {
        headers: {
          ...req.getHeaders(),
          Authorization: process.env.BLESS_AUTH ?? '',
          kid: process.env.BLESS_KID ?? '',
          'bless-message-type':
            process.env.BLESS_NEW_ORDER_MESSAGE_TYPE?.split(',')[0] ??
            'TC_DHLE_CORD',
          'did-enable': true,
          alg: 'EcdsaSecp256r1Signature2019',
          'bless-issuer': process.env.BLESS_ISSUER ?? 'LUXC_DXB',
          typ: 'JWT',
          'bless-application':
            process.env.BLESS_APPLICATION ?? 'DHL-EXP-TRANSCOM',
          'bless-subject-primary': process.env.SUBJECT_PRIMARY ?? 'DHL-EXP',
        },
      };
      const resp = await axios.post(`${blessURL}${blessRoute}`, req, config);

      response.status(resp.status).send(resp.data);
    }
  } catch (err) {
    response.status(500).send(err);
  }
}

async function confirmReturnDelivery(
  request: express.Request,
  response: express.Response,
) {
  try {
    const order: ConfirmReturnDelivery = request.body.data;
    const isValid = validateConfirmReturnDeliveryData(order);
    if (isValid !== 'Success') {
      response.status(422).send({
        status: 'Invalid Request, cannot be parsed to a valid return delivery',
        message: JSON.parse(isValid),
      });
    } else {
      // TEMPORARY ONLY -
      // In accordance with Shyams mail:
      // Bless trusted API URL is https in nature, so we will provide the cert certification details later on,
      // but as of now you can make unsecure connection by adding following code snippet before making axios call.
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

      const reqData = JSON.stringify([order], null, 2);

      const req = new FormData();
      req.append('message', reqData);

      const config: AxiosRequestConfig = {
        headers: {
          ...req.getHeaders(),
          Authorization: process.env.BLESS_AUTH ?? '',
          kid: process.env.BLESS_KID ?? '',
          'bless-message-type':
            process.env.BLESS_CONFIRM_RETURN_DELIVERY_MESSAGE_TYPE?.split(
              ',',
            )[0] ?? 'TC_DHLE_RDEL',
          'did-enable': true,
          alg: 'EcdsaSecp256r1Signature2019',
          'bless-issuer': process.env.BLESS_ISSUER ?? 'LUXC_DXB',
          typ: 'JWT',
          'bless-application':
            process.env.BLESS_APPLICATION ?? 'DHL-EXP-TRANSCOM',
          'bless-subject-primary': process.env.SUBJECT_PRIMARY ?? 'DHL-EXP',
        },
      };
      const resp = await axios.post(`${blessURL}${blessRoute}`, req, config); // Will Bless have a specific endpoint for ConfirmReturnDelivery?

      response.status(resp.status).send(resp.data);
    }
  } catch (err) {
    response.status(500).send(err);
  }
}

export default router;
