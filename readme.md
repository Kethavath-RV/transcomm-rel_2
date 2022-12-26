# DHL Duty Drawback

This is a mono repo for the DHL Duty Drawback Project

## Quick Start

The following instructors are from a development perspective.

Run the `docker-compose`

```sh
docker-compose up
```

## Services

### TransCommServer

This service contains the logic surrounding the TranComm Backend Application.
Documentation can be generated with command 'yarn compodoc:serve' and shown on localhost:8080

### TransCommClient

This service contains the logic surrounding the TransComm FrontEnd Application.

### Transformer

This service contains the logic for translating incoming requests into the Bless Platform.

### Datagen

This service contains the logic for surrounding the Datagen platform.
Documentation can be generated with command 'yarn compodoc:serve' and shown on localhost:8081

## Database

## Introduction
This project has MariaDB as database for development. MariaDB uses the MySQL syntax and is 
a forked version of the original MySQL. We use docker-compose to spin up a MariaDB image.

Prisma is an open source next-generation ORM. It consists of the following parts:

 - Prisma Client: Auto-generated and type-safe query builder for Node.js & TypeScript
 - Prisma Migrate: Migration system
 - Prisma Studio: GUI to view and edit data in your database

Prisma Client can be used in any Node.js (supported versions) or TypeScript backend application (including serverless applications and microservices). This can be a REST API, a GraphQL API, a gRPC API, or anything else that needs a database.

### Database Migration

To run the database migration run the following commands from the ```src``` folder.

```shell
cd TransCommServer
npm run prisma:generate
```

In the current version the database_url is hard coded in the command. If this changes please mirror it for you local situation.

## Docker Setup

The full setup instructions regarding docker can be found [here](./documentation/installation/docker/docker-compose-deployment.md).

## HashiCorp Vault Setup

The full setup instructions regarding HashiCorp Vault can be found [here](./documentation/installation/hashicorp-vault/hashicorp-vault-setup.md).

## User initialisation with super admin

The full instructions regarding setting up the super admin user can be found here [here](./documentation/installation/super-admin-init/super-admin-init.md).

### Env values

To run the application certain environment values need to be set (typically vai a `.env`). The full list is below.

