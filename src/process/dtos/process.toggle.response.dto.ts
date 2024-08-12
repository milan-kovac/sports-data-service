import { ApiResponseProperty } from '@nestjs/swagger';
import { GenericResponse } from '../../shared/responses/create.response';

export class ProcessToggleResponseDto extends GenericResponse {
  @ApiResponseProperty({
    type: Boolean,
  })
  data: boolean;
}
