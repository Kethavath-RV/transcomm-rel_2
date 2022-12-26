import { ConfigService } from "@nestjs/config";
import Mock from "jest-mock-extended/lib/Mock";

export function mockConfig(): ConfigService {
  const baseConfig = Mock<ConfigService>();
  jest.spyOn(baseConfig, 'get').mockImplementation((key: string) => {
    switch (key) {
      case 'HL_QUEUE_RETRY_ATTEMPTS':
        return 5;
      case "HL_QUEUE_RETRY_DELAY":
        return 2000
    }
    return null;
  });
  return baseConfig;
}