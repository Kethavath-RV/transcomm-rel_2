/**
 * The strings for the different event name
 * for the dubai Hyperledger contract events.
 */
export enum HyperledgerEventNames {
  declaration = 'DECLARATION_STATUS_CHANGE',
  claim = 'CLAIM_STATUS_CHANGE',
  chain = 'chainCodeEvent',
}

/**
 * Convenient method to validate if a given string matches its enum value.
 * Use in order to verify the event data is valid.
 *
 * @param input {string} value to check against enums
 * @returns outcome if the enum exists
 *
 */
export const HyperledgerEventExists: (string) => boolean = (input: string) =>
  Object.values(HyperledgerEventNames).includes(input as HyperledgerEventNames);
