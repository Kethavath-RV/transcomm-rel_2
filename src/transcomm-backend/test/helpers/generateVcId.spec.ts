import { generateVcId } from "helpers/generateVcId";

describe('vcId generation', () => {
    it('generates a correct vcId', () => {
      const exampleSenderId = "DC-TC";
      const exampleApplicationId = "DC-TC";
      const expected = "1c07e2f1e7d19c6dacf4ece1515c5f90709b6df5a13b008c8a352242848fb4e9"
      const result = generateVcId(exampleSenderId, exampleApplicationId);
      expect(result).toHaveLength(expected.length)
      expect(isNaN(parseInt(result, 16))).toEqual(false)
    });

    it('error on empty senderId', () => {
        const exampleSenderId = "";
        const exampleApplicationId = "DC-TC";
        expect(() => generateVcId(exampleSenderId, exampleApplicationId)).toThrowError();
      });
})