import { ConfigService } from '@nestjs/config';
import Mock from 'jest-mock-extended/lib/Mock';

export function mockConfig(): ConfigService {
  const baseConfig = Mock<ConfigService>();
  jest.spyOn(baseConfig, 'get').mockImplementation((key: string) => {
    if (key === 'DATAGEN_KAFKA_EXCEPTION_RECEIVERS') return 'DHL-EXP,LUXC_DXB';
    if (key === 'DATAGEN_KAFKA_RECEIVERS') return 'DHL-EXP';
    else return 'Example';
  });
  return baseConfig;
}
