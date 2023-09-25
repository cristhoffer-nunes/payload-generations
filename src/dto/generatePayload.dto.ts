import { IsNotEmpty } from 'class-validator';

export class GeneratePayloadDTO {
  @IsNotEmpty()
  id: Array<string>;
}
