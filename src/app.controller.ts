import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  inicio() {
    return 'Hello World!';
  }
}
