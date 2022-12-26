import { ConfirmReturnDelivery, SubmitOrder } from 'core';
import express from 'express';
import asyncHandler from 'express-async-handler';
import {
  ProduceBusinessMessage,
  ProduceNotificationMessage,
  ProducePickupMovementsMessage,
} from '../config/kafka';

const router = express.Router();
const customsTopic =
  process.env.KAFKA_TOPIC_CUSTOMS || 'DHL-EXP-TRANSCOM-TOPIC';
const pickupMovementsTopic =
  process.env.KAFKA_TOPIC_PICKUPS_MOVEMENTS || 'TOPIC-IM-TRANSCOMM-DXB';
const pickupMsgType =
  process.env.BLESS_NEW_PICKUP_MESSAGE_TYPE?.split(',')[0] || 'TC_DHLE_CUR_STA';
const masterMovementMsgType =
  process.env.BLESS_NEW_MASTER_MOVEMENT_MESSAGE_TYPE?.split(',')[0] ||
  'TC_DHLE_MANF';
const detailMovementMsgType =
  process.env.BLESS_NEW_DETAIl_MOVEMENT_MESSAGE_TYPE?.split(',')[0] ||
  'TC_DHLE_HAWB';
const declarationRequestMsgType =
  process.env.BLESS_DECLARATION_REQUEST_EXPORT_MESSAGE_TYPE?.split(',')[0] ||
  'TC_DHLE_ODAT_EXC';

router.post('/submitOrderToKafka', asyncHandler(submitOrderToKafka));
router.post(
  '/postPickupFileToKafka',
  express.json(),
  asyncHandler(postPickupFileToKafka),
);
router.post(
  '/postMasterMovementFileToKafka',
  express.json(),
  asyncHandler(postMasterMovementFileToKafka),
);
router.post(
  '/postDetailMovementFileToKafka',
  express.json(),
  asyncHandler(postDetailMovementFileToKafka),
);
router.post(
  '/postNotificationToKafka',
  express.json(),
  asyncHandler(postNotificationToKafka),
);
router.post(
  '/postDHLEDeclarationRequest',
  express.json(),
  asyncHandler(postDeclarationRequestToKafka),
);

async function submitOrderToKafka(
  request: express.Request<any, any, { message: string }>,
  response: express.Response,
) {
  console.log('incoming submitOrderToKafka');
  console.log(JSON.stringify(request.body));
  const messageType = request.headers['bless-message-type'] as string;
  if (!messageType) {
    response.status(400).send('Unknown bless message type');
    return;
  }
  const payloads = JSON.parse(request.body.message) as (
    | SubmitOrder
    | ConfirmReturnDelivery
  )[];
  const payload = payloads.find((x) => x);
  if (!payload) {
    response.status(400).send('Expected array');
    return;
  }
  try {
    const id = await ProduceBusinessMessage(customsTopic, payload, messageType);
    response.send('Order sent to kafka topic, bless id: ' + id);
  } catch (err) {
    console.log(err);
    response.status(500).send(err);
  }
}

async function postPickupFileToKafka(
  request: express.Request,
  response: express.Response,
) {
  console.log('incoming postPickUpFileToKafka to: ' + pickupMovementsTopic);
  console.log(JSON.stringify(request.body));
  try {
    const id = await ProducePickupMovementsMessage(
      pickupMovementsTopic,
      request.body.data,
      pickupMsgType,
    );
    response.send('Pickup file sent to kafka topic, bless id: ' + id);
  } catch (err) {
    console.log(err);
    response.status(500).send(err);
  }
}

async function postMasterMovementFileToKafka(
  request: express.Request,
  response: express.Response,
) {
  console.log('incoming masterMovementFile to: ' + pickupMovementsTopic);
  try {
    const id = await ProducePickupMovementsMessage(
      pickupMovementsTopic,
      request.body.data,
      masterMovementMsgType,
    );
    response.send('Master movement file sent to kafka topic, bless id: ' + id);
  } catch (err) {
    console.log(err);
    response.status(500).send(err);
  }
}

async function postDeclarationRequestToKafka(
  request: express.Request,
  response: express.Response,
) {
  console.log('incoming declaration request to: ' + customsTopic);
  try {
    const id = await ProduceBusinessMessage(
      customsTopic,
      request.body,
      declarationRequestMsgType,
    );
    response.send(
      'DHLE Declaration Request sent to kafka topic, bless id: ' + id,
    );
  } catch (err) {
    console.log(err);
    response.status(500).send(err);
  }
}

async function postDetailMovementFileToKafka(
  request: express.Request,
  response: express.Response,
) {
  console.log('incoming detailMovementFile to: ' + pickupMovementsTopic);
  try {
    const id = await ProducePickupMovementsMessage(
      pickupMovementsTopic,
      request.body.data,
      detailMovementMsgType,
    );
    response.send('Detail movement file sent to kafka topic, bless id: ' + id);
  } catch (err) {
    console.log(err);
    response.status(500).send(err);
  }
}

async function postNotificationToKafka(
  request: express.Request,
  response: express.Response,
) {
  console.log('incoming notification to: ' + customsTopic);
  try {
    await ProduceNotificationMessage(customsTopic, request.body);
    response.send('Notification sent to kafka topic');
  } catch (err) {
    console.log(err);
    response.status(500).send(err);
  }
}

export default router;
