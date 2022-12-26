import { businessCodeAccountNoMapping } from './constants';
export interface Dictionary<T> {
  [Key: string]: T;
}

export function DateConverterSlashesToDashes(dataToConvert?: string): string {
  if (!dataToConvert) return '';

  return FormatDate(dataToConvert, '-');
}

export function DateConverterDashesToSlashes(dataToConvert?: string): string {
  if (!dataToConvert) return '';

  return FormatDate(dataToConvert, '/');
}

function FormatDate(dataToConvert: string, replaceCharacter: string) {
  const pattern = /\d{4}[\W]\d{2}[\W]\d{2}/g;
  console.log(dataToConvert.match(pattern));
  if (dataToConvert.length != 10 || !dataToConvert.match(pattern)) {
    return dataToConvert;
  }
  const regex = /\W/g;
  return dataToConvert.replace(regex, replaceCharacter);
}

export function DateTimeOffsetToDubaiTime(
  date?: string,
  time?: string,
  offset?: string,
): string | null {
  if (!date || !time || !offset) {
    return null;
  }
  const formattedDate = DateConverterSlashesToDashes(date);
  return new Date(`${formattedDate}T${time}${offset}`)
    .toLocaleString('en-AE', { timeZone: 'Asia/Dubai', hour12: false }) //https://www.localeplanet.com/java/en-AE/index.html
    .replace(',', '');
}

export function findPaymentModeAndAccountNo(
  codeToFind: string,
): { paymentMode: string; accountNo: string } | undefined {
  const returnValue = {
    paymentMode: '',
    accountNo: '',
  };
  for (const key in businessCodeAccountNoMapping) {
    const { businessCode, paymentMode, requestType, accountNo } =
      businessCodeAccountNoMapping[key];
    if (businessCode === codeToFind && requestType === 'DECLARATION') {
      returnValue.paymentMode = selectPaymentMode(paymentMode);
      returnValue.accountNo = accountNo;
      return returnValue;
    }
  }
  return returnValue;
}

function selectPaymentMode(mode: string) {
  if (mode === 'CA') return '1';
  return mode === 'SG' ? '2' : '';
}

export function selectMany<TIn, TOut>(
  input: TIn[],
  selectListFn: (t: TIn) => TOut[],
): TOut[] {
  //convience method like C#/dotnet select many
  return input.reduce((out, inx) => {
    out.push(...selectListFn(inx));
    return out;
  }, new Array<TOut>());
}

export function parseGMTOffset(gmtOffset: string): string | null {
  const numsInOffset = gmtOffset.replace(/[^+\d-:]/g, '');

  if (!numsInOffset || numsInOffset.length > 6) {
    return null;
  } else if (gmtOffset.length === 2) {
    return gmtOffset[0] + '0' + gmtOffset[1] + ':00';
  } else if (gmtOffset.length === 3) {
    return gmtOffset + ':00';
  } else if (gmtOffset.length === 4) {
    return gmtOffset[0] + '0' + gmtOffset.substring(1);
  } else {
    return gmtOffset;
  }
}

export function getGMTOffset(dateTimeString: string): string | undefined {
  return (dateTimeString.match(/z$|[+-]\d\d:\d\d$/i) || [])[0];
}
