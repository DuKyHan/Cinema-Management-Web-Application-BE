
import { Role } from 'src/auth/constants';
import { AccountAccessTokenClaims } from 'src/auth/dtos';

export class RequestContext {
  public requestId: string;

  public url: string;

  public ip: string;

  public account: AccountAccessTokenClaims;

  get isUser() {
    return this.account.roles.includes(Role.User);
  }

  get isModerator() {
    return this.account.roles.includes(Role.Moderator);
  }

  get isAdmin() {
    return this.account.roles.includes(Role.Admin);
  }
}
