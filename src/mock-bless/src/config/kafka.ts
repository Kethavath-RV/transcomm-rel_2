import {
  BusinessMessageModel,
  NotificationMessageModel,
  OutputMessageModel,
  PickupMovementsMessageModel,
} from 'core';
import { Kafka } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';

const blessAckTopic =
  process.env.KAFKA_TOPIC_BLESS_COMMON_APP_OUTPUT ?? 'BlessAckTopic';
const kafkaBrokers = process.env.KAFKA_BROKERS ?? 'kafka1:9092';
const kafkaGroup = process.env.MOCK_BLESS_KAFKA_GROUP_ID ?? 'group-mockbless';
const businessExceptionMsgType =
  process.env.BUSINESS_EXCEPTION_MSG_TYPE ?? 'TC_DHLE_RDEL_IDAT';
const declarationResponseExportMsgType =
  process.env.BLESS_DECLARATION_RESPONSE_EXPORT_MESSAGE_TYPE ??
  'TC_DHLE_ODAT_EXC_EXPORT';
const declarationResponseImportMsgType =
  process.env.BLESS_DECLARATION_RESPONSE_IMPORT_MESSAGE_TYPE ??
  'TC_DHLE_ODAT_EXC_IMPORT';

const customsTopic =
  process.env.KAFKA_TOPIC_CUSTOMS ?? 'DHL-EXP-TRANSCOM-TOPIC';

const encodeBase64 = require('btoa');

const kafka = new Kafka({
  clientId: 'Bless',
  brokers: [kafkaBrokers],
});

const consumer = kafka.consumer({ groupId: kafkaGroup });

const producer = kafka.producer();

export const start = async (): Promise<void> => {
  await consumer.connect();

  await consumer.subscribe({ topic: blessAckTopic });

  await consumer.run({
    eachMessage: async ({ message }) => {
      console.log('Incoming bless ack message with payload:');
      console.log(JSON.stringify(message));
      if (message.value) ForwardMessage(message.value); //events from HL scenario
    },
  });
};

export const shutdown = async (): Promise<void> => {
  await producer.disconnect();
};

export const ProducePickupMovementsMessage = async (
  topic: string,
  message: Record<string, any>[],
  messageType: string,
): Promise<string> => {
  const transformedMessages = encodeBase64(JSON.stringify(message));

  await producer.connect();
  const messageData: PickupMovementsMessageModel = {
    msgType: messageType,
    sender: 'TRANS_REQ',
    uuid: uuidv4(),
    msgFilePath: '',
    messages: transformedMessages,
  };

  try {
    await producer.send({
      topic: topic,
      messages: [
        {
          key: `${KafkaKey()}-key`,
          headers: { MESSAGE_CATEGORY: 'BUSINESS' },
          value: JSON.stringify(messageData),
        },
      ],
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
  return 'Sent';
};

export const ProduceBusinessMessage = async (
  topic: string,
  message: Record<string, any>,
  messageType: string,
): Promise<string> => {
  const transformedMessage = encodeBase64(JSON.stringify(message));

  await producer.connect();
  const messageId = `vc-id-${Math.floor(Math.random() * (8000 - 1000) + 1000)}`;
  const messageData: BusinessMessageModel = {
    id: messageId,
    msgType: messageType,
    sender: 'testSender',
    receivers: new Map([['testKey1', ['testVal1']]]),
    issueTime: 0,
    trailKey: 'testTrailkey',
    trailCreatedOn: 0,
    checkpointStatus: 'testcheckpointStatus',
    checkpointAttributes: new Map([['testKey1', 'testVal1']]),
    attachments: {},
    transformedMessage: transformedMessage,
    sequenceNumber: 'testSequenceNumber',
    f1: 'testf1',
    f2: 'testf2',
    postProcessingRequired: false,
    token: 'testtoken',
    payloadCreatedOn: 1,
  };

  try {
    await producer.send({
      topic: topic,
      messages: [
        {
          key: `${KafkaKey()}-key`,
          headers: { MESSAGE_CATEGORY: 'BUSINESS' },
          value: JSON.stringify(messageData),
        },
      ],
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
  return messageId;
};

export const ProduceNotificationMessage = async (
  eventName: string,
  message: Record<string, any>,
): Promise<void> => {
  const messageData: NotificationMessageModel = {
    id: message.id,
    type: message.type,
    content: encodeBase64(JSON.stringify(message.data)),
  };

  try {
    await producer.send({
      topic: `${eventName}`,
      messages: [
        {
          key: `${KafkaKey()}-key`,
          headers: { MESSAGE_CATEGORY: 'NOTIFICATION' },
          value: JSON.stringify(messageData),
        },
      ],
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const ForwardMessage = async (message: Buffer): Promise<void> => {
  const parsedMessage = JSON.parse(message.toString()) as OutputMessageModel;
  if (
    !parsedMessage.payloads ||
    !parsedMessage.msgType ||
    parsedMessage.msgType === businessExceptionMsgType ||
    parsedMessage.msgType === declarationResponseExportMsgType ||
    parsedMessage.msgType === declarationResponseImportMsgType
  ) {
    return;
  }
  const toSend: BusinessMessageModel = {
    id: parsedMessage.id,
    msgType: parsedMessage.msgType,
    sender: 'testSender',
    receivers: new Map([['testKey1', ['testVal1']]]),
    issueTime: 0,
    trailKey: 'testTrailkey',
    trailCreatedOn: 0,
    checkpointStatus: 'testcheckpointStatus',
    checkpointAttributes: new Map([['testKey1', 'testVal1']]),
    attachments: {},
    transformedMessage: parsedMessage.payloads[0],
    sequenceNumber: 'testSequenceNumber',
    f1: 'testf1',
    f2: 'testf2',
    postProcessingRequired: false,
    token: 'testtoken',
    payloadCreatedOn: 1,
  };

  await producer.connect();
  console.log(`forwarding message... ${customsTopic}`);
  try {
    await producer.send({
      topic: customsTopic,
      messages: [
        {
          key: `${KafkaKey()}-key`,
          headers: { MESSAGE_CATEGORY: 'BUSINESS' },
          value: JSON.stringify(toSend),
        },
      ],
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const KafkaKey = () => '_' + Math.random().toString(36).substr(2, 9);
