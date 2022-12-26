import { CancelOrder, ConfirmReturnDelivery, Order, ReturnOrder } from 'core';

export const validInput = `{
    "orderNumber": "ORDER-S-2",
    "actionDate": "2021-08-28T17:59:27.453Z",
    "orderDate": "2021-08-28T17:59:27.453Z",
    "ecomBusinessCode": "1235",
    "mode": "F",
    "consigneeName": "ISMA NOOR",
    "consigneeAddress": {
        "addressLine1": "10th Floor, Plaza IBM",
        "addressLine2": "No. 1005, First Avenue",
        "POBox": "54000",
        "city": "54000",
        "country": "PK",
        "phone": "+944413344901",
        "email": "isma.noor@avanzainnovations.com"
    },
    "billTo": "ISMA NOOR",
    "billToAddress": {
        "addressLine1": "10th Floor, Plaza IBM",
        "addressLine2": "No. 1005, First Avenue",
        "POBox": "54000",
        "city": "54000",
        "country": "PK"
    },
    "shipTo": "ISMA NOOR",
    "shipToAddress": {
        "addressLine1": "10th Floor, Plaza IBM",
        "addressLine2": "No. 1005, First Avenue",
        "POBox": "54000",
        "city": "54000",
        "country": "PK"
    },
    "invoices": [
        {
        "mode": "F",
        "invoiceNumber": "12902",
        "invoiceDate": "2021-08-28T17:59:27.453Z",
        "paymentInstrumentType": 10,
        "currency": "AED",
        "totalValue": 2050,
        "exporterCode": "12902",
        "FZCode": "1",
        "warehouseCode": "",
        "cargoOwnership": "1",
        "associatedEcomCompany": "",
        "brokerBusinessCode": "000012",
        "logisticsSPBusinessCode": "",
        "deliveryProviderBusinessCode": "BS002348",
        "documents": [{
            "hash": "2bce0b22d7e078f261cbc8b6a0aa37c05ec81a9ffb37ff33f72568ef7263902c917df5a14c5",
            "path": "/uat/uploadPublic/2020-6-28/2bce0b22d7e078f264c4df25db56c91b2104e03f72568ef7263902c917df5a14c5.pdf",
            "name": "44.pdf"
        }],
        "lineItems": [
            {
            "mode": "F",
            "lineNo": 11,
            "hscode": "1012110",
            "goodsCondition": "N",
            "description": "Tom Ford Black Faye Oval Sunglasses",
            "quantity": 2,
            "quantityUOM": "kg",
            "netWeight": 2,
            "netWeightUOM": "kg",
            "supplementaryQuantity": null,
            "supplementaryQuantityUOM": null,
            "valueOfGoods": 196,
            "countryOfOrigin": "IR",
            "prevDeclarationReference": null,
            "exemptions": [],
            "sku": {
                "productCode": "1902CC",
                "quantityUOM": "KG"
            },
            "discount": {
                "value": null,
                "percentage": 2
            },
            "permits": [],
            "originalValueOfItem": 200,
            "isFreeOfCost": "N"
            }
        ]
        }
    ]
}`;

