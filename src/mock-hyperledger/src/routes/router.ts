import express from 'express';
import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { getJwt } from '../accessToken/access';
import { v4 as uuidv4 } from 'uuid';
import { BlockSubscriptionManager } from '../subscriptions/blockSubscriptionManager';
import {
  EventManager,
  MockBlockEvent,
  MockContractEvent,
} from '../events/eventManager';
import {
  BlockHyperledgerEventFromBlockChain,
  ContractHyperledgerEventFromBlockChain,
  HyperledgerEventPayload,
  SubscribeEventRequest,
} from 'core';
import { ContractSubscriptionManager } from '../subscriptions/contractSubscriptionManager';
import axios from 'axios';

const verifyJwt = (req: Request) =>
  req.headers.authorization == `Bearer ${getJwt()}`;

let lastTxId = 'none';
let lastRequest = '';

const MOCK_CLIENT_ID = 'mock-client-id-1';

const blockSubscriptions = new BlockSubscriptionManager();
const contractSubscriptions = new ContractSubscriptionManager();
const events = new EventManager();

const router = express.Router();

router.post('/transaction/submit', asyncHandler(submit));

router.post('/transaction/query', asyncHandler(query));

router.post('/client/authenticate', asyncHandler(authenticate));

router.post('/event/subscribe', asyncHandler(subscribe));

router.post('/event/unsubscribe', asyncHandler(unsubscribe));

router.get('/event/subscribe/count', asyncHandler(subscribeCount));

router.get('/lastTx', express.json(), getLastTxId);

router.get('/lastRequest', express.json(), getLastRequest);

router.post(
  '/event/createMockBlockEvent',
  express.json(),
  asyncHandler(createBlockEvent),
);

router.post(
  '/event/createMockContractEvent',
  express.json(),
  asyncHandler(createContractEvent),
);

router.get('/ping', (_req, res) => res.status(200).send({ message: 'ok' }));

async function query(req: Request, res: Response): Promise<any> {
  console.log(req.body);
  if (!verifyJwt(req))
    return res.status(401).send({
      message: 'Error',
      error: 'Error verifying and decoding JWT',
    });
  if (req.body.methodName !== 'GetDataByKey')
    return res.status(500).send({
      message: 'Error',
      error: `Invalid method name: ${req.headers.methodName}`,
    });

  const methodParamsArray: string[] = req.body.transientValue.split('|');
  const event = events.getEvent(methodParamsArray[0], methodParamsArray[1]);

  if (!event)
    return res.status(500).send({
      message: 'Error',
      error: `Event of type ${methodParamsArray[1]} with key: ${methodParamsArray[0]} not found`,
    });

  const data = event.data;
  return res.status(200).send({
    message: {
      response: 'ok',
      data,
    },
    error: '',
  });
}

async function subscribeCount(req: Request, res: Response): Promise<any> {
  console.log(req.body);
  if (!verifyJwt(req))
    return res.status(401).send({
      message: 'Error',
      error: 'Error verifying and decoding JWT',
    });
  return res.status(200).send({
    message: [
      {
        eventCategory: 'contract',
        subscriptionIds: [...contractSubscriptions.subscriptionCount()],
        channelName: 'testChannel',
        chaincodeName: 'testChaincode',
      },
      {
        eventCategory: 'block',
        subscriptionIds: [...blockSubscriptions.subscriptionCount()],
        channelName: 'testChannel',
        chaincodeName: 'testChaincode',
      },
    ],
  });
}

async function subscribe(
  req: Request<any, any, SubscribeEventRequest>,
  res: Response,
): Promise<any> {
  console.log(req.body);

  if (!verifyJwt(req)) {
    console.log('Error verifying and decoding JWT');
    return res.status(401).send({
      message: 'Error',
      error: 'Error verifying and decoding JWT',
    });
  }

  const headRe = await axios.post(req.body.callbackURL, {});
  console.log(headRe);

  let subscriptionId;
  if (req.body.eventCategory === 'Contract') {
    subscriptionId = contractSubscriptions.addSubscription(
      req.body.callbackURL,
      req.body.eventName,
    );
  } else {
    subscriptionId = blockSubscriptions.addSubscription(req.body.callbackURL);
  }

  return res.status(200).send({
    message: {
      subscriptionId: subscriptionId,
    },
    error: null,
  });
}

