import { BaseApiException } from "src/common/exceptions";

export class ChatNotFoundException extends BaseApiException {
  constructor() {
    super({ message: 'No chat found', status: 404 });
  }
}

export class ChatIsBlockedException extends BaseApiException {
  constructor() {
    super({ message: 'Chat is blocked' });
  }
}

export class ChatIsNotBlockedException extends BaseApiException {
  constructor() {
    super({ message: 'Chat is not blocked' });
  }
}

export class HaveNotJoinedChatException extends BaseApiException {
  constructor() {
    super({ message: 'You have not joined this chat' });
  }
}

export class ChatParticipantNotFoundException extends BaseApiException {
  constructor() {
    super({ message: 'Chat participant not found', status: 404 });
  }
}

export class ChatParticipantAlreadyExistsException extends BaseApiException {
  constructor() {
    super({ message: 'Chat participant already exists' });
  }
}

export class CanNotRemoveChatOwnerException extends BaseApiException {
  constructor() {
    super({ message: 'Can not remove chat owner' });
  }
}

export class CannotBlockGroupChatException extends BaseApiException {
  constructor() {
    super({ message: 'Cannot block group chat' });
  }
}