export const invalidTypeInputFinal: Order = JSON.parse(`{
    "orderNumber": 123,
    "actionDate": "2021-08-28T17:59:27.453Z",
    "orderDate": "2021-08-28T17:59:27.453Z",
    "ecomBusinessCode": "1234",
    "mode": "F",
    "consigneeName": "ISMA NOOR",
    "consigneeAddress": {
        "addressLine1": "10th Floor, Plaza IBM",
        "addressLine2": "No. 1005, First Avenue",
        "POBox": "54000",
        "city": "54000",
        "country": "PK",
        "phone": "+944413344901",
        "email": "isma.noor@avanzainnovations.com"
    },
    "billTo": "ISMA NOOR",
    "billToAddress": {
        "addressLine1": "10th Floor, Plaza IBM",
        "addressLine2": "No. 1005, First Avenue",
        "POBox": "54000",
        "city": "54000",
        "country": "PK"
    },
    "shipTo": "ISMA NOOR",
    "shipToAddress": {
        "addressLine1": "10th Floor, Plaza IBM",
        "addressLine2": "No. 1005, First Avenue",
        "POBox": "54000",
        "city": "54000",
        "country": "PK"
    },
    "invoices": [
        {
        "mode": "F",
        "invoiceNumber": "12902",
        "invoiceDate": "2021-08-28T17:59:27.453Z",
        "paymentInstrumentType": 10,
        "currency": "AED",
        "totalValue": 2050,
        "exporterCode": "12902",
        "FZCode": "1",
        "warehouseCode": "",
        "cargoOwnership": "1",
        "associatedEcomCompany": "",
        "brokerBusinessCode": "000012",
        "logisticsSPBusinessCode": "",
        "deliveryProviderBusinessCode": "BS002348",
        "documents": [{
            "hash": "2bce0b22d7e078f261cbc8b6a0aa37c05ec81a9ffb37ff33f72568ef7263902c917df5a14c5",
            "path": "/uat/uploadPublic/2020-6-28/2bce0b22d7e078f264c4df25db56c91b2104e03f72568ef7263902c917df5a14c5.pdf",
            "name": "44.pdf"
        }],
        "lineItems": [
            {
            "mode": "F",
            "lineNo": 11,
            "hscode": "1012110",
            "goodsCondition": "N",
            "description": "Tom Ford Black Faye Oval Sunglasses",
            "quantity": 2,
            "quantityUOM": "kg",
            "netWeight": 2,
            "netWeightUOM": "kg",
            "supplementaryQuantity": null,
            "supplementaryQuantityUOM": null,
            "valueOfGoods": 196,
            "countryOfOrigin": "IR",
            "prevDeclarationReference": null,
            "exemptions": [],
            "sku": {
                "productCode": "1902CC",
                "quantityUOM": "KG"
            },
            "discount": {
                "value": null,
                "percentage": 2
            },
            "permits": [],
            "originalValueOfItem": 200,
            "isFreeOfCost": "N"
            }
        ]
        }
    ]
}`);

export const noEcomInputFinal: Order = JSON.parse(`{
    "orderNumber": 123,
    "actionDate": "2021-08-28T17:59:27.453Z",
    "orderDate": "2021-08-28T17:59:27.453Z",
    "ecomBusinessCode": "",
    "mode": "F",
    "consigneeName": "ISMA NOOR",
    "consigneeAddress": {
        "addressLine1": "10th Floor, Plaza IBM",
        "addressLine2": "No. 1005, First Avenue",
        "POBox": "54000",
        "city": "54000",
        "country": "PK",
        "phone": "+944413344901",
        "email": "isma.noor@avanzainnovations.com"
    },
    "billTo": "ISMA NOOR",
    "billToAddress": {
        "addressLine1": "10th Floor, Plaza IBM",
        "addressLine2": "No. 1005, First Avenue",
        "POBox": "54000",
        "city": "54000",
        "country": "PK"
    },
    "shipTo": "ISMA NOOR",
    "shipToAddress": {
        "addressLine1": "10th Floor, Plaza IBM",
        "addressLine2": "No. 1005, First Avenue",
        "POBox": "54000",
        "city": "54000",
        "country": "PK"
    },
    "invoices": [
        {
        "mode": "F",
        "invoiceNumber": "12902",
        "invoiceDate": "2021-08-28T17:59:27.453Z",
        "paymentInstrumentType": 10,
        "currency": "AED",
        "totalValue": 2050,
        "exporterCode": "12902",
        "FZCode": "1",
        "warehouseCode": "",
        "cargoOwnership": "1",
        "associatedEcomCompany": "",
        "brokerBusinessCode": "000012",
        "logisticsSPBusinessCode": "",
        "deliveryProviderBusinessCode": "BS002348",
        "documents": [{
            "hash": "2bce0b22d7e078f261cbc8b6a0aa37c05ec81a9ffb37ff33f72568ef7263902c917df5a14c5",
            "path": "/uat/uploadPublic/2020-6-28/2bce0b22d7e078f264c4df25db56c91b2104e03f72568ef7263902c917df5a14c5.pdf",
            "name": "44.pdf"
        }],
        "lineItems": [
            {
            "mode": "F",
            "lineNo": 11,
            "hscode": "1012110",
            "goodsCondition": "N",
            "description": "Tom Ford Black Faye Oval Sunglasses",
            "quantity": 2,
            "quantityUOM": "kg",
            "netWeight": 2,
            "netWeightUOM": "kg",
            "supplementaryQuantity": null,
            "supplementaryQuantityUOM": null,
            "valueOfGoods": 196,
            "countryOfOrigin": "IR",
            "prevDeclarationReference": null,
            "exemptions": [],
            "sku": {
                "productCode": "1902CC",
                "quantityUOM": "KG"
            },
            "discount": {
                "value": null,
                "percentage": 2
            },
            "permits": [],
            "originalValueOfItem": 200,
            "isFreeOfCost": "N"
            }
        ]
        }
    ]
}`);

