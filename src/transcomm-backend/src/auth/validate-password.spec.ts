import { UserRole } from 'core';
import { validatePassword } from './validate-password';

describe('Test validatePassword', () => {
  it('Password with lowercase, uppercase, numbers and length 8 should return true for the viewer role', () => {
    const correctPassword = 'aA9aaaaa';
    return expect(true).toEqual(
      validatePassword(correctPassword, UserRole.viewer),
    );
  });

  it('Password with lowercase, uppercase, numbers and length 3 should return false for the viewer role', () => {
    const incorrectPassword = 'aA9';
    return expect(false).toEqual(
      validatePassword(incorrectPassword, UserRole.viewer),
    );
  });

  it('Password with lowercase, uppercase, numbers and length 8 should return true for the editor role', () => {
    const correctPassword = 'aA9aaaaa';
    return expect(true).toEqual(
      validatePassword(correctPassword, UserRole.editor),
    );
  });

  it('Password with lowercase, uppercase, numbers and length 15 should return false for the admin role', () => {
    const incorrectPassword = 'aA9aaaaaaaaaaaa';
    return expect(false).toEqual(
      validatePassword(incorrectPassword, UserRole.admin),
    );
  });

  it('Password with lowercase, uppercase, numbers and length 16 should return true for the admin role', () => {
    const correctPassword = 'aA9aaaaaaaaaaaaa';
    return expect(true).toEqual(
      validatePassword(correctPassword, UserRole.admin),
    );
  });

  it('Password with lowercase, uppercase, special character and length 8 should return true for the viewer role', () => {
    const correctPassword = 'aA/aaaaa';
    return expect(true).toEqual(
      validatePassword(correctPassword, UserRole.viewer),
    );
  });

  it('Password with special character, uppercase, number and length 8 should return true for the viewer role', () => {
    const correctPassword = '\\B000000';
    return expect(true).toEqual(
      validatePassword(correctPassword, UserRole.viewer),
    );
  });

  it('Password with special character, lowercase, number and length 8 should return true for the viewer role', () => {
    const correctPassword = ']c111111';
    return expect(true).toEqual(
      validatePassword(correctPassword, UserRole.viewer),
    );
  });

  it('Password with only number, uppercase and length 8 should return false for the viewer role', () => {
    const incorrectPassword = '9AAAAAAA';
    return expect(false).toEqual(
      validatePassword(incorrectPassword, UserRole.viewer),
    );
  });

  it('Password with only number, lowercase and length 8 should return false for the viewer role', () => {
    const incorrectPassword = '4qqqqqqq';
    return expect(false).toEqual(
      validatePassword(incorrectPassword, UserRole.viewer),
    );
  });

  it('Password with only number and special character and length 8 should return false for the viewer role', () => {
    const incorrectPassword = '8\\888888';
    return expect(false).toEqual(
      validatePassword(incorrectPassword, UserRole.viewer),
    );
  });

  it('Password with only lowercase, uppercase and length 8 should return false for the viewer role', () => {
    const incorrectPassword = 'gHHHHHHH';
    return expect(false).toEqual(
      validatePassword(incorrectPassword, UserRole.viewer),
    );
  });

  it('Password with only lowercase and special character and length 8 should return false for the viewer role', () => {
    const incorrectPassword = 'o]]]]]]]';
    return expect(false).toEqual(
      validatePassword(incorrectPassword, UserRole.viewer),
    );
  });

  it('Password with only uppercase, special character and length 8 should return false for the viewer role', () => {
    const incorrectPassword = 'L&&&&&&&';
    return expect(false).toEqual(
      validatePassword(incorrectPassword, UserRole.viewer),
    );
  });

  it('Password with only lowercase and length 8 should return false for the viewer role', () => {
    const incorrectPassword = 'qqqqqqqq';
    return expect(false).toEqual(
      validatePassword(incorrectPassword, UserRole.viewer),
    );
  });

  it('Password with only uppercase and length 8 should return false for the viewer role', () => {
    const incorrectPassword = 'UUUUUUUU';
    return expect(false).toEqual(
      validatePassword(incorrectPassword, UserRole.viewer),
    );
  });

  it('Password with only numbers and length 8 should return false for the viewer role', () => {
    const incorrectPassword = '44444444';
    return expect(false).toEqual(
      validatePassword(incorrectPassword, UserRole.viewer),
    );
  });

  it('Password with only special characters and length 8 should return false for the viewer role', () => {
    const incorrectPassword = '^^^^^^^^';
    return expect(false).toEqual(
      validatePassword(incorrectPassword, UserRole.viewer),
    );
  });
});
