/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Deserializer } from '@nestjs/microservices';
import { KafkaResponse } from 'kafka/common/interfaces';

export class KafkaResponseDeserializer
  implements Deserializer<any, KafkaResponse>
{
  deserialize(message: any): KafkaResponse {
    const { key, value, timestamp, offset, headers } = message;
    let id = key;
    let response = value;

    if (Buffer.isBuffer(key)) {
      id = Buffer.from(key).toString();
    }

    if (Buffer.isBuffer(value)) {
      response = Buffer.from(value).toString();
    }

    return {
      key: id,
      response,
      timestamp,
      offset,
      headers,
    };
  }
}
