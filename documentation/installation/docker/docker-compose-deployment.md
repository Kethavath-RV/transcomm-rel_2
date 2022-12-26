# Deploy using docker compose

## Prerequisite

Make sure that docker and docker compose are installed on the target machine. The TransComm system is deployed (locally)
using _docker compose_.

**NOTE:** Make sure you have allocated at least 6GB of memory to docker (default is set to 2GB). Otherwise this project is not able to run properly.

## Kafka Topics

| Topic                  | Sender : Receiver              | Comments / Purpose                                                                                                                                                                                                                                                                                                      |
| :--------------------- | :----------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DHL-EXP-TRANSCOM-TOPIC | Bless:TransComm                | When e-commerce party submits an order via the api, the bless platform notifies us via this topic                                                                                                                                                                                                                       |
| Notification           | Bless:TransComm                | when ever we receive a message from bless, we should expect that there will be a follow up message to notify that the other systems have processed it, this is particularly important with the submit order. If an order is submitted and this message is not received, it will not move forward in its business cycle. |
| TOPIC-IM-TRANSCOMM-DXB | cluster/module:TransComm       | When the oder is physically picked up, this message is consumed by our system, this event is required as part of the criteria to submit events to the hyperledger.If a new order, notification of process and pickup file are received, the order can be submitted to the blockchain                                    |
| TOPIC-IM-TRANSCOMM-DXB | cluster/module:TransComm       | The first movement file, this file contains the master movement Id which is later used to link other movement files to the existing orders. The link is established viaOrder's OrderNumber linked to the Pickup File's AirwayBillNo which can be found within the master movement file.                                 |
| TOPIC-IM-TRANSCOMM-DXB | cluster/module:TransComm       | Orders are linked via the process mentioned above, with the addition of linking the master movement file id to this file. Once both a master and detail movement is received shipping info can be added to the blockchain                                                                                               |
| BlessAckTopic          | TransComm:Bless                | Acknowledgement that event has been processed successfully                                                                                                                                                                                                                                                              |
| HyperledgerEvents      | DataGen:Bless, Bless:TransComm | DataGen consumes events regarding blockchain activities, if an event relates to an order within our system, datagen notifies the system via this topic.                                                                                                                                                                 |

## Service Configuration

An overview of all services that are started when running docker compose. Some services are only relevant for local
development. Some services mock services that are provided by DHL.

### DataGen

#### Environment

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

#### ports

| App      | Container    |
| -------- | ------------ |
| 2020/tcp | 0.0.0.0:2020 |

### DataTransformer

#### Environment

| Variable    | Description            | Example                                  |
| :---------- | :--------------------- | :--------------------------------------- |
| BLESS_URL   | BLESS url              | "http://transcomm_data-transformer:5050" |
| SERVER_PORT | Server port (optional) |

#### ports

| App      | Container    |
| -------- | ------------ |
| 6060/tcp | 0.0.0.0:6060 |

### TranscommBackend

| Variable              | Description                                         | Example     |
| :-------------------- | :-------------------------------------------------- | :---------- |
| AUTO_RETRIES          | # of retries when calling datagen                   | "5"         |
| AUTO_RETRIES_INTERVAL | # of minutes between each retry (commas in between) | "1,1,2,2,5" |

#### Environment

