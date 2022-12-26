import { RefreshDto } from 'core/viewModels';

export const mockRefreshTokenSuccess: RefreshDto = {
  message: 'refresh token',
  expires: new Date(),
};
export const mockRefreshTokenFail: RefreshDto = {
  refreshFailed: true,
};
