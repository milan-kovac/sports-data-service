import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PublisherService } from 'src/redis/publisher.service';
import { CreateGenericResponse } from 'src/shared/responses/create.response';
import { ProcessToggleResponseDto } from './dtos/process.toggle.response.dto';

@ApiTags('Process')
@Controller('process')
export class ProcessController {
  constructor(private readonly publisherService: PublisherService) {}

  @ApiOperation({
    summary: 'Toggle process.',
  })
  @ApiResponse({ type: ProcessToggleResponseDto })
  @Post('toggle')
  async toggle(): Promise<ProcessToggleResponseDto> {
    await this.publisherService.publish('toggle-events', 'Process started');
    return CreateGenericResponse(true);
  }
}
