import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('')
  home(): string {
    return 'Home Page';
  }

  @Get('health-check')
  healthCheck(): string {
    return 'healthy';
  }
}