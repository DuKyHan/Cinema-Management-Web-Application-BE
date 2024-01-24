import { BaseApiException } from "src/common/exceptions";


export class RoleNotFountException extends BaseApiException {
  constructor() {
    super({ message: 'Role not found', status: 404 });
  }
}
