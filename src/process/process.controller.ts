import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateGenericResponse } from 'src/shared/responses/create.response';
import { ProcessToggleResponseDto } from './dtos/process.toggle.response.dto';
import { ProcessService } from './process.service';

@ApiTags('Process')
@Controller('process')
export class ProcessController {
  constructor(private readonly processService: ProcessService) {}

  @ApiOperation({
    summary: 'Toggle process.',
  })
  @ApiResponse({ type: ProcessToggleResponseDto })
  @Post('toggle')
  toggle(): ProcessToggleResponseDto {
    this.processService.toggleProcess();
    return CreateGenericResponse(true);
  }
}