export const bothFzcodeAndWarehouseCodeFinal: Order = JSON.parse(`{
    "orderNumber": "ORDER-S-2",
    "actionDate": "2021-08-28T17:59:27.453Z",
    "orderDate": "2021-08-28T17:59:27.453Z",
    "ecomBusinessCode": "1234",
    "mode": "F",
    "consigneeName": "ISMA NOOR",
    "consigneeAddress": {
        "addressLine1": "10th Floor, Plaza IBM",
        "addressLine2": "No. 1005, First Avenue",
        "POBox": "54000",
        "city": "54000",
        "country": "PK",
        "phone": "+944413344901",
        "email": "isma.noor@avanzainnovations.com"
    },
    "billTo": "ISMA NOOR",
    "billToAddress": {
        "addressLine1": "10th Floor, Plaza IBM",
        "addressLine2": "No. 1005, First Avenue",
        "POBox": "54000",
        "city": "54000",
        "country": "PK"
    },
    "shipTo": "ISMA NOOR",
    "shipToAddress": {
        "addressLine1": "10th Floor, Plaza IBM",
        "addressLine2": "No. 1005, First Avenue",
        "POBox": "54000",
        "city": "54000",
        "country": "PK"
    },
    "invoices": [
        {
        "mode": "F",
        "invoiceNumber": "12902",
        "invoiceDate": "2021-08-28T17:59:27.453Z",
        "paymentInstrumentType": 10,
        "currency": "AED",
        "totalValue": 2050,
        "exporterCode": "12902",
        "FZCode": "1",
        "warehouseCode": "2",
        "cargoOwnership": "1",
        "associatedEcomCompany": "",
        "brokerBusinessCode": "000012",
        "logisticsSPBusinessCode": "",
        "deliveryProviderBusinessCode": "BS002348",
        "documents": [{
            "hash": "2bce0b22d7e078f261cbc8b6a0aa37c05ec81a9ffb37ff33f72568ef7263902c917df5a14c5",
            "path": "/uat/uploadPublic/2020-6-28/2bce0b22d7e078f264c4df25db56c91b2104e03f72568ef7263902c917df5a14c5.pdf",
            "name": "44.pdf"
        }],
        "lineItems": [
            {
            "mode": "F",
            "lineNo": 11,
            "hscode": "1012110",
            "goodsCondition": "N",
            "description": "Tom Ford Black Faye Oval Sunglasses",
            "quantity": 2,
            "quantityUOM": "kg",
            "netWeight": 2,
            "netWeightUOM": "kg",
            "supplementaryQuantity": null,
            "supplementaryQuantityUOM": null,
            "valueOfGoods": 196,
            "countryOfOrigin": "IR",
            "prevDeclarationReference": null,
            "exemptions": [],
            "sku": {
                "productCode": "1902CC",
                "quantityUOM": "KG"
            },
            "discount": {
                "value": null,
                "percentage": 2
            },
            "permits": [],
            "originalValueOfItem": 200,
            "isFreeOfCost": "N"
            }
        ]
        }
    ]
}`);