async function unsubscribe(req: Request, res: Response): Promise<any> {
  console.log(req.body);

  if (!verifyJwt(req)) {
    console.log('Error verifying and decoding JWT');
    return res.status(401).send({
      message: 'Error',
      error: 'Error verifying and decoding JWT',
    });
  }
  blockSubscriptions.removeSubscription(req.body.id);
  contractSubscriptions.removeSubscription(req.body.id);
  return res.status(200).send({
    message: 'unsubscribed',
    error: '',
  });
}

//For initiateDeclaration, events
// a) Documenttracking for declaration status
// b)           declaration_json_mapping for declaration
// For updateExitConfirmation, events
// a) claim_request
// b) documenttracking for declaration status

async function createBlockEvent(
  req: Request<any, any, MockBlockEvent>,
  res: Response,
): Promise<any> {
  console.log(req.body);
  const collections = req.body.payloads.map((x) => ({
    Key: events.addEvent(x.collection, x.payload, req.body.txId), //stores the payload
    Collection: x.collection,
  }));

  const payload: HyperledgerEventPayload = {
    eventName: 'SUBMITORDER',
    events: collections,
    additionalData: [],
  };

  const notification: BlockHyperledgerEventFromBlockChain = {
    txId: req.body.txId,
    blockNumber: req.body.block,
    eventName: 'test',
    chainCodeId: 'test',
    payload: JSON.stringify(payload),
    collectionName: '',
    function: req.body.function,
    namespace: '',
    privateData: false,
  };

  await blockSubscriptions.sendEventNotification(notification);
  return res.status(200).send({
    message: 'success',
    error: '',
  });
}

async function createContractEvent(
  req: Request<any, any, MockContractEvent>,
  res: Response,
): Promise<any> {
  const txId = req.body.txId ?? uuidv4();

  console.log(JSON.stringify(req.body));

  const collections = req.body.payloads.map((x) => ({
    Key: events.replaceEvent(x.key, x.collection, x.payload)
      ? x.key
      : events.addEvent(x.collection, x.payload, txId, x.key), //stores the payload
    Collection: x.collection,
  }));

  const payload: HyperledgerEventPayload = {
    eventName: req.body.eventNameForContractItself ?? 'SUBMITORDER',
    events: collections,
    additionalData: [],
  };

  const notification: ContractHyperledgerEventFromBlockChain = {
    txId: txId,
    block: req.body.block,
    eventName: req.body.eventName,
    chainCodeId: 'test',
    payload: JSON.stringify(payload),
    collectionName: '',
    function: '',
    namespace: '',
    privateData: false,
  };

  await contractSubscriptions.sendEventNotification(notification);
  return res.status(200).send({
    message: 'success',
    error: '',
  });
}

async function authenticate(req: Request, res: Response): Promise<any> {
  console.log(req.body);
  if (req.body.clientID === MOCK_CLIENT_ID)
    return res.status(200).send({
      message: {
        token: getJwt(),
        response: 'OK',
      },
    });
  else
    return res.status(500).send({
      message: 'Error',
      error: 'Unauthorized user',
    });
}

async function submit(req: Request, res: Response): Promise<any> {
  if (!verifyJwt(req))
    return res.status(401).send({
      message: 'Error',
      error: 'Error verifying and decoding JWT',
    });

  // If the order id is equal to a specific name we return an error
  // this is purely to test the error handling of our system
  const methodParamsArray: string[] = req.body.transientValue.split('|');
  if (methodParamsArray[0].slice(0, 12) === '"ERROR-ORDER') {
    return res.status(401).send({
      message: 'Error',
      error: 'Test error',
    });
  }
  lastRequest = JSON.stringify(req.body);
  console.log('hitting submit on mockhyperledger with body:' + lastRequest);
  return res.status(200).send(createOkMessage(uuidv4()));
}

function createOkMessage(txnId: string) {
  {
    lastTxId = txnId;
    return {
      message: {
        response: 'OK',
        txnId: txnId,
      },
      error: '',
    };
  }
}

function getLastTxId(_req, res) {
  res.status(200).send(lastTxId);
}

function getLastRequest(_req, res) {
  res.status(200).send({
    lastRequest,
    lastTxId,
  });
}

function validatePayload(transientValue: string, expectedArrayLength: number) {
  const methodParamsArray: string[] = transientValue.split('|');
  if (transientValue === undefined) return false;
  return methodParamsArray.length === expectedArrayLength;
}

export default router;