|Variable|Description|Example|Development Only?|Where used|
|---|---|---|---|---|
|KAFKA_VERSION|Version of kafka to use for docker compose|2.13-2.7.0|Yes|Docker|
|ZOOKEEPER_VERSION|Version of kafka to use for docker compose|3.7.0|Yes|Docker|
|MARIADB_VERSION|Version of mariaDb to use for docker compose|10.5|Yes|Docker|
|KAFKA_BROKERS|comma separated list of the host and ports of the kafka brokers |"kafka1:9092"|No|Transcom & Datagen|
|KAFKA_TOPIC_CUSTOMS|The default Kafka topic used for customs messages coming from BLESS|"DHL-EXP-TRANSCOM-TOPIC"|No|Transcom|
|KAFKA_TOPIC_PICKUPS_MOVEMENTS|The Kafka topic used for pickup and (old) movement files|"TOPIC-IM-TRANSCOMM-DXB"|No|Transcom|
|KAFKA_TOPIC_NOTIFICATION|The Kafka topic used for Bless Notifications|"Notification"|No|Transcomm|
|KAFKA_TOPIC_BLESS_COMMON_APP_OUTPUT|The Kafka topic for bless known as the 'common output topic' |"BlessAckTopic"|No|Transcom & Datagen|
|EVENTSTORE_CONNECTION_STRING|The connection string for the event store database|"esdb://db.eventstore:2113?tls=false"|No|Transcom|
|TRANSCOMM_BACKEND_KAFKA_GROUP_ID|The Kafka group id used for connecting to the Kafka network|"group-backend"|No|Transcom|
|TRANSCOMM_BACKEND_DATABASE_URL|The url for the maria db used to store view data|"mysql://root:Pas5word@db_mariadb:3306/order_view"|No|Transcom|
|DATAGEN_ACTIVE |Toggle this value to enable or disable the datagen| "true"|No|Docker & Transcomm|
|DATAGEN_KAFKA_GROUP_ID|The Kafka group id used for connecting to the Kafka network|"group-datagen"|No|Datagen|
|DATAGEN_URL|URL used for communication between transcom towards Datagen (internal)|"http://transcomm_datagen:2020"|No|Transcom|
|DATAGEN_PUBLIC_URL|URL used for communication between Datagen towards Hyperledger (callback url)|"http://transcomm_datagen:2020"|No|Transcom|
|DATAGEN_DATABASE_URL|URL for connecting to the mariaDB from the datagen|"mysql://root:Pas5word@db_mariadb:3306/datagen"|No|Datagen|
|DATAGEN_KAFKA_SENDER_IDENTITY|Input for VC generation within kafka bless messages|"DC-TC"|No|Datagen &  Transcom|
|DATAGEN_KAFKA_RECEIVERS|Comma separated list of receivers for non business exception Kafka messages sent via bless.|"DHL-EXP"|No|Datagen|
|DATAGEN_APPLICATION_ID|Input for VC generation within kafka bless messages|"DC-TC"|No|Datagen|
|DATAGEN_KAFKA_AUDIENCE|Input for Kafka bless messages via bless|"DHL-EXP"|No|Datagen|
|DATAGEN_KAFKA_EXCEPTION_RECEIVERS|Comma separated list of receivers for business exception Kafka messages sent via bless.|"DHL-EXP,LUXC_DXB"|No|Datagen|
|DATAGEN_KAFKA_EXCEPTION_MESSAGE_TYPE|Message type for business exception kafka messages|"TC_DHLE_ODAT_EXC"|No|Datagen|
|AXIOS_RETRY_COUNT|Amount of attempts Axios will attempt before failing|5|No|Datagen & Transcom|
|MOCK_BLESS_KAFKA_GROUP_ID|Group id for Kafka within the mock bless service|"group-mockbless"|Yes|Mock Bless|
|HYPERLEDGER_URL|URL used by datagen to connect to the hyperledger|"http://mock_hyperledger:4050"|No|Datagen|
|HYPERLEDGER_CLIENT_ID|Client Id to be used for authentication with the hyperleder|"mock-client-id-1"|No|Datagen|
|HYPERLEDGER_CHANNEL_NAME|Channel name required for requests towards the hyperledger|"tmpHLchannelname"|No|DataGen|
|HYPERLEDGER_CHAINCODE_NAME|ChainCode name used in requests towards the hyperledger|"tmpHLchaincodename"|No|Datagen|
|HYPERLEDGER_USER_ID|Input for requests towards the hyperledger|"DHL"|No|Datagen|
|HYPERLEDGER_ORGANIZATION_TYPE|Input for requests towards the hyperledger|"COURIER"|No|Datagen|
|HYPERLEDGER_ORGANIZATION_CODE|Input for requests towards the hyperledger|"DHL"|No|Datagen|
|BLESS_URL|URL for Bless, only used by the REST requests|"http://mock_bless:5050"|Yes|Data-transformer|
|BLESS_ROUTE|Route for REST request|"/submitorderToKafka"|Yes|Data-transformer|
|BLESS_AUTH|Auth string for Bless|"ZjM4OWIwY2UtNDM1MC00MTJlLTk5YzAtYjQ1NjBlZjRiOGFl.MEUCIB7x3/23diLHD2oVtZl3e/AkSxvtOQylQzXZSd1uzIzzAiEA8uXDNnqJrfU4QEKhM1bBrxi0E5PxhGx79QXefo9krh8="|Yes|Data-transformer|
|BLESS_KID|Input for requests via REST towards BLESS|"076b86ffc3e2ffe2d0f1ecc34a3f1da8437e3f277898ed088b0d6815a5180c1c"|Yes|Data-transformer|
|BLESS_NEW_ORDER_MESSAGE_TYPE|Kafka message type for new orders from bless to transcom|"TC_DHLE_CORD"|No|Transcom|
|BLESS_CONFIRM_RETURN_DELIVERY_MESSAGE_TYPE|Kafka message type for confirm return delivery from bless to transcom|"TC_DHLE_RDEL"|No|Transcom|
|BLESS_HYPERLEDGER_MESSAGE_TYPES|Kafka message types for the various different hyperledger messages types from bless to transcom|"TC_DHLE_CORD_ODAT,  TC_DHLE_CORD_IDAT,  TC_DHLE_CORD_ODAT,  TC_DHLE_CORD_IDAT,  TC_DHLE_TINF_ODAT,  TC_DHLE_TINF_IDAT,  TC_DHLE_TINF_DMAP, TC_DHLE_TINF_DTRA,  TC_DHLE_IDEC_ODAT, TC_DHLE_IDEC_DMAP,  TC_DHLE_IDEC_DTRA,  TC_DHLE_IDEC_IDAT,TC_DHLE_ECON_DTRA,  TC_DHLE_ECON_CREQ,  TC_DHLE_ECON_IDAT,TC_DHLE_DORD_IDAT,  TC_DHLE_DORD_ODAT,  TC_DHLE_RDEL_ODAT,TC_DHLE_RDEL_IDAT"|No|Transcom|
|BLESS_NEW_PICKUP_MESSAGE_TYPE|Kafka message type for pickup files, message received via intermodule communication|"TC_DHLE_CUR_STA"|No|Transcom|
|BLESS_NEW_MASTER_MOVEMENT_MESSAGE_TYPE|Kafka message type for master movement files via intermodule communication|"TC_DHLE_MANF"|No|Transcom|
|BLESS_NEW_DETAIl_MOVEMENT_MESSAGE_TYPE|Kafka message type for detailed movement files via intermodule communication|"TC_DHLE_HAWB"|No|Transcom|
|BLESS_DECLARATION_REQUEST_EXPORT_MESSAGE_TYPE|Kafka message type for export declaration requests from DHL Express|"TC_DHLE_ODAT_EXC_EXPORT"|No|Transcom|
|BLESS_DECLARATION_REQUEST_IMPORT_MESSAGE_TYPE|Kafka message type for import declaration requests from DHL Express|"TC_DHLE_ODAT_EXC_IMPORT"|No|Transcom|
|BLESS_DECLARATION_RESPONSE_EXPORT_MESSAGE_TYPE|Kafka message type for export declaration responses to DHL Express|"TC_DHLE_ODAT_EXC_EXPORT"|No|Transcom|
|BLESS_DECLARATION_RESPONSE_IMPORT_MESSAGE_TYPE|Kafka message type for import declaration responses to DHL Express|"TC_DHLE_ODAT_EXC_IMPORT"|No|Transcom|
|BLESS_ISSUER|Input for RESTful messages to BLESS|"LUXC_DXB"|Yes|Data-transformer|
|BLESS_APPLICATION|Input for RESTful messages to BLESS|"DHL-EXP-TRANSCOM"|Yes|Data-transformer|
|SUBJECT_PRIMARY|Input for RESTful messages to BLESS|"DHL-EXP"|Yes|Data-transformer|
|SUBMITORDER_ORDER_DATA_MESSAGE_TYPE|Kafka message type for hyperledger messages to BLESS|"TC_DHLE_CORD_ODAT"|No|Datagen|
|SUBMITORDER_INVOICE_DATA_MESSAGE_TYPE|Kafka message type for hyperledger messages to BLESS|"TC_DHLE_CORD_IDAT"|No|Datagen|
|UPDATETRANSPORTINFO_ORDER_DATA_MESSAGE_TYPE|Kafka message type for hyperledger messages to BLESS|"TC_DHLE_TINF_ODAT"|No|Datagen|
|UPDATETRANSPORTINFO_INVOICE_DATA_MESSAGE_TYPE|Kafka message type for hyperledger messages to BLESS|"TC_DHLE_TINF_IDAT"|No|DataGen|
|UPDATETRANSPORTINFO_DECLARATION_JSON_MAPPING_MESSAGE_TYPE|Kafka message type for hyperledger messages to BLESS|"TC_DHLE_TINF_DMAP"|No|Datagen|
|UPDATETRANSPORTINFO_DOCUMENTTRACKING_MESSAGE_TYPE|Kafka message type for hyperledger messages to BLESS|"TC_DHLE_TINF_DTRA"|No|Datagen|
|INITIATEDECLARATION_ORDER_DATA_MESSAGE_TYPE|Kafka message type for hyperledger messages to BLESS|"TC_DHLE_IDEC_ODAT"|No|Datagen|
|INITIATEDECLARATION_DECLARATION_JSON_MAPPING_MESSAGE_TYPE|Kafka message type for hyperledger messages to BLESS|"TC_DHLE_IDEC_DMAP"|No|Datagen|
|INITIATEDECLARATION_DOCUMENTTRACKING_MESSAGE_TYPE|Kafka message type for hyperledger messages to BLESS|"TC_DHLE_IDEC_DTRA"|No|Datagen|
|INITIATEDECLARATION_INVOICE_DATA_MESSAGE_TYPE|Kafka message type for hyperledger messages to BLESS|"TC_DHLE_IDEC_IDAT"|No|Datagen|
|UPDATEEXITCONFIRMATION_DOCUMENTTRACKING_MESSAGE_TYPE|Kafka message type for hyperledger messages to BLESS|"TC_DHLE_ECON_DTRA"|No|Datagen|
|UPDATEEXITCONFIRMATION_CLAIM_REQUEST_MESSAGE_TYPE|Kafka message type for hyperledger messages to BLESS|"TC_DHLE_ECON_CREQ"|No|Datagen|
|UPDATEEXITCONFIRMATION_INVOICE_DATA_MESSAGE_TYPE|Kafka message type for hyperledger messages to BLESS|"TC_DHLE_ECON_IDAT"|No|Datagen|
|DELIVERORDER_INVOICE_DATA_MESSAGE_TYPE|Kafka message type for hyperledger messages to BLESS|"TC_DHLE_DORD_IDAT"|No|Datagen|
|DELIVERORDER_ORDER_DATA_MESSAGE_TYPE|Kafka message type for hyperledger messages to BLESS|"TC_DHLE_DORD_ODAT"|No|Datagen|
|CONFIRMRETURNDELIVERY_ORDER_DATA_MESSAGE_TYPE|Kafka message type for hyperledger messages to BLESS|"TC_DHLE_RDEL_ODAT"|No|Datagen|
|CONFIRMRETURNDELIVERY_INVOICE_DATA_MESSAGE_TYPE|Kafka message type for hyperledger messages to BLESS|"TC_DHLE_RDEL_IDAT"|No|Datagen|
|BUSINESS_EXCEPTION_MSG_TYPE|business error message type for messages from Datagen or TranscommBackend to BLESS|"ROR"|No|Transcom & Datagen|
|DECLARATION_STATUS_CHANGE_DOCUMENTTRACKING_MESSAGE_TYPE|Kafka message type for hyperledger messages to BLESS|"TC_DHLE_ECON_DTRA"|No|Datagen|
|UPDATEEXITCONFIRMATION_ORDER_DATA_MESSAGE_TYPE|Kafka message type for hyperledger messages to BLESS|"TC_DHLE_ECON_ODAT"|No|Datagen|
|CLAIM_STATUS_CHANGE_DOCUMENTTRACKING_MESSAGE_TYPE|Kafka message type for hyperledger messages to BLESS|"TC_DHLE_IDEC_DTRA"|No|Datagen|
|AUTO_RETRIES|Total amount of retries HTTP client should make between transcom and datagen |"5"|No|Transcom|
|AUTO_RETRIES_INTERVAL|seconds of delay between each retry|"1,1,2,2,5"|No|Transcom|
|SUPERADMIN_EMAIL|User name for superadmin|"super@admin.com"|No|Transcom|
|SUPERADMIN_HASHED_PASSWORD|Hashed value of: Helloworld1!Helloworld1!  MAKE SURE TO USE SINGLE QUOTES (') AROUND THE SUPERADMIN_HASHED_PASSWORD. OTHERWISE THE '$' IS NOT ESCAPED|'$2a$10$4QnRWQE.0zPVrLk6Ub3uY.9Pabgifu2czeRSbaK8CK2zK.kqjPSmy' #Helloworld1!Helloworld1!|No|Transcom|
|LOGGING_LEVEL|Nestjs Logging levels, full list here: [levels](https://docs.nestjs.com/techniques/logger#basic-customization)|"[\"error\", \"warn\", \"log\", \"debug\"]"|No|Transcom & Datagen|
|HL_QUEUE_RETRY_ATTEMPTS|Number of attempts Datagen will take to process a event from hyperledger|3|No|Datagen|
|HL_QUEUE_RETRY_DELAY|Milsecond delay between retries of events within Datagen|1000|No|Datagen|
|HASHICORP_DHL_CODE_LOOKUP|HashiCorp configuration DHL code lookup key|"dhl"|No|Datagen|
|HASHICORP_SHARED_KEY_LOOKUP|HashiCorp configuration shared key lookup|"shared"|No|Datagen|
|HASHICORP_SECRET_ADDRESS|HashiCorp configuration secret address (location to find secrets)|"test"|No|Datagen|
|HASHICORP_DEV_ROOT_TOKEN|HashiCorp configuration dev root token|"myroot"|No|Datagen|
|HASHICORP_VAULT_URL|HashiCorp configuration url|"http://mock_hashicorp_vault:8200/v1"|No|Datagen|
|HASHICORP_USERNAME|HashiCorp configuration username|'testuser'|No|Datagen|
|HASHICORP_PASSWORD|HashiCorp configuration password|'testpassword'|No|Datagen|
|HASHICORP_ROOT_PATH|HashiCorp configuration path|'kv2'|No|Datagen|
|STARTING_BLOCK|An offset that can optionally be set to ignore a certain number of blocks from the hyperledger block chain|0|No|Datagen|

Sample `envs` for dev and test can be found [here](./documentation/installation/docker/docker-compose-deployment.md).