export const invalidCountryEnumCodeFinal: Order = JSON.parse(`{
    "orderNumber": "ORDER-S-2",
    "actionDate": "2021-08-28T17:59:27.453Z",
    "orderDate": "2021-08-28T17:59:27.453Z",
    "ecomBusinessCode": "1234",
    "mode": "F",
    "consigneeName": "ISMA NOOR",
    "consigneeAddress": {
        "addressLine1": "10th Floor, Plaza IBM",
        "addressLine2": "No. 1005, First Avenue",
        "POBox": "54000",
        "city": "54000",
        "country": "AA",
        "phone": "+944413344901",
        "email": "isma.noor@avanzainnovations.com"
    },
    "billTo": "ISMA NOOR",
    "billToAddress": {
        "addressLine1": "10th Floor, Plaza IBM",
        "addressLine2": "No. 1005, First Avenue",
        "POBox": "54000",
        "city": "54000",
        "country": "AA"
    },
    "shipTo": "ISMA NOOR",
    "shipToAddress": {
        "addressLine1": "10th Floor, Plaza IBM",
        "addressLine2": "No. 1005, First Avenue",
        "POBox": "54000",
        "city": "54000",
        "country": "AA"
    },
    "invoices": [
        {
        "mode": "F",
        "invoiceNumber": "12902",
        "invoiceDate": "2021-08-28T17:59:27.453Z",
        "paymentInstrumentType": 10,
        "currency": "AED",
        "totalValue": 2050,
        "exporterCode": "12902",
        "FZCode": "1",
        "warehouseCode": "",
        "cargoOwnership": "1",
        "associatedEcomCompany": "",
        "brokerBusinessCode": "000012",
        "logisticsSPBusinessCode": "",
        "deliveryProviderBusinessCode": "BS002348",
        "documents": [{
            "hash": "2bce0b22d7e078f261cbc8b6a0aa37c05ec81a9ffb37ff33f72568ef7263902c917df5a14c5",
            "path": "/uat/uploadPublic/2020-6-28/2bce0b22d7e078f264c4df25db56c91b2104e03f72568ef7263902c917df5a14c5.pdf",
            "name": "44.pdf"
        }],
        "lineItems": [
            {
            "mode": "F",
            "lineNo": 11,
            "hscode": "1012110",
            "goodsCondition": "N",
            "description": "Tom Ford Black Faye Oval Sunglasses",
            "quantity": 2,
            "quantityUOM": "kg",
            "netWeight": 2,
            "netWeightUOM": "kg",
            "supplementaryQuantity": null,
            "supplementaryQuantityUOM": null,
            "valueOfGoods": 196,
            "countryOfOrigin": "IR",
            "prevDeclarationReference": null,
            "exemptions": [],
            "sku": {
                "productCode": "1902CC",
                "quantityUOM": "KG"
            },
            "discount": {
                "value": null,
                "percentage": 2
            },
            "permits": [],
            "originalValueOfItem": 200,
            "isFreeOfCost": "N"
            }
        ]
        }
    ]
}`);

