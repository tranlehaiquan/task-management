import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  @MessagePattern('health-check')
  healthCheck(): string {
    return 'health-check: auth-service is running';
  }
}
