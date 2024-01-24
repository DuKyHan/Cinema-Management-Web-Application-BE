import { Allow } from 'class-validator';
import { InjectRequestContextInterceptor } from '../interceptors';
import { StripRequestContextPipe } from '../pipes';
import { RequestContext } from '../request-context';

export class ContextAwareDto {
  /**
   * WARNING: Used only for validation layer.
   * - This field is inject by {@link InjectRequestContextInterceptor} for validation purpose only.
   * - DTO must use {@link StripRequestContextPipe} to remove context before passing to service layer. */
  @Allow()
  context?: RequestContext;
}