export const overMaxItemsInputFinal: ReturnOrder = JSON.parse(`{
    "orderNumber": "ORDER-S-2",
    "actionDate": "2021-08-28T17:59:27.453Z",
    "orderDate": "2021-08-28T17:59:27.453Z",
    "ecomBusinessCode": "1234",
    "mode": "F",
    "consigneeName": "ISMA NOOR",
    "consigneeAddress": {
        "addressLine1": "10th Floor, Plaza IBM",
        "addressLine2": "No. 1005, First Avenue",
        "POBox": "54000",
        "city": "54000",
        "country": "PK",
        "phone": "+944413344901",
        "email": "isma.noor@avanzainnovations.com"
    },
    "billTo": "ISMA NOOR",
    "billToAddress": {
        "addressLine1": "10th Floor, Plaza IBM",
        "addressLine2": "No. 1005, First Avenue",
        "POBox": "54000",
        "city": "54000",
        "country": "PK"
    },
    "shipTo": "ISMA NOOR",
    "shipToAddress": {
        "addressLine1": "10th Floor, Plaza IBM",
        "addressLine2": "No. 1005, First Avenue",
        "POBox": "54000",
        "city": "54000",
        "country": "PK"
    },
    "invoices": [
        {
        "mode": "F",
        "invoiceNumber": "12902",
        "invoiceDate": "2021-08-28T17:59:27.453Z",
        "paymentInstrumentType": 10,
        "currency": "AED",
        "totalValue": 2050,
        "exporterCode": "12902",
        "FZCode": "1",
        "warehouseCode": "",
        "cargoOwnership": "1",
        "associatedEcomCompany": "",
        "brokerBusinessCode": "000012",
        "logisticsSPBusinessCode": "",
        "deliveryProviderBusinessCode": "BS002348",
        "documents": [{
            "hash": "2bce0b22d7e078f261cbc8b6a0aa37c05ec81a9ffb37ff33f72568ef7263902c917df5a14c5",
            "path": "/uat/uploadPublic/2020-6-28/2bce0b22d7e078f264c4df25db56c91b2104e03f72568ef7263902c917df5a14c2.pdf",
            "name": "44.pdf"
        },{
            "hash": "3bce0b22d7e078f261cbc8b6a0aa37c05ec81a9ffb37ff33f72568ef7263902c917df5a14c5",
            "path": "/uat/uploadPublic/2020-6-28/2bce0b22d7e078f264c4df25db56c91b2104e03f72568ef7263902c917df5a14c3.pdf",
            "name": "45.pdf"
        },{
            "hash": "4bce0b22d7e078f261cbc8b6a0aa37c05ec81a9ffb37ff33f72568ef7263902c917df5a14c5",
            "path": "/uat/uploadPublic/2020-6-28/2bce0b22d7e078f264c4df25db56c91b2104e03f72568ef7263902c917df5a14c4.pdf",
            "name": "46.pdf"
        },{
            "hash": "5bce0b22d7e078f261cbc8b6a0aa37c05ec81a9ffb37ff33f72568ef7263902c917df5a14c5",
            "path": "/uat/uploadPublic/2020-6-28/2bce0b22d7e078f264c4df25db56c91b2104e03f72568ef7263902c917df5a14c5.pdf",
            "name": "47.pdf"
        }],
        "lineItems": [
            {
            "mode": "F",
            "lineNo": 11,
            "hscode": "1012110",
            "goodsCondition": "N",
            "description": "Tom Ford Black Faye Oval Sunglasses",
            "quantity": 2,
            "quantityUOM": "kg",
            "netWeight": 2,
            "netWeightUOM": "kg",
            "dutyPaid": "N",
            "supplementaryQuantity": null,
            "supplementaryQuantityUOM": null,
            "valueOfGoods": 196,
            "countryOfOrigin": "IR",
            "prevDeclarationReference": null,
            "exemptions": [],
            "sku": {
                "productCode": "1902CC",
                "quantityUOM": "KG"
            },
            "discount": {
                "value": null,
                "percentage": 2
            },
            "permits": [],
            "originalValueOfItem": 200,
            "isFreeOfCost": "N"
            }
        ]
        }
    ]
}`);

export const validInputReturn: ReturnOrder = JSON.parse(`{ 
    "orderNumber": "ORD111222",
    "actionDate": "2021-08-28T17:59:27.453Z",
    "mode": "R",
    "ecomBusinessCode": "1234",
    "invoices":[
        {
            "mode":"R",
            "invoiceNumber":"12902",
            "returnDetail":{
                "returnRequestNo":"RET22002",
                "returnReason":"2",
                "prevTransportDocNo":"",
                "prevDeclarationReference":"",
                "declarationPurposeDetails":"Itemsforplayground,theatre,exhibitionandlikeevents"
            },
            "lineItems":[
                {
                    "mode":"R", 
                    "lineNo":1223,
                    "quantityReturned":1,
                    "hscode":"1022100"
                }
            ]
        }
    ]
}`);

export const invalidInputReturnAddedFields: ReturnOrder = JSON.parse(`{ 
    "orderNumber": "ORD111222",
    "ecomBusinessCode": "1234",
    "newField": "test",
    "actionDate": "2021-08-28T17:59:27.453Z",
    "mode": "R",
    "invoices":[
        {
            "mode":"R",
            "invoiceNumber":"12902",
            "returnDetail":{
                "returnRequestNo":"RET22002",
                "returnReason":"2",
                "prevTransportDocNo":"",
                "prevDeclarationReference":"",
                "declarationPurposeDetails":"Itemsforplayground,theatre,exhibitionandlikeevents"
            },
            "lineItems":[
                {
                    "mode":"R", 
                    "lineNo":1223, 
                    "quantityReturned":1,
                    "hscode":"1022100"
                }
            ]
        }
    ]
}`);

