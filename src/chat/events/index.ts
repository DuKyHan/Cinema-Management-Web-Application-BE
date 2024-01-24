
import { AbstractEvent } from 'src/common/events';
import {
  ChatMessageOutputDto,
  ChatOutputDto,
  ChatParticipantOutputDto,
} from '../dtos';

export class ChatCreatedEvent extends AbstractEvent {
  static readonly eventName = 'chat.created';

  constructor(
    context,
    public readonly chat: ChatOutputDto,
  ) {
    super(context);
  }
}

export class ChatUpdatedEvent extends AbstractEvent {
  static readonly eventName = 'chat.updated';

  constructor(
    context,
    public readonly chat: ChatOutputDto,
  ) {
    super(context);
  }
}

export class ChatDeletedEvent extends AbstractEvent {
  static readonly eventName = 'chat.deleted';

  constructor(
    context,
    public readonly chat: ChatOutputDto,
  ) {
    super(context);
  }
}

export class ChatMessageSentEvent extends AbstractEvent {
  static readonly eventName = 'chat.message.sent';

  constructor(
    context,
    public readonly chat: ChatOutputDto,
    public readonly message: ChatMessageOutputDto,
  ) {
    super(context);
  }
}

export class ChatBlockedEvent extends AbstractEvent {
  static readonly eventName = 'chat.blocked';

  readonly chat: ChatOutputDto;

  constructor(context, chat: ChatOutputDto) {
    super(context);
    this.chat = chat;
  }
}

export class ChatUnblockedEvent extends AbstractEvent {
  static readonly eventName = 'chat.unblocked';

  readonly chat: ChatOutputDto;

  constructor(context, chat: ChatOutputDto) {
    super(context);
    this.chat = chat;
  }
}

export class ChatReadEvent extends AbstractEvent {
  static readonly eventName = 'chat.read';

  readonly chat: ChatOutputDto;
  readonly chatParticipant: ChatParticipantOutputDto;

  constructor(
    context,
    chat: ChatOutputDto,
    chatParticipant: ChatParticipantOutputDto,
  ) {
    super(context);
    this.chat = chat;
    this.chatParticipant = chatParticipant;
  }
}

export class ChatParticipantLeftEvent extends AbstractEvent {
  static readonly eventName = 'chat.participant.left';

  readonly chat: ChatOutputDto;
  readonly chatParticipant: ChatParticipantOutputDto;

  constructor(
    context,
    chat: ChatOutputDto,
    chatParticipant: ChatParticipantOutputDto,
  ) {
    super(context);
    this.chat = chat;
    this.chatParticipant = chatParticipant;
  }
}

export class ChatParticipantRemovedEvent extends AbstractEvent {
  static readonly eventName = 'chat.participant.removed';

  readonly chat: ChatOutputDto;
  readonly chatParticipant: ChatParticipantOutputDto;

  constructor(
    context,
    chat: ChatOutputDto,
    chatParticipant: ChatParticipantOutputDto,
  ) {
    super(context);
    this.chat = chat;
    this.chatParticipant = chatParticipant;
  }
}
