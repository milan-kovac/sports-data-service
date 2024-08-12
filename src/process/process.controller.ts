import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateGenericResponse } from 'src/shared/responses/create.response';
import { ProcessToggleResponseDto } from './dtos/process.toggle.response.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@ApiTags('Process')
@Controller('process')
export class ProcessController {
  constructor(@InjectQueue('process') private readonly processQueue: Queue) {}

  @ApiOperation({
    summary: 'Toggle process.',
  })
  @ApiResponse({ type: ProcessToggleResponseDto })
  @Post('toggle')
  toggle(): ProcessToggleResponseDto {
    this.processQueue.add('toggleProcess', null);
    return CreateGenericResponse(true);
  }
}
