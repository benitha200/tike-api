import { ApiPropertyOptional } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';

/**
 * Data Transfer Object (DTO) for intercepting requests or responses.
 * This class is used to define the structure of data that can be optionally
 * included in certain operations.
 */
export class InterceptDto {
  /**
   * An optional unique identifier for the intercepted entity.
   * This can be used to track or reference the entity in operations.
   */
  @ApiPropertyOptional()
  id?: string;

  /**
   * An optional user object associated with the intercepted entity.
   * This can be used to provide additional context or metadata about the user.
   */
  @ApiPropertyOptional()
  user?: User;
}
