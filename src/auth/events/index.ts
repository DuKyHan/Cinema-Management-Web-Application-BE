import { AccountOutputDto } from "src/account/dtos";
import { AbstractEvent } from "src/common/events";
import { RequestContext } from "src/common/request-context";


export class AccountRegisteredEvent extends AbstractEvent {
  static eventName = 'account.registered';

  constructor(
    context: RequestContext,
    public readonly account: AccountOutputDto,
  ) {
    super(context);
  }
}
