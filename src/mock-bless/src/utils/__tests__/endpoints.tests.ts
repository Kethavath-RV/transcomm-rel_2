import app from '../../config/express';
import request from 'supertest';
const encodeBase64 = require('btoa');

jest.mock('../../config/env.validation', () => ({
  validateEnvironmentVariables() {
    console.log('Mocking environment variable validation');
  },
}));

describe('/POST to submitOrderToKafka', () => {
  it('should return a 200', (done) => {
    const kafka = require('../../config/kafka');
    jest
      .spyOn(kafka, 'ProduceBusinessMessage')
      .mockImplementation(async () => Promise.resolve('Success'));
    const data = {
      id: 'kafka-12345',
      msgType: 'pickupfile',
      message: [
        {
          OrderNumber: '12345',
        },
      ],
    };

    request(app)
      .post('/submitOrderToKafka')
      .field('message', JSON.stringify(data.message, null, 2))
      .set({ 'bless-message-type': 'TC_DHLE_ORDER' })
      .expect(200)
      .end(function (err: unknown) {
        if (err) return done(err);
        done();
      });
  });
});

describe('/POST to postPickUpFileToKafka', () => {
  it('should return a 200', (done) => {
    const kafka = require('../../config/kafka');
    jest
      .spyOn(kafka, 'ProducePickupMovementsMessage')
      .mockImplementation(async () => Promise.resolve('Success'));

    const data = {
      id: 'kafka-12345',
      msgType: 'TC_DHLE_CUR_STA',
      sender: 'TRANS_REQ',
      uuid: '1530573d-d8bc-40ae-83f6-20a6520044ed',
      msgFilePath:
        '/u01/m01/transreq/nissan/1530573d-d8bc-40ae-83f6-20a6520044ed.json',
      messages: encodeBase64(
        JSON.stringify({
          StatusCode: 'PU',
          Weight: 0.8,
          volumeWeight: 1.2,
          WeightQualifier: 'KGM',
          ShipperReference: 'ORD-T-4100152TDZ',
          AirwayBillNo: '2511188466',
          DeliveryDate: '2020/10/19',
          DeliveryTime: '12:25',
          PickupDate: '2020/10/19',
          Destination: 'RUH',
          Origin: 'DXB',
          NumberOfPackages: 1,
        }),
      ),
    };
    request(app)
      .post('/postPickupFileToKafka')
      .send(data)
      .expect(200)
      .end(function (err: unknown) {
        if (err) return done(err);
        done();
      });
  });
});

describe('/POST to postMasterMovementFileToKafka', () => {
  it('should return a 200', (done) => {
    const kafka = require('../../config/kafka');
    jest
      .spyOn(kafka, 'ProducePickupMovementsMessage')
      .mockImplementation(async () => Promise.resolve('Success'));

    const data = {
      id: 'kafka-12345',
      msgType: 'TC_DHLE_CUR_STA',
      sender: 'TRANS_REQ',
      uuid: '1530573d-d8bc-40ae-83f6-20a6520044ed',
      msgFilePath:
        '/u01/m01/transreq/nissan/1530573d-d8bc-40ae-83f6-20a6520044ed.json',
      messages: encodeBase64(
        JSON.stringify({
          StatusCode: 'PU',
          Weight: 0.8,
          volumeWeight: 1.2,
          WeightQualifier: 'KGM',
          ShipperReference: 'ORD-T-4100152TDZ',
          AirwayBillNo: '2511188466',
          DeliveryDate: '2020/10/19',
          DeliveryTime: '12:25',
          PickupDate: '2020/10/19',
          Destination: 'RUH',
          Origin: 'DXB',
          NumberOfPackages: 1,
        }),
      ),
    };
    request(app)
      .post('/postMasterMovementFileToKafka')
      .send(data)
      .expect(200)
      .end(function (err: unknown) {
        if (err) return done(err);
        done();
      });
  });
});

describe('/POST to postDetailMovementFileToKafka', () => {
  it('should return a 200', (done) => {
    const kafka = require('../../config/kafka');
    jest
      .spyOn(kafka, 'ProducePickupMovementsMessage')
      .mockImplementation(async () => Promise.resolve('Success'));

    const data = {
      id: 'kafka-12345',
      msgType: 'TC_DHLE_CUR_STA',
      sender: 'TRANS_REQ',
      uuid: '1530573d-d8bc-40ae-83f6-20a6520044ed',
      msgFilePath:
        '/u01/m01/transreq/nissan/1530573d-d8bc-40ae-83f6-20a6520044ed.json',
      messages: encodeBase64(
        JSON.stringify({
          StatusCode: 'PU',
          Weight: 0.8,
          volumeWeight: 1.2,
          WeightQualifier: 'KGM',
          ShipperReference: 'ORD-T-4100152TDZ',
          AirwayBillNo: '2511188466',
          DeliveryDate: '2020/10/19',
          DeliveryTime: '12:25',
          PickupDate: '2020/10/19',
          Destination: 'RUH',
          Origin: 'DXB',
          NumberOfPackages: 1,
        }),
      ),
    };

    request(app)
      .post('/postDetailMovementFileToKafka')
      .send(data)
      .expect(200)
      .end(function (err: unknown) {
        if (err) return done(err);
        done();
      });
  });
});

describe('/POST to postNotificationToKafka', () => {
  it('should return a 200', (done) => {
    const kafka = require('../../config/kafka');
    jest
      .spyOn(kafka, 'ProduceNotificationMessage')
      .mockImplementation(async () => Promise.resolve('Success'));

    const data = {
      id: 'kafka-12345',
      type: 'PROCESSED',
      data: {
        'Test-PII-Data': 'TestVal',
      },
    };

    request(app)
      .post('/postNotificationToKafka')
      .send(data)
      .expect(200)
      .end(function (err: unknown) {
        if (err) return done(err);
        done();
      });
  });
});