export const validInputCancelOrder: CancelOrder = JSON.parse(`{ 
    "orderNumber": "ORD111222",
    "actionDate": "2021-08-28T17:59:27.453Z",
    "mode": "C",
    "ecomBusinessCode": "1234",
    "invoices":[
        {
            "invoiceNumber":"12902",
            "cancellationReason": "Reason for cancellation"
        }
    ]
}`);

export const invalidInputCancelOrderMissingInvoiceNumber: CancelOrder =
  JSON.parse(`{ 
    "orderNumber": "ORD111222",
    "actionDate": "2021-08-28T17:59:27.453Z",
    "mode": "C",
    "ecomBusinessCode": "1234",
    "invoices":[
        {
            "cancellationReason": "Reason for cancellation"
        }
    ]
}`);

export const validInputConfirmReturnDelivery: ConfirmReturnDelivery =
  JSON.parse(`{
    "orderNumber": "DEMO-ORDER-21",
    "ecomBusinessCode": "amazonae",
    "invoiceNumber": "INV-2-5100152TDF",
    "lineItems": [
      {
        "lineNo": 1292,
        "hscode": "1022100",
        "skuProductCode": "sku1020",
        "receviedQuantity": 1.0,
        "isExtra": "N",
        "quantityUOM": "KG",
        "goodsCondition": "N"
      }
    ],
    "transportDocNo": "HAWB38393",
    "returnRequestNo": "",
    "gatePasses": [
      {
        "gatePassNumber": "GP2182",
        "gatePassDirection": "I",
        "ActualMovingInDate": "15/1/2020"
      }
    ],
    "dateOfReceivingBackGoods": "15/1/2020"
  }`);

export const invalidInputConfirmReturnDeliveryMissingTransportDocAndReturnRequestNumbers: ConfirmReturnDelivery =
  JSON.parse(`{
    "orderNumber": "DEMO-ORDER-21",
    "ecomBusinessCode": "amazonae",
    "invoiceNumber": "INV-2-5100152TDF",
    "lineItems": [
      {
        "lineNo": 1292,
        "hscode": "1022100",
        "skuProductCode": "sku1020",
        "receviedQuantity": 1.0,
        "isExtra": "N",
        "hsCode": "1022101",
        "quantityUOM": "KG",
        "goodsCondition": "N"
      }
    ],
    "transportDocNo": "",
    "returnRequestNo": "",
    "gatePasses": [
      {
        "gatePassNumber": "GP2182",
        "gatePassDirection": "I",
        "ActualMovingInDate": "15/1/2020"
      }
    ],
    "dateOfReceivingBackGoods": "15/1/2020"
  }`);

export const validHSCodeInput: Order = JSON.parse(`{
    "orderNumber": "ORDER-S-2",
    "actionDate": "2021-08-28T17:59:27.453Z",
    "orderDate": "2021-08-28T17:59:27.453Z",
    "ecomBusinessCode": "1234",
    "mode": "F",
    "consigneeName": "ISMA NOOR",
    "consigneeAddress": {
        "addressLine1": "10th Floor, Plaza IBM",
        "addressLine2": "No. 1005, First Avenue",
        "POBox": "54000",
        "city": "54000",
        "country": "PK",
        "phone": "+944413344901",
        "email": "isma.noor@avanzainnovations.com"
    },
    "billTo": "ISMA NOOR",
    "billToAddress": {
        "addressLine1": "10th Floor, Plaza IBM",
        "addressLine2": "No. 1005, First Avenue",
        "POBox": "54000",
        "city": "54000",
        "country": "PK"
    },
    "shipTo": "ISMA NOOR",
    "shipToAddress": {
        "addressLine1": "10th Floor, Plaza IBM",
        "addressLine2": "No. 1005, First Avenue",
        "POBox": "54000",
        "city": "54000",
        "country": "PK"
    },
    "invoices": [
        {
        "mode": "F",
        "invoiceNumber": "12902",
        "invoiceDate": "2021-08-28T17:59:27.453Z",
        "paymentInstrumentType": 10,
        "currency": "AED",
        "totalValue": 2050,
        "exporterCode": "12902",
        "FZCode": "1",
        "warehouseCode": "",
        "cargoOwnership": "1",
        "associatedEcomCompany": "",
        "brokerBusinessCode": "000012",
        "logisticsSPBusinessCode": "",
        "deliveryProviderBusinessCode": "BS002348",
        "documents": [{
            "hash": "2bce0b22d7e078f261cbc8b6a0aa37c05ec81a9ffb37ff33f72568ef7263902c917df5a14c5",
            "path": "/uat/uploadPublic/2020-6-28/2bce0b22d7e078f264c4df25db56c91b2104e03f72568ef7263902c917df5a14c5.pdf",
            "name": "44.pdf"
        }],
        "lineItems": [
            {
            "mode": "F",
            "lineNo": 11,
            "hscode": "10.121.10",
            "goodsCondition": "N",
            "description": "Tom Ford Black Faye Oval Sunglasses",
            "quantity": 2,
            "quantityUOM": "kg",
            "netWeight": 2,
            "netWeightUOM": "kg",
            "supplementaryQuantity": null,
            "supplementaryQuantityUOM": null,
            "valueOfGoods": 196,
            "countryOfOrigin": "IR",
            "prevDeclarationReference": null,
            "exemptions": [],
            "sku": {
                "productCode": "1902CC",
                "quantityUOM": "KG"
            },
            "discount": {
                "value": null,
                "percentage": 2
            },
            "permits": [],
            "originalValueOfItem": 200,
            "isFreeOfCost": "N"
            }
        ]
        }
    ]
}`);

