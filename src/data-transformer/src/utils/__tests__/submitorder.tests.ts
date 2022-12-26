import app from '../../config/express';
import request from 'supertest';
import axios from 'axios';
import {
  invalidInputConfirmReturnDeliveryMissingTransportDocAndReturnRequestNumbers,
  validInput,
  validInputConfirmReturnDelivery,
} from '../testInput/validatorInput';
import { Order } from 'core';

jest.mock('../../config/env.validation', () => ({
  validateEnvironmentVariables() {
    console.log('Mocking environment variable validation');
  },
}));

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('/POST an order', () => {
  it('should return the order', (done) => {
    mockedAxios.post.mockImplementation(() =>
      Promise.resolve({ status: 200, data: { orderNumber: '12345' } }),
    );
    const order_data = JSON.parse(`{ 
      "id": "vc-id-validInput",
      "msgType": "submitOrder",
      "data": { }
    }`);
    order_data.data = JSON.parse(validInput);

    request(app)
      .post('/submitOrder')
      .send(order_data)
      .expect(200)
      .end(function (err: unknown, res: { body: Order }) {
        if (err) return done(err);
        expect(res.body.orderNumber).toEqual('12345');
        done();
      });
  });
});

describe('/POST an order without ordernumber', () => {
  it('should return a 422', (done) => {
    const order_data = JSON.parse(`{ 
      "id": "vc-id-validInput",
      "msgType": "submitOrder",
      "data": { "orderNumber": "" }
    }`);
    request(app)
      .post('/submitOrder')
      .send(order_data)
      .expect(422)
      .end(function (err: unknown) {
        if (err) return done(err);
        done();
      });
  });
});

describe('/POST an order gives 500', () => {
  it('should catch and return 500', (done) => {
    mockedAxios.post.mockImplementation(() =>
      Promise.reject(new Error('Error')),
    );
    const order_data = JSON.parse(`{ 
      "id": "vc-id-validInput",
      "msgType": "submitOrder",
      "data": { }
    }`);
    order_data.data = JSON.parse(validInput);

    request(app)
      .post('/submitOrder')
      .send(order_data)
      .expect(500)
      .end(function (err: unknown) {
        if (err) return done(err);
        done();
      });
  });
});

describe('/POST an order gives 400 if empty body', () => {
  it('should catch and return 400', (done) => {
    const order_data = JSON.parse(`{ 
      "id": "vc-id-validInput",
      "msgType": "submitOrder",
      "data": { }
    }`);

    request(app)
      .post('/submitOrder')
      .send(order_data)
      .expect(400)
      .end(function (err: unknown) {
        if (err) return done(err);
        done();
      });
  });
});

describe('/POST an returnDelivery', () => {
  it('should return the mock returnDelivery', (done) => {
    mockedAxios.post.mockImplementation(() =>
      Promise.resolve({ status: 200, data: { orderNumber: 'test-123' } }),
    );
    const order_data = JSON.parse(`{ 
      "id": "vc-id-validInput",
      "msgType": "confirmReturnDelivery",
      "data": { }
    }`);
    order_data.data = validInputConfirmReturnDelivery;

    request(app)
      .post('/confirmReturnDelivery')
      .send(order_data)
      .expect(200)
      .end(function (err: unknown, res: { body: Order }) {
        if (err) return done(err);
        expect(res.body.orderNumber).toEqual('test-123');
        done();
      });
  });
});

describe('/POST an confirmReturnDelivery with invalid data', () => {
  it('should return a 422', (done) => {
    const order_data = JSON.parse(`{ 
      "id": "vc-id-validInput",
      "msgType": "confirmReturnDelivery",
      "data": { }
    }`);
    order_data.data =
      invalidInputConfirmReturnDeliveryMissingTransportDocAndReturnRequestNumbers;

    request(app)
      .post('/confirmReturnDelivery')
      .send(order_data)
      .expect(422)
      .end(function (err: unknown) {
        if (err) return done(err);
        done();
      });
  });
});

describe('/POST an confirmReturnDelivery gives 500', () => {
  it('should catch and return 500', (done) => {
    mockedAxios.post.mockImplementation(() =>
      Promise.reject(new Error('Error')),
    );
    const order_data = JSON.parse(`{ 
      "id": "vc-id-validInput",
      "msgType": "confirmReturnDelivery",
      "data": { }
    }`);
    order_data.data = validInputConfirmReturnDelivery;

    request(app)
      .post('/confirmReturnDelivery')
      .send(order_data)
      .expect(500)
      .end(function (err: unknown) {
        if (err) return done(err);
        done();
      });
  });
});
