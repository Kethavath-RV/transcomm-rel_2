import { Inject, Injectable } from '@nestjs/common';
import { KafkaService } from 'kafka/common/kafka.service';
import { RecordMetadata } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProducerService {
  constructor(@Inject('Kafka_service') private client: KafkaService) {}

  async postBlessAck(
    id: string,
    msgType: string,
    topic: string,
  ): Promise<RecordMetadata[]> {
    const messageData = {
      id: id,
      msgType: msgType,
      primary: true,
    };

    return this.client.send({
      topic: topic,
      messages: [
        {
          key: `${uuidv4()}`,
          value: JSON.stringify(messageData),
        },
      ],
    });
  }

  async post(message: string, topic: string): Promise<RecordMetadata[]> {
    return this.client.send({
      topic: topic,
      messages: [
        {
          key: `${uuidv4()}`,
          value: message
        }
      ]
    });
  }
}