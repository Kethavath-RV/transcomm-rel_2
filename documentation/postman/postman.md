# PostMan Collections

## Auth

This collection contains all the requests to perform authentication with the transcom backend.

## Mock Bless

This collection contains all the requests that can be made towards the mock bless.
typical use cases are:

- sending mock checkpoint file
- sending mock processed validations

## Mock Hyperledger

This collection contains all possible requests to the mock hyperledger as well as the ability to invoke mocks

typical use cases are:

- send block events
- send contract events

## Orders

This collection contains all the requests that can be performed on the transcom backend regarding orders.
All endpoints require authentication

## Transformer

This collection contains all the requests that can be performed to the data transformer.

Typical use cases are:

- Submit order
- Cancel order
- Return order
- Submit return delivery

## Users

This collection contains all possible requests that can be performed on the transcom backend regarding users.

typical user cases are:

- register user



## Happy Flow

|Step Number|Collection|Method|details|
|--|--|--|--|
|1|Transformer|Submit Order|returns a vc-id
|2|Mock Bless|Post Processed notification|use vc-id from order|
|3|Mock Bless|Post Pickup File|Ensure ordernumber & ecomcode is correct within pickupfile|
|4|Mock Bless|Post Master Movement|Ensure airwayBillNo is correct/present within the file|
|5|Mock Bless|Post Detail Movement|Ensure MawbNumber is correct/present within the file matches master's|
|6|Mock Hyperledger|CreateMockBlockEvent|Ensure txId matches update shipping info's txId (find in datagen db)|
|7|Mock Hyperledger|CreateMockContractEvent|Ensure Payload Key matches known collection key (find in datagen db), whatever the customsStatus is set to has impact|


## Declaration Flow (Amendment Flow)

|Step Number|Collection|Method|details|
|--|--|--|--|
|1|Transformer|Submit Order|Returns a vc-id|
|2|Mock Bless|Post Processed notification|
|3|Mock Hyperledger|ContractEvent-chainCodeEvent|Ensure txId matches submit order info's txId (find in datagen db)|
|4|Mock Bless|Post Pickup File|ensure order
|5|Mock Bless|Post Master Movement|Ensure airwayBillNo is correct/present within the file|
|6|Mock Bless|Post Detail Movement|Ensure MawbNumber is correct/present within the file matches master's|
|7|Mock Hyperledger|ContractEvent-chainCodeEvent|Ensure txId matches update shipping info's txId (find in datagen db) ensure the payload contains document tracking details as well as the data matches up correct (invoice ids etc)|
|8|Mock Hyperledger|ContractEvent-DeclarationStatusChange|Ensure the key matches the key from the previous request. To create an failed declaration, ensure the status is 'Rejected'|
|9|N/A|N/A|Go to the UI (as an editior) and adjust the order. And Save.|
|10|Mock HyperLedger| ContractEvent-DeclarationStatusChange|Ensure the key matches request (6). ensure payload contains the status 'Cleared'|
|11|Mock Bless|Post delivered file to Kafka|Ensure airwaybillNo is correct and order reference|


## Update Exit Confirmation Flow (Add claim)

|Step Number|Collection|Method|details|
|--|--|--|--|
|1|Transformer|Submit Order|returns a vc-id
|2|Mock Bless|Post Processed notification|use vc-id from order|
|3|Mock Bless|Post Pickup File|Ensure ordernumber & ecomcode is correct within pickupfile|
|4|Mock Bless|Post Master Movement|Ensure airwayBillNo is correct/present within the file|
|5|Mock Bless|Post Detail Movement|Ensure MawbNumber is correct/present within the file matches master's|
|6|Mock Hyperledger|CreateMockBlockEvent-Documenttracking-Declaration|Ensure txId matches update shipping info's txId (find in datagen db)|
|7|Mock Hyperledger|CreateMockBlockEvent-Documenttracking-Declaration|Ensure Payload Key matches known collection key (find in datagen db), whatever the customsStatus is set to has impact|
|8|Mock Bless|Post DF Checkpoint File|Ensure ordernumber & ecomcode is correct within checkpoint file|
|9|Mock Hyperledger|CreateMockBlockEvent-Documenttracking-Claim|Ensure txId matches update shipping info's txId (find in datagen db)|
|10|Mock Hyperledger|CreateMockBlockEvent-Documenttracking-Claim|Ensure Payload Key matches known collection key (find in datagen db), whatever the customsStatus is set to has impact|
