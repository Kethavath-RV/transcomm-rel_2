import { findCountryCode } from "./countryMapper";

describe('find 2 letter country code', () => {
  it('find KM value correctly', () => {
    const code = "YVA";
    const expected = "KM";
    const result = findCountryCode(code);

    expect(result).toBe(expected);
  })

  it("shouldn't find a country code", () => {
    const code = "AAA";
    const expected = "";
    const result = findCountryCode(code);

    expect(result).toBe(expected);
  })

  it("find FR value", () => {
    const code = "SXB";
    const expected = "FR";
    const result = findCountryCode(code);

    expect(result).toBe(expected);
  })

  it("shouldn't find a country code", () => {
    const code = null;
    const expected = "";
    const result = findCountryCode(code);

    expect(result).toBe(expected);
  })

  it("shouldn't find a country code", () => {
    const code = "";
    const expected = "";
    const result = findCountryCode(code);

    expect(result).toBe(expected);
  })
})