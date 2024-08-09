import { Controller, Post } from '@nestjs/common';
import { ProcessService } from './process.service';

@Controller('process')
export class ProcessController {
  constructor(private readonly processService: ProcessService) {}

  @Post('toggle')
  async toggle() {
    console.log('toggle ');
    try {
      await this.processService.toggle();
      return true;
    } catch (e) {}
  }
}