| Variable                                   | Description                                                                                                                                             | Example                                                                                                                                                                                                                                                                                                                                                 |
| :----------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| KAFKA_TOPIC_CUSTOMS                        | When e-commerce party submits an order via the api, the bless platform notifies us via this topic                                                       | NewOrder                                                                                                                                                                                                                                                                                                                                                |
| KAFKA_TOPIC_PICKUPS_MOVEMENTS              | For receiving PickupFiles (Checkpoint files) or movement files from Shipment Modules or TransAir Clusters                                               | NewPickupFile, NewMasterMovementFile, NewDetailMovementFile                                                                                                                                                                                                                                                                                             |
| KAFKA_TOPIC_BLESS_COMMON_APP_OUTPUT        | Acknowledgement that event has been processed successfully                                                                                              | BlessAckTopic                                                                                                                                                                                                                                                                                                                                           |                                                                                                                                                                                                                                                                                                                                     |
| KAFKA_BROKERS                              |                                                                                                                                                         | "kafka1:9092"                                                                                                                                                                                                                                                                                                                                           |
| KAFKA_GROUP_ID                             |                                                                                                                                                         | "group-backend"                                                                                                                                                                                                                                                                                                                                         |
| BLESS_NEW_ORDER_MESSAGE_TYPE               |                                                                                                                                                         | "TC_DHLE_CORD"                                                                                                                                                                                                                                                                                                                                          |
| BLESS_CONFIRM_RETURN_DELIVERY_MESSAGE_TYPE |                                                                                                                                                         | "TC_DHLE_RDEL"                                                                                                                                                                                                                                                                                                                                          |
| BLESS_HYPERLEDGER_MESSAGE_TYPES            |                                                                                                                                                         | "TC_DHLE_CUR_STA"                                                                                                                                                                                                                                                                                                                                       |
| BLESS_NEW_PICKUP_MESSAGE_TYPE              |                                                                                                                                                         | "TC_DHLE_CORD_ODAT,TC_DHLE_CORD_IDAT,TC_DHLE_CORD_ODAT,TC_DHLE_CORD_IDAT,TC_DHLE_TINF_ODAT,TC_DHLE_TINF_IDAT,TC_DHLE_TINF_DMAP,TC_DHLE_TINF_DTRA,TC_DHLE_IDEC_ODAT,TC_DHLE_IDEC_DMAP,TC_DHLE_IDEC_DTRA,TC_DHLE_IDEC_IDAT,TC_DHLE_ECON_DTRA,TC_DHLE_ECON_CREQ,TC_DHLE_ECON_IDAT,TC_DHLE_DORD_IDAT,TC_DHLE_DORD_ODAT,TC_DHLE_RDEL_ODAT,TC_DHLE_RDEL_IDAT" |
| BLESS_NEW_MASTER_MOVEMENT_MESSAGE_TYPE     |                                                                                                                                                         | "TC_DHLE_MANF"                                                                                                                                                                                                                                                                                                                                          |
| BLESS_NEW_DETAIl_MOVEMENT_MESSAGE_TYPE     |                                                                                                                                                         | "TC_DHLE_HAWB"                                                                                                                                                                                                                                                                                                                                          |
| DATAGEN_URL                                |                                                                                                                                                         | "http://transcomm_datagen:2020"                                                                                                                                                                                                                                                                                                                         |
| DATABASE_URL                               |                                                                                                                                                         | "mysql://root:Pas5word@db_mariadb:3306/order_view"                                                                                                                                                                                                                                                                                                      |
| EVENTSTORE_CONNECTION_STRING               |                                                                                                                                                         | "esdb://db_eventstore:2113?tls=false"                                                                                                                                                                                                                                                                                                                   |

#### ports

| App      | Container    |
| -------- | ------------ |
| 3030/tcp | 0.0.0.0:3030 |

### TranscommUI

The UI is built using angular JS. At this moment we configure the api using a proxy setup. For the moment we might have
to locally set this one (In the cloned file itself). We need to set the api host and port.

#### Environment

| Variable    | Description            | Example |
| :---------- | :--------------------- | :------ |
| SERVER_PORT | Server port (optional) |

#### ports

| App    | Container  |
| ------ | ---------- |
| 80/tcp | 0.0.0.0:80 |

### Redis

#### ports

| App      | Container    |
| -------- | ------------ |
| 6379/tcp | 0.0.0.0:6379 |

### EventStore

Event store is an open sourced events database. To handle scaling in a predictable fashion, we have opted to apply the
event-sourcing concept as a pattern around Orders. To enable us to implement event-sourcing, along with cqrs, we spin up
an EventStore database to stream our events to us. This database is highly tuned for handling huge volumes of events.
Further more it's append-only structure ensures that we always capture important information.

