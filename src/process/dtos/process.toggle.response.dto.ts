import { ApiResponseProperty } from '@nestjs/swagger';
import { GenericResponse } from 'src/shared/responses/create.response';

export class ProcessToggleResponseDto extends GenericResponse {
  @ApiResponseProperty({
    type: Boolean,
  })
  data: boolean;
}