export const invalidHSCodeInput: Order = JSON.parse(`{
    "orderNumber": "ORDER-S-2",
    "actionDate": "2021-08-28T17:59:27.453Z",
    "ecomBusinessCode": "1234",
    "mode": "F",
    "consigneeName": "ISMA NOOR",
    "consigneeAddress": {
        "addressLine1": "10th Floor, Plaza IBM",
        "addressLine2": "No. 1005, First Avenue",
        "POBox": "54000",
        "city": "54000",
        "country": "PK",
        "phone": "+944413344901",
        "email": "isma.noor@avanzainnovations.com"
    },
    "billTo": "ISMA NOOR",
    "billToAddress": {
        "addressLine1": "10th Floor, Plaza IBM",
        "addressLine2": "No. 1005, First Avenue",
        "POBox": "54000",
        "city": "54000",
        "country": "PK"
    },
    "shipTo": "ISMA NOOR",
    "shipToAddress": {
        "addressLine1": "10th Floor, Plaza IBM",
        "addressLine2": "No. 1005, First Avenue",
        "POBox": "54000",
        "city": "54000",
        "country": "PK"
    },
    "invoices": [
        {
        "mode": "F",
        "invoiceNumber": "12902",
        "invoiceDate": "2021-08-28T17:59:27.453Z",
        "paymentInstrumentType": 10,
        "currency": "AED",
        "totalValue": 2050,
        "exporterCode": "12902",
        "FZCode": "1",
        "warehouseCode": "",
        "cargoOwnership": "1",
        "associatedEcomCompany": "",
        "brokerBusinessCode": "000012",
        "logisticsSPBusinessCode": "",
        "deliveryProviderBusinessCode": "BS002348",
        "documents": [{
            "hash": "2bce0b22d7e078f261cbc8b6a0aa37c05ec81a9ffb37ff33f72568ef7263902c917df5a14c5",
            "path": "/uat/uploadPublic/2020-6-28/2bce0b22d7e078f264c4df25db56c91b2104e03f72568ef7263902c917df5a14c5.pdf",
            "name": "44.pdf"
        }],
        "lineItems": [
            {
            "mode": "F",
            "lineNo": 11,
            "hscode": "55555555",
            "goodsCondition": "N",
            "description": "Tom Ford Black Faye Oval Sunglasses",
            "quantity": 2,
            "quantityUOM": "kg",
            "netWeight": 2,
            "netWeightUOM": "kg",
            "supplementaryQuantity": null,
            "supplementaryQuantityUOM": null,
            "valueOfGoods": 196,
            "countryOfOrigin": "IR",
            "prevDeclarationReference": null,
            "exemptions": [],
            "sku": {
                "productCode": "1902CC",
                "quantityUOM": "KG"
            },
            "discount": {
                "value": null,
                "percentage": 2
            },
            "permits": [],
            "originalValueOfItem": 200,
            "isFreeOfCost": "N"
            }
        ]
        }
    ]
}`);
