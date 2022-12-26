export default () => ({
  DATABASE_URL: 'mysql://root:Pas5word@localhost:3306/order_view',
  KAFKA_BROKERS: 'localhost:9094',
  KAFKA_TOPIC_CUSTOMS: 'DHL-EXP-TRANSCOM-TOPIC',
  KAFKA_TOPIC_PICKUPS_MOVEMENTS: 'TOPIC-IM-TRANSCOMM-DXB',
  KAFKA_TOPIC_BLESS_COMMON_APP_OUTPUT: 'BlessAckTopic',
  NODE_ENV: 'test',
});
