import { RequestContext } from '../request-context';

export class AbstractEvent {
  constructor(public readonly context: RequestContext) {}
}
