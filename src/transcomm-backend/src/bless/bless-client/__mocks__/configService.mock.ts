import { ConfigService } from "@nestjs/config";
import Mock from "jest-mock-extended/lib/Mock";

export function mockConfig(): ConfigService {
  const baseConfig = Mock<ConfigService>();
  jest.spyOn(baseConfig, 'get').mockImplementation((key: string) => {
    return "Example";
  });
  return baseConfig;
}