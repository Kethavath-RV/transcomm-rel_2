import { DateConverterSlashesToDashes, findPaymentModeAndAccountNo, DateTimeOffsetToDubaiTime, parseGMTOffset } from "../utility";
import * as constants from '../constants';

const mockConfig = constants as {
  businessCodeAccountNoMapping: Record<number, constants.AccountNumberType>
};

describe('date string conversion', () => {

  it('converts a date split by / correctly', () => {
    const exampleDate = '2020/06/02';
    const expected = '2020-06-02';
    const result = DateConverterSlashesToDashes(exampleDate);

    expect(result).toBe(expected);
  });

  it('does not convert the reference', () => {
    const exampleDate = '2020/06/02';
    const expected = '2020-06-02';
    const result = DateConverterSlashesToDashes(exampleDate);

    expect(result).toBe(expected);
    expect(exampleDate).toBe('2020/06/02');
  });

  it('returns original value if length is too short', () => {
    const exampleBad = '2020/6/2';
    const expected = '2020/6/2';

    const result = DateConverterSlashesToDashes(exampleBad);
    expect(result).toBe(expected);
  });

  it('returns original value if the data is split by non /W character', () => {
    const exampleBad = '2020s06s02';
    const expected = '2020s06s02';

    const result = DateConverterSlashesToDashes(exampleBad);
    expect(result).toBe(expected);
  })

  it('if the date is null/not set return empty string', () => {
    const result = DateConverterSlashesToDashes();
    expect(result).toBe('');
  });

})

describe('Find account no and payment mode based on business code', () => {

  it('get payment mode CA = 1 and account no based on businessCode data', () => {
    mockConfig.businessCodeAccountNoMapping = {
      1: {
        businessCode: "AE-9105340", paymentMode: "CA",
        requestType: "DECLARATION", accountNo: "1222978"
      }
    };

    const expected = '1';
    const result = findPaymentModeAndAccountNo(mockConfig.businessCodeAccountNoMapping[1].businessCode);

    expect(result?.paymentMode).toBe(expected);
    expect(result?.accountNo).toBe(mockConfig.businessCodeAccountNoMapping[1].accountNo);
  });

  it('get payment mode SG = 2 based on businessCode data', () => {
    mockConfig.businessCodeAccountNoMapping = {
      4: {
        businessCode: "TEST", paymentMode: "SG",
        requestType: "DECLARATION", accountNo: "1222978"
      }
    };
    const expected = '2';
    const result = findPaymentModeAndAccountNo(mockConfig.businessCodeAccountNoMapping[4].businessCode);

    expect(result?.paymentMode).toBe(expected);
  });

  it('get payment mode empty (not CA/SG)', () => {
    mockConfig.businessCodeAccountNoMapping = {
      5: {
        businessCode: "TEST", paymentMode: "XX",
        requestType: "DECLARATION", accountNo: "1222978"
      }
    };
    const expected = '';
    const result = findPaymentModeAndAccountNo(mockConfig.businessCodeAccountNoMapping[5].businessCode);

    expect(result?.paymentMode).toBe(expected);
    expect(result?.accountNo).toBe("1222978");
  });

  it('get payment mode and account no empty if request type is not "DECLARATION"', () => {
    mockConfig.businessCodeAccountNoMapping = {
      3: {
        businessCode: "AE-9105341", paymentMode: "CA",
        requestType: "CLAIM", accountNo: "1222978"
      }
    };
    const expected = '';
    const result = findPaymentModeAndAccountNo(mockConfig.businessCodeAccountNoMapping[3].businessCode);

    expect(result?.paymentMode).toBe(expected);
    expect(result?.accountNo).toBe(expected);
  });
})

describe('DateTimeOffsetToDubaiTime tests', () => {
  it('converts provided test data', () => {
    const date = '2021/05/03';
    const time = '06:16:14';
    const offset = '+04:00';
    const expected = "03/05/2021 06:16:14"
    const result = DateTimeOffsetToDubaiTime(date, time, offset);

    expect(result).toBe(expected);
  });

  it('converts provided test data that has dashes', () => {
    const date = '2021-05-03';
    const time = '06:16:14';
    const offset = '+04:00';
    const expected = "03/05/2021 06:16:14"
    const result = DateTimeOffsetToDubaiTime(date, time, offset);

    expect(result).toBe(expected);
  });

})

describe('GMT offset converter tests', () => {
  it('converts provided test data - type 1', () => {
    const offset = '+04';
    const expected = '+04:00'
    const result = parseGMTOffset(offset);

    expect(result).toBe(expected);
  });

  it('converts provided test data - type 2', () => {
    const offset = '+2';
    const expected = '+02:00'
    const result = parseGMTOffset(offset);

    expect(result).toBe(expected);
  });

  it('converts provided test data - type 3', () => {
    const offset = '-2';
    const expected = '-02:00'
    const result = parseGMTOffset(offset);

    expect(result).toBe(expected);
  });

  it('converts provided test data - type 4', () => {
    const offset = '-02';
    const expected = '-02:00'
    const result = parseGMTOffset(offset);

    expect(result).toBe(expected);
  });


  it('doesnt convert provided test data if not needed', () => {
    const offset = '+04:00';
    const expected = '+04:00'
    const result = parseGMTOffset(offset);

    expect(result).toBe(expected);
  });

  it('returns null when string to long', () => {
    const offset = '+04:000012';
    const result = parseGMTOffset(offset);

    expect(result).toBe(null);
  });
})