[Installation Instructions](https://developers.eventstore.com/server/v21.6/docs/installation/docker.html#run-with-docker)

### MockBless (local development)

| Variable                            | Description                                                                                                                                             | Example                                                     |
| :---------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------ | :---------------------------------------------------------- |
| KAFKA_TOPIC_CUSTOMS                 | When e-commerce party submits an order via the api, the bless platform notifies us via this topic                                                       | NewOrder                                                    |
| KAFKA_TOPIC_PICKUPS_MOVEMENTS       | For receiving PickupFiles (Checkpoint files) or movement files from Shipment Modules or TransAir Clusters                                               | NewPickupFile, NewMasterMovementFile, NewDetailMovementFile |
| KAFKA_TOPIC_BLESS_COMMON_APP_OUTPUT | Acknowledgement that even                                                                                                                               |
| KAFKA_BROKERS                       |                                                                                                                                                         | "kafka1:9092"                                               |
| KAFKA_GROUP_ID                      |                                                                                                                                                         | "group-backend"                                             |

### MockHyperledger (local development)

### Kafka (local development)

### Zookeeper (local development)

### MariaDB (local development)

| Variable            | Description | Example                |
| :------------------ | :---------- | :--------------------- |
| MYSQL_ROOT_PASSWORD |             | ${MYSQL_ROOT_PASSWORD} |
| MYSQL_DATABASE      |             | ${MYSQL_DATABASE}      |
| MYSQL_USER          |             | ${MYSQL_USER}          |
| MYSQL_PASSWORD      |             | ${MYSQL_PASSWORD}      |

## Environments

It is important to create a`.env.<environment_name>` file before running the docker compose command. Every environment
has it's own `.env` configuration.

### Local Development

Deployment instruction for local development. This deployment file will spin up all services, including the mocked ones,
onto the target machine. The local deployment is mainly for development and has hot reloading enabled with docker volume
binding. This has a performance impact but is fine for local development.

#### .env.local

```dotenv
KAFKA_VERSION=2.13-2.7.0
ZOOKEEPER_VERSION=3.7.0
MARIADB_VERSION=10.5

KAFKA_BROKERS="kafka1:9092"
KAFKA_TOPIC_CUSTOMS="DHL-EXP-TRANSCOM-TOPIC"
KAFKA_TOPIC_PICKUPS_MOVEMENTS="TOPIC-IM-TRANSCOMM-DXB"
KAFKA_TOPIC_NOTIFICATION="Notification"
KAFKA_TOPIC_BLESS_COMMON_APP_OUTPUT="BlessAckTopic"

EVENTSTORE_CONNECTION_STRING="esdb://db.eventstore:2113?tls=false"

TRANSCOMM_BACKEND_KAFKA_GROUP_ID="group-backend"
TRANSCOMM_BACKEND_DATABASE_URL="mysql://root:Pas5word@db_mariadb:3306/order_view"

# Client 02 VM configuration values
DATAGEN_ACTIVE = "true"
DATAGEN_KAFKA_GROUP_ID="group-datagen"
DATAGEN_URL="http://transcomm_datagen:2020"
DATAGEN_PUBLIC_URL="http://transcomm_datagen:2020"
DATAGEN_DATABASE_URL="mysql://root:Pas5word@db_mariadb:3306/datagen"
DATAGEN_KAFKA_SENDER_IDENTITY="DC-TC"
DATAGEN_KAFKA_RECEIVERS="DHL-EXP"
DATAGEN_APPLICATION_ID="DC-TC"
DATAGEN_KAFKA_AUDIENCE="DHL-EXP"
DATAGEN_KAFKA_EXCEPTION_RECEIVERS="DHL-EXP,LUXC_DXB"
DATAGEN_KAFKA_EXCEPTION_MESSAGE_TYPE="TC_DHLE_ODAT_EXC"
AXIOS_RETRY_COUNT=5

MOCK_BLESS_KAFKA_GROUP_ID="group-mockbless"

HYPERLEDGER_URL="http://mock_hyperledger:4050"
HYPERLEDGER_CLIENT_ID="mock-client-id-1"
HYPERLEDGER_CHANNEL_NAME="tmpHLchannelname"
HYPERLEDGER_CHAINCODE_NAME="tmpHLchaincodename"
HYPERLEDGER_USER_ID="DHL"
HYPERLEDGER_ORGANIZATION_TYPE="COURIER"
HYPERLEDGER_ORGANIZATION_CODE="DHL"

BLESS_URL="http://mock_bless:5050"
BLESS_ROUTE="/submitorderToKafka"
BLESS_AUTH="ZjM4OWIwY2UtNDM1MC00MTJlLTk5YzAtYjQ1NjBlZjRiOGFl.MEUCIB7x3/23diLHD2oVtZl3e/AkSxvtOQylQzXZSd1uzIzzAiEA8uXDNnqJrfU4QEKhM1bBrxi0E5PxhGx79QXefo9krh8="
BLESS_KID="076b86ffc3e2ffe2d0f1ecc34a3f1da8437e3f277898ed088b0d6815a5180c1c"
BLESS_NEW_ORDER_MESSAGE_TYPE="TC_DHLE_CORD"
BLESS_CONFIRM_RETURN_DELIVERY_MESSAGE_TYPE="TC_DHLE_RDEL"
BLESS_HYPERLEDGER_MESSAGE_TYPES="TC_DHLE_CORD_ODAT,TC_DHLE_CORD_IDAT,TC_DHLE_CORD_ODAT,TC_DHLE_CORD_IDAT,TC_DHLE_TINF_ODAT,TC_DHLE_TINF_IDAT,TC_DHLE_TINF_DMAP,TC_DHLE_TINF_DTRA,TC_DHLE_IDEC_ODAT,TC_DHLE_IDEC_DMAP,TC_DHLE_IDEC_DTRA,TC_DHLE_IDEC_IDAT,TC_DHLE_ECON_DTRA,TC_DHLE_ECON_CREQ,TC_DHLE_ECON_IDAT,TC_DHLE_DORD_IDAT,TC_DHLE_DORD_ODAT,TC_DHLE_RDEL_ODAT,TC_DHLE_RDEL_IDAT"
BLESS_NEW_PICKUP_MESSAGE_TYPE="TC_DHLE_CUR_STA"
BLESS_NEW_MASTER_MOVEMENT_MESSAGE_TYPE="TC_DHLE_MANF"
BLESS_NEW_DETAIl_MOVEMENT_MESSAGE_TYPE="TC_DHLE_HAWB"
BLESS_DECLARATION_REQUEST_EXPORT_MESSAGE_TYPE="TC_DHLE_ODAT_EXC_EXPORT"
BLESS_DECLARATION_REQUEST_IMPORT_MESSAGE_TYPE="TC_DHLE_ODAT_EXC_IMPORT"
BLESS_DECLARATION_RESPONSE_EXPORT_MESSAGE_TYPE="TC_DHLE_ODAT_EXC_EXPORT"
BLESS_DECLARATION_RESPONSE_IMPORT_MESSAGE_TYPE="TC_DHLE_ODAT_EXC_IMPORT"
BLESS_ISSUER="LUXC_DXB"
BLESS_APPLICATION="DHL-EXP-TRANSCOM"
SUBJECT_PRIMARY="DHL-EXP"

SUBMITORDER_ORDER_DATA_MESSAGE_TYPE="TC_DHLE_CORD_ODAT"
SUBMITORDER_INVOICE_DATA_MESSAGE_TYPE="TC_DHLE_CORD_IDAT"
UPDATETRANSPORTINFO_ORDER_DATA_MESSAGE_TYPE="TC_DHLE_TINF_ODAT"
UPDATETRANSPORTINFO_INVOICE_DATA_MESSAGE_TYPE="TC_DHLE_TINF_IDAT"
UPDATETRANSPORTINFO_DECLARATION_JSON_MAPPING_MESSAGE_TYPE="TC_DHLE_TINF_DMAP"
UPDATETRANSPORTINFO_DOCUMENTTRACKING_MESSAGE_TYPE="TC_DHLE_TINF_DTRA"
INITIATEDECLARATION_ORDER_DATA_MESSAGE_TYPE="TC_DHLE_IDEC_ODAT"
INITIATEDECLARATION_DECLARATION_JSON_MAPPING_MESSAGE_TYPE="TC_DHLE_IDEC_DMAP"
INITIATEDECLARATION_DOCUMENTTRACKING_MESSAGE_TYPE="TC_DHLE_IDEC_DTRA"
INITIATEDECLARATION_INVOICE_DATA_MESSAGE_TYPE="TC_DHLE_IDEC_IDAT"
UPDATEEXITCONFIRMATION_DOCUMENTTRACKING_MESSAGE_TYPE="TC_DHLE_ECON_DTRA"
UPDATEEXITCONFIRMATION_CLAIM_REQUEST_MESSAGE_TYPE="TC_DHLE_ECON_CREQ"
UPDATEEXITCONFIRMATION_INVOICE_DATA_MESSAGE_TYPE="TC_DHLE_ECON_IDAT"
DELIVERORDER_INVOICE_DATA_MESSAGE_TYPE="TC_DHLE_DORD_IDAT"
DELIVERORDER_ORDER_DATA_MESSAGE_TYPE="TC_DHLE_DORD_ODAT"
CONFIRMRETURNDELIVERY_ORDER_DATA_MESSAGE_TYPE="TC_DHLE_RDEL_ODAT"
CONFIRMRETURNDELIVERY_INVOICE_DATA_MESSAGE_TYPE="TC_DHLE_RDEL_IDAT"
BUSINESS_EXCEPTION_MSG_TYPE="ROR"
DECLARATION_STATUS_CHANGE_DOCUMENTTRACKING_MESSAGE_TYPE="TC_DHLE_ECON_DTRA"
UPDATEEXITCONFIRMATION_ORDER_DATA_MESSAGE_TYPE="TC_DHLE_ECON_ODAT"
CLAIM_STATUS_CHANGE_DOCUMENTTRACKING_MESSAGE_TYPE="TC_DHLE_IDEC_DTRA"

AUTO_RETRIES="5"
AUTO_RETRIES_INTERVAL="1,1,2,2,5"

SUPERADMIN_EMAIL="super@admin.com"
# MAKE SURE TO USE SINGLE QUOTES (') AROUND THE SUPERADMIN_HASHED_PASSWORD. OTHERWISE THE '$' IS NOT ESCAPED
SUPERADMIN_HASHED_PASSWORD='$2a$10$4QnRWQE.0zPVrLk6Ub3uY.9Pabgifu2czeRSbaK8CK2zK.kqjPSmy' #Helloworld1!Helloworld1!

LOGGING_LEVEL="[\"error\", \"warn\", \"log\", \"debug\"]"
# You can adjust these values to configure the types of logs you want to have visible. Docs: https://docs.nestjs.com/techniques/logger

HL_QUEUE_RETRY_ATTEMPTS=3
HL_QUEUE_RETRY_DELAY=1000

HASHICORP_DHL_CODE_LOOKUP="dhl"
HASHICORP_SHARED_KEY_LOOKUP="shared"
HASHICORP_SECRET_ADDRESS="test"
HASHICORP_DEV_ROOT_TOKEN="myroot"
HASHICORP_VAULT_URL="http://mock_hashicorp_vault:8200/v1"
HASHICORP_USERNAME='testuser'
HASHICORP_PASSWORD='testpassword'
HASHICORP_ROOT_PATH='kv2'

STARTING_BLOCK=0
```

#### setup

In the `src/` folder, create a file named `.env.local` and provide the above mentioned environment variables

```
docker-compose -f docker-compose.yml -f docker-compose.override.yml --env-file .env.local up --build -d
```

### UAT Deployment

Deployment instruction for UAT environment. This deployment file will spin up all services, including the mocked ones.
This file will gradually alter when mocked services become available for testing. This deployment will build a
production version of the services. This means that there is no hot reloading.

#### .env.test

```dotenv
KAFKA_VERSION=2.13-2.7.0
ZOOKEEPER_VERSION=3.7.0
MARIADB_VERSION=10.5

KAFKA_BROKERS="kafka1:9092"
KAFKA_TOPIC_CUSTOMS="DHL-EXP-TRANSCOM-TOPIC"
KAFKA_TOPIC_PICKUPS_MOVEMENTS="TOPIC-IM-TRANSCOMM-DXB"
KAFKA_TOPIC_NOTIFICATION="Notification"
KAFKA_TOPIC_BLESS_COMMON_APP_OUTPUT="BlessAckTopic"

EVENTSTORE_CONNECTION_STRING="esdb://db.eventstore:2113?tls=false"

TRANSCOMM_BACKEND_KAFKA_GROUP_ID="group-backend"
TRANSCOMM_BACKEND_DATABASE_URL="mysql://root:Pas5word@db_mariadb:3306/order_view"

# Client 02 VM configuration values
DATAGEN_ACTIVE = "true"
DATAGEN_KAFKA_GROUP_ID="group-datagen"
DATAGEN_URL="http://transcomm_datagen:2020"
DATAGEN_PUBLIC_URL="http://transcomm_datagen:2020"
DATAGEN_DATABASE_URL="mysql://root:Pas5word@db_mariadb:3306/datagen"
DATAGEN_KAFKA_SENDER_IDENTITY="DC-TC"
DATAGEN_KAFKA_RECEIVERS="DHL-EXP"
DATAGEN_APPLICATION_ID="DC-TC"
DATAGEN_KAFKA_AUDIENCE="DHL-EXP"
DATAGEN_KAFKA_EXCEPTION_RECEIVERS="DHL-EXP,LUXC_DXB"
DATAGEN_KAFKA_EXCEPTION_MESSAGE_TYPE="TC_DHLE_ODAT_EXC"
AXIOS_RETRY_COUNT=5

MOCK_BLESS_KAFKA_GROUP_ID="group-mockbless"

HYPERLEDGER_URL="http://mock_hyperledger:4050"
HYPERLEDGER_CLIENT_ID="mock-client-id-1"
HYPERLEDGER_CHANNEL_NAME="tmpHLchannelname"
HYPERLEDGER_CHAINCODE_NAME="tmpHLchaincodename"
HYPERLEDGER_USER_ID="DHL"
HYPERLEDGER_ORGANIZATION_TYPE="COURIER"
HYPERLEDGER_ORGANIZATION_CODE="DHL"

BLESS_URL="http://mock_bless:5050"
BLESS_ROUTE="/submitorderToKafka"
BLESS_AUTH="ZjM4OWIwY2UtNDM1MC00MTJlLTk5YzAtYjQ1NjBlZjRiOGFl.MEUCIB7x3/23diLHD2oVtZl3e/AkSxvtOQylQzXZSd1uzIzzAiEA8uXDNnqJrfU4QEKhM1bBrxi0E5PxhGx79QXefo9krh8="
BLESS_KID="076b86ffc3e2ffe2d0f1ecc34a3f1da8437e3f277898ed088b0d6815a5180c1c"
BLESS_NEW_ORDER_MESSAGE_TYPE="TC_DHLE_CORD"
BLESS_CONFIRM_RETURN_DELIVERY_MESSAGE_TYPE="TC_DHLE_RDEL"
BLESS_HYPERLEDGER_MESSAGE_TYPES="TC_DHLE_CORD_ODAT,TC_DHLE_CORD_IDAT,TC_DHLE_CORD_ODAT,TC_DHLE_CORD_IDAT,TC_DHLE_TINF_ODAT,TC_DHLE_TINF_IDAT,TC_DHLE_TINF_DMAP,TC_DHLE_TINF_DTRA,TC_DHLE_IDEC_ODAT,TC_DHLE_IDEC_DMAP,TC_DHLE_IDEC_DTRA,TC_DHLE_IDEC_IDAT,TC_DHLE_ECON_DTRA,TC_DHLE_ECON_CREQ,TC_DHLE_ECON_IDAT,TC_DHLE_DORD_IDAT,TC_DHLE_DORD_ODAT,TC_DHLE_RDEL_ODAT,TC_DHLE_RDEL_IDAT"
BLESS_NEW_PICKUP_MESSAGE_TYPE="TC_DHLE_CUR_STA"
BLESS_NEW_MASTER_MOVEMENT_MESSAGE_TYPE="TC_DHLE_MANF"
BLESS_NEW_DETAIl_MOVEMENT_MESSAGE_TYPE="TC_DHLE_HAWB"
BLESS_ISSUER="LUXC_DXB"
BLESS_APPLICATION="DHL-EXP-TRANSCOM"
SUBJECT_PRIMARY="DHL-EXP"

SUBMITORDER_ORDER_DATA_MESSAGE_TYPE="TC_DHLE_CORD_ODAT"
SUBMITORDER_INVOICE_DATA_MESSAGE_TYPE="TC_DHLE_CORD_IDAT"
UPDATETRANSPORTINFO_ORDER_DATA_MESSAGE_TYPE="TC_DHLE_TINF_ODAT"
UPDATETRANSPORTINFO_INVOICE_DATA_MESSAGE_TYPE="TC_DHLE_TINF_IDAT"
UPDATETRANSPORTINFO_DECLARATION_JSON_MAPPING_MESSAGE_TYPE="TC_DHLE_TINF_DMAP"
UPDATETRANSPORTINFO_DOCUMENTTRACKING_MESSAGE_TYPE="TC_DHLE_TINF_DTRA"
INITIATEDECLARATION_ORDER_DATA_MESSAGE_TYPE="TC_DHLE_IDEC_ODAT"
INITIATEDECLARATION_DECLARATION_JSON_MAPPING_MESSAGE_TYPE="TC_DHLE_IDEC_DMAP"
INITIATEDECLARATION_DOCUMENTTRACKING_MESSAGE_TYPE="TC_DHLE_IDEC_DTRA"
INITIATEDECLARATION_INVOICE_DATA_MESSAGE_TYPE="TC_DHLE_IDEC_IDAT"
UPDATEEXITCONFIRMATION_DOCUMENTTRACKING_MESSAGE_TYPE="TC_DHLE_ECON_DTRA"
UPDATEEXITCONFIRMATION_CLAIM_REQUEST_MESSAGE_TYPE="TC_DHLE_ECON_CREQ"
UPDATEEXITCONFIRMATION_INVOICE_DATA_MESSAGE_TYPE="TC_DHLE_ECON_IDAT"
DELIVERORDER_INVOICE_DATA_MESSAGE_TYPE="TC_DHLE_DORD_IDAT"
DELIVERORDER_ORDER_DATA_MESSAGE_TYPE="TC_DHLE_DORD_ODAT"
CONFIRMRETURNDELIVERY_ORDER_DATA_MESSAGE_TYPE="TC_DHLE_RDEL_ODAT"
CONFIRMRETURNDELIVERY_INVOICE_DATA_MESSAGE_TYPE="TC_DHLE_RDEL_IDAT"
BUSINESS_EXCEPTION_MSG_TYPE="ROR"
DECLARATION_STATUS_CHANGE_DOCUMENTTRACKING_MESSAGE_TYPE="TC_DHLE_ECON_DTRA"
UPDATEEXITCONFIRMATION_ORDER_DATA_MESSAGE_TYPE="TC_DHLE_ECON_ODAT"
CLAIM_STATUS_CHANGE_DOCUMENTTRACKING_MESSAGE_TYPE="TC_DHLE_IDEC_DTRA"

AUTO_RETRIES="5"
AUTO_RETRIES_INTERVAL="1,1,2,2,5"

SUPERADMIN_EMAIL="super@admin.com"
# MAKE SURE TO USE SINGLE QUOTES (') AROUND THE SUPERADMIN_HASHED_PASSWORD. OTHERWISE THE '$' IS NOT ESCAPED
SUPERADMIN_HASHED_PASSWORD='$2a$10$4QnRWQE.0zPVrLk6Ub3uY.9Pabgifu2czeRSbaK8CK2zK.kqjPSmy' #Helloworld1!Helloworld1!

LOGGING_LEVEL="[\"error\", \"warn\", \"log\", \"debug\"]"
# You can adjust these values to configure the types of logs you want to have visible. Docs: https://docs.nestjs.com/techniques/logger

HL_QUEUE_RETRY_ATTEMPTS=3
HL_QUEUE_RETRY_DELAY=1000

HASHICORP_DHL_CODE_LOOKUP="dhl"
HASHICORP_SHARED_KEY_LOOKUP="shared"
HASHICORP_SECRET_ADDRESS="test"
HASHICORP_DEV_ROOT_TOKEN="myroot"
HASHICORP_VAULT_URL="http://mock_hashicorp_vault:8200/v1"
HASHICORP_USERNAME='testuser'
HASHICORP_PASSWORD='testpassword'
HASHICORP_ROOT_PATH='kv2''

STARTING_BLOCK=0
```
#### .env.local for datagen switch
```dotenv
KAFKA_VERSION=2.13-2.7.0
ZOOKEEPER_VERSION=3.7.0
MARIADB_VERSION=10.5

KAFKA_BROKERS="kafka1:9092"
KAFKA_TOPIC_CUSTOMS="DHL-EXP-TRANSCOM-TOPIC"
KAFKA_TOPIC_PICKUPS_MOVEMENTS="TOPIC-IM-TRANSCOMM-DXB"
KAFKA_TOPIC_NOTIFICATION="Notification"
KAFKA_TOPIC_BLESS_COMMON_APP_OUTPUT="BlessAckTopic"

EVENTSTORE_CONNECTION_STRING="esdb://db.eventstore:2113?tls=false"

TRANSCOMM_BACKEND_KAFKA_GROUP_ID="group-backend"
TRANSCOMM_BACKEND_DATABASE_URL="mysql://root:Pas5word@db_mariadb:3306/order_view"

# Client 02 VM configuration values
DATAGEN_ACTIVE = "true"
DATAGEN_KAFKA_GROUP_ID="group-datagen"
DATAGEN_URL="http://transcomm_datagen:2020"
DATAGEN_PUBLIC_URL="http://transcomm_datagen:2020"
DATAGEN_DATABASE_URL="mysql://root:Pas5word@db_mariadb:3306/datagen"
DATAGEN_KAFKA_SENDER_IDENTITY="DC-TC"
DATAGEN_KAFKA_RECEIVERS="DHL-EXP"
DATAGEN_APPLICATION_ID="DC-TC"
DATAGEN_KAFKA_AUDIENCE="DHL-EXP"
DATAGEN_KAFKA_EXCEPTION_RECEIVERS="DHL-EXP,LUXC_DXB"
DATAGEN_KAFKA_EXCEPTION_MESSAGE_TYPE="TC_DHLE_ODAT_EXC"
AXIOS_RETRY_COUNT=5

MOCK_BLESS_KAFKA_GROUP_ID="group-mockbless"

HYPERLEDGER_URL="http://mock_hyperledger:4050"
HYPERLEDGER_CLIENT_ID="mock-client-id-1"
HYPERLEDGER_CHANNEL_NAME="tmpHLchannelname"
HYPERLEDGER_CHAINCODE_NAME="tmpHLchaincodename"
HYPERLEDGER_USER_ID="DHL"
HYPERLEDGER_ORGANIZATION_TYPE="COURIER"
HYPERLEDGER_ORGANIZATION_CODE="DHL"

BLESS_URL="http://mock_bless:5050"
BLESS_ROUTE="/submitorderToKafka"
BLESS_AUTH="ZjM4OWIwY2UtNDM1MC00MTJlLTk5YzAtYjQ1NjBlZjRiOGFl.MEUCIB7x3/23diLHD2oVtZl3e/AkSxvtOQylQzXZSd1uzIzzAiEA8uXDNnqJrfU4QEKhM1bBrxi0E5PxhGx79QXefo9krh8="
BLESS_KID="076b86ffc3e2ffe2d0f1ecc34a3f1da8437e3f277898ed088b0d6815a5180c1c"
BLESS_NEW_ORDER_MESSAGE_TYPE="TC_DHLE_CORD"
BLESS_CONFIRM_RETURN_DELIVERY_MESSAGE_TYPE="TC_DHLE_RDEL"
BLESS_HYPERLEDGER_MESSAGE_TYPES="TC_DHLE_CORD_ODAT,TC_DHLE_CORD_IDAT,TC_DHLE_CORD_ODAT,TC_DHLE_CORD_IDAT,TC_DHLE_TINF_ODAT,TC_DHLE_TINF_IDAT,TC_DHLE_TINF_DMAP,TC_DHLE_TINF_DTRA,TC_DHLE_IDEC_ODAT,TC_DHLE_IDEC_DMAP,TC_DHLE_IDEC_DTRA,TC_DHLE_IDEC_IDAT,TC_DHLE_ECON_DTRA,TC_DHLE_ECON_CREQ,TC_DHLE_ECON_IDAT,TC_DHLE_DORD_IDAT,TC_DHLE_DORD_ODAT,TC_DHLE_RDEL_ODAT,TC_DHLE_RDEL_IDAT"
BLESS_NEW_PICKUP_MESSAGE_TYPE="TC_DHLE_CUR_STA"
BLESS_NEW_MASTER_MOVEMENT_MESSAGE_TYPE="TC_DHLE_MANF"
BLESS_NEW_DETAIl_MOVEMENT_MESSAGE_TYPE="TC_DHLE_HAWB"
BLESS_DECLARATION_REQUEST_EXPORT_MESSAGE_TYPE="TC_DHLE_ODAT_EXC_EXPORT"
BLESS_DECLARATION_REQUEST_IMPORT_MESSAGE_TYPE="TC_DHLE_ODAT_EXC_IMPORT"
BLESS_DECLARATION_RESPONSE_EXPORT_MESSAGE_TYPE="TC_DHLE_ODAT_EXC_EXPORT"
BLESS_DECLARATION_RESPONSE_IMPORT_MESSAGE_TYPE="TC_DHLE_ODAT_EXC_IMPORT"
BLESS_ISSUER="LUXC_DXB"
BLESS_APPLICATION="DHL-EXP-TRANSCOM"
SUBJECT_PRIMARY="DHL-EXP"

SUBMITORDER_ORDER_DATA_MESSAGE_TYPE="TC_DHLE_CORD_ODAT"
SUBMITORDER_INVOICE_DATA_MESSAGE_TYPE="TC_DHLE_CORD_IDAT"
UPDATETRANSPORTINFO_ORDER_DATA_MESSAGE_TYPE="TC_DHLE_TINF_ODAT"
UPDATETRANSPORTINFO_INVOICE_DATA_MESSAGE_TYPE="TC_DHLE_TINF_IDAT"
UPDATETRANSPORTINFO_DECLARATION_JSON_MAPPING_MESSAGE_TYPE="TC_DHLE_TINF_DMAP"
UPDATETRANSPORTINFO_DOCUMENTTRACKING_MESSAGE_TYPE="TC_DHLE_TINF_DTRA"
INITIATEDECLARATION_ORDER_DATA_MESSAGE_TYPE="TC_DHLE_IDEC_ODAT"
INITIATEDECLARATION_DECLARATION_JSON_MAPPING_MESSAGE_TYPE="TC_DHLE_IDEC_DMAP"
INITIATEDECLARATION_DOCUMENTTRACKING_MESSAGE_TYPE="TC_DHLE_IDEC_DTRA"
INITIATEDECLARATION_INVOICE_DATA_MESSAGE_TYPE="TC_DHLE_IDEC_IDAT"
UPDATEEXITCONFIRMATION_DOCUMENTTRACKING_MESSAGE_TYPE="TC_DHLE_ECON_DTRA"
UPDATEEXITCONFIRMATION_CLAIM_REQUEST_MESSAGE_TYPE="TC_DHLE_ECON_CREQ"
UPDATEEXITCONFIRMATION_INVOICE_DATA_MESSAGE_TYPE="TC_DHLE_ECON_IDAT"
DELIVERORDER_INVOICE_DATA_MESSAGE_TYPE="TC_DHLE_DORD_IDAT"
DELIVERORDER_ORDER_DATA_MESSAGE_TYPE="TC_DHLE_DORD_ODAT"
CONFIRMRETURNDELIVERY_ORDER_DATA_MESSAGE_TYPE="TC_DHLE_RDEL_ODAT"
CONFIRMRETURNDELIVERY_INVOICE_DATA_MESSAGE_TYPE="TC_DHLE_RDEL_IDAT"
BUSINESS_EXCEPTION_MSG_TYPE="ROR"
DECLARATION_STATUS_CHANGE_DOCUMENTTRACKING_MESSAGE_TYPE="TC_DHLE_ECON_DTRA"
UPDATEEXITCONFIRMATION_ORDER_DATA_MESSAGE_TYPE="TC_DHLE_ECON_ODAT"
CLAIM_STATUS_CHANGE_DOCUMENTTRACKING_MESSAGE_TYPE="TC_DHLE_IDEC_DTRA"

AUTO_RETRIES="5"
AUTO_RETRIES_INTERVAL="1,1,2,2,5"

SUPERADMIN_EMAIL="super@admin.com"
# MAKE SURE TO USE SINGLE QUOTES (') AROUND THE SUPERADMIN_HASHED_PASSWORD. OTHERWISE THE '$' IS NOT ESCAPED
SUPERADMIN_HASHED_PASSWORD='$2a$10$4QnRWQE.0zPVrLk6Ub3uY.9Pabgifu2czeRSbaK8CK2zK.kqjPSmy' #Helloworld1!Helloworld1!

LOGGING_LEVEL="[\"error\", \"warn\", \"log\", \"debug\"]"
# You can adjust these values to configure the types of logs you want to have visible. Docs: https://docs.nestjs.com/techniques/logger

HL_QUEUE_RETRY_ATTEMPTS=3
HL_QUEUE_RETRY_DELAY=1000

HASHICORP_DHL_CODE_LOOKUP="dhl"
HASHICORP_SHARED_KEY_LOOKUP="shared"
HASHICORP_SECRET_ADDRESS="test"
HASHICORP_DEV_ROOT_TOKEN="myroot"
HASHICORP_VAULT_URL="http://mock_hashicorp_vault:8200/v1"
HASHICORP_USERNAME='testuser'
HASHICORP_PASSWORD='testpassword'
HASHICORP_ROOT_PATH='kv2''

STARTING_BLOCK=0
```
#### setup

In the `src/` folder, create a file named `.env.local` and provide the above mentioned environment variables

```
docker-compose -f docker-compose.yml -f docker-compose.test.yml --env-file .env.test up --build -d
```


### Production deployment

This still has to be implemented.
