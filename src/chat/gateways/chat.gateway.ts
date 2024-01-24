import {
  ParseIntPipe,
  UnauthorizedException,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { TokenExpiredError } from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { LoginSessionExpiredException } from 'src/auth/exceptions';
import { WsAuthGuard } from 'src/auth/guards/jwt-auth-ws.guard';
import { AllExceptionsFilter, toErrorObject } from 'src/common/filters';
import {
  LoggingInterceptor,
  RequestIdInterceptor,
  ResponseInterceptor,
} from 'src/common/interceptors';
import { AppLogger } from 'src/common/logger';
import { VALIDATION_PIPE_OPTIONS } from 'src/common/pipes';
import { ReqContext, RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { ChatAuthService } from '../auth';
import {
  CreateChatGroupInputDto,
  CreateChatInputDto,
  CreateMessageInputDto,
  DeleteChatGroupInputDto,
  LeaveChatGroupInputDto,
  UpdateChatInputDto,
} from '../dtos';
import {
  ChatBlockedEvent,
  ChatCreatedEvent,
  ChatDeletedEvent,
  ChatMessageSentEvent,
  ChatParticipantLeftEvent,
  ChatParticipantRemovedEvent,
  ChatReadEvent,
  ChatUnblockedEvent,
  ChatUpdatedEvent,
} from '../events';
import { HaveNotJoinedChatException } from '../exceptions';
import { ChatGroupService, ChatService } from '../services';

@WebSocketGateway(undefined, {
  namespace: 'chat',
  cors: {
    origin: '*',
  },
})
@UseInterceptors(RequestIdInterceptor, LoggingInterceptor, ResponseInterceptor)
@UseFilters(AllExceptionsFilter)
@UseGuards(WsAuthGuard)
@UsePipes(new ValidationPipe(VALIDATION_PIPE_OPTIONS))
export class ChatGateway
  extends AbstractService
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    logger: AppLogger,
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
    private readonly chatGroupService: ChatGroupService,
    private readonly chatAuthService: ChatAuthService,
  ) {
    super(logger);
  }

  async handleConnection(client: Socket) {
    // Check the handshake auth for the auth token
    let token = client.handshake.auth.token;
    // If the token is not in the handshake auth, check the headers
    if (token == null) {
      token = client.handshake.headers.authorization?.split(' ')?.[1];
    }
    if (!token) {
      client.emit(
        'error',
        toErrorObject(new UnauthorizedException('No auth token'), {
          hideInternalDetailError: false,
        }),
      );
      client.disconnect(true);
      return;
    }
    try {
      const payload = this.jwtService.verify(token);
      // Join the client to the chat room
      await client.join(`chat-${payload.sub}`);
      this.logger.log(
        null,
        `Client connected: ${client.id} with account id: ${payload.sub}`,
      );
    } catch (err) {
      if (
        err instanceof TokenExpiredError ||
        err.name === 'TokenExpiredError'
      ) {
        client.emit('error', {
          ...toErrorObject(new LoginSessionExpiredException(), {
            hideInternalDetailError: false,
          }),
        });
      } else {
        client.emit('error', toErrorObject(err));
      }
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(null, `Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-chat')
  async joinChat(
    @ReqContext() context: RequestContext,
    @ConnectedSocket() client: Socket,
  ) {
    const accountId = context.account.id;
    await client.join(`chat-${accountId}`);
    this.logger.log(context, `Client ${client.id} joined chat ${accountId}`);
  }

  @SubscribeMessage('leave-chat')
  async leaveChat(
    @ReqContext() context: RequestContext,
    @ConnectedSocket() client: Socket,
  ) {
    const accountId = context.account.id;
    if (!client.rooms.has(`chat-${accountId}`)) {
      throw new HaveNotJoinedChatException();
    }
    await client.leave(`chat-${accountId}`);
    this.logger.log(context, `Client ${client.id} left chat ${accountId}`);
  }

  @SubscribeMessage('create-chat')
  async createChat(
    @ReqContext() context: RequestContext,
    @MessageBody() data: CreateChatInputDto,
  ) {
    this.logCaller(context, this.createChat);
    const chat = await this.chatService.createChat(context, data);
    return chat;
  }

  @SubscribeMessage('create-chat-group')
  async createChatGroup(
    @ReqContext() context: RequestContext,
    @MessageBody() data: CreateChatGroupInputDto,
  ) {
    this.logCaller(context, this.createChat);
    const chat = await this.chatGroupService.createChatGroup(context, data);
    return chat;
  }

  @SubscribeMessage('update-chat')
  async updateChat(
    @ReqContext() context: RequestContext,
    @MessageBody() data: UpdateChatInputDto,
  ) {
    this.logCaller(context, this.updateChat);
    const chat = await this.chatService.updateChat(context, data);
    return chat;
  }

  @SubscribeMessage('send-message')
  async sendMessage(
    @ReqContext() context: RequestContext,
    @MessageBody() data: CreateMessageInputDto,
  ) {
    this.logCaller(context, this.sendMessage);
    const message = await this.chatService.sendChatMessage(context, data);
    return message;
  }

  @SubscribeMessage('block-chat')
  async blockChat(
    @ReqContext() context: RequestContext,
    @MessageBody(ParseIntPipe) data: number,
  ) {
    this.logCaller(context, this.sendMessage);
    const chat = await this.chatService.blockChat(context, data);
    return chat;
  }

  @SubscribeMessage('unblock-chat')
  async unblockChat(
    @ReqContext() context: RequestContext,
    @MessageBody(ParseIntPipe) data: number,
  ) {
    this.logCaller(context, this.sendMessage);
    const chat = await this.chatService.unblockChat(context, data);
    return chat;
  }

  @SubscribeMessage('read-chat')
  async readChat(
    @ReqContext() context: RequestContext,
    @MessageBody(ParseIntPipe) data: number,
  ) {
    this.logCaller(context, this.sendMessage);
    const chat = await this.chatService.readChat(context, data);
    return chat;
  }

  @SubscribeMessage('update-chat-group')
  async updateChatGroup(
    @ReqContext() context: RequestContext,
    @MessageBody() data: UpdateChatInputDto,
  ) {
    this.logCaller(context, this.updateChatGroup);

    const chat = await this.chatAuthService.validateIsChatGroupOwner(
      context,
      data.chatId,
    );

    return this.chatGroupService.updateChatGroup(context, data, {
      useChat: chat,
    });
  }

  @SubscribeMessage('leave-chat-group')
  async leaveChatGroup(
    @ReqContext() context: RequestContext,
    @MessageBody() data: LeaveChatGroupInputDto,
  ) {
    this.logCaller(context, this.leaveChatGroup);

    return this.chatGroupService.leaveChatGroup(context, data);
  }

  @SubscribeMessage('delete-chat-group')
  async deleteChatGroup(
    @ReqContext() context: RequestContext,
    @MessageBody() data: DeleteChatGroupInputDto,
  ) {
    this.logCaller(context, this.deleteChatGroup);
    const chat = await this.chatAuthService.validateIsChatGroupOwner(
      context,
      data.chatId,
    );
    return this.chatGroupService.deleteChatGroup(context, data.chatId, {
      useChat: chat,
    });
  }

  @OnEvent(ChatCreatedEvent.eventName)
  async onChatCreated(event: ChatCreatedEvent) {
    this.logCaller(event.context, this.onChatCreated);
    const rooms = event.chat.participants.map((p) => `chat-${p.id}`);
    this.server.sockets.to(rooms).emit('chat-created', event.chat);
  }

  @OnEvent(ChatUpdatedEvent.eventName)
  async onChatUpdated(event: ChatUpdatedEvent) {
    this.logCaller(event.context, this.onChatUpdated);

    const rooms = event.chat.participants.map((p) => `chat-${p.id}`);
    this.server.sockets.to(rooms).emit('chat-updated', event.chat);
  }

  @OnEvent(ChatDeletedEvent.eventName)
  async onChatDeleted(event: ChatDeletedEvent) {
    this.logCaller(event.context, this.onChatDeleted);

    const rooms = event.chat.participants.map((p) => `chat-${p.id}`);
    this.server.sockets.to(rooms).emit('chat-deleted', event.chat);
  }

  @OnEvent(ChatParticipantLeftEvent.eventName)
  async onChatParticipantLeft(event: ChatParticipantLeftEvent) {
    this.logCaller(event.context, this.onChatParticipantLeft);

    const rooms = event.chat.participants.map((p) => `chat-${p.id}`);
    rooms.push(`chat-${event.chatParticipant.id}`);
    this.server.sockets
      .to(rooms)
      .emit('chat-participant-left', event.chatParticipant);
    this.server.sockets.to(rooms).emit('chat-updated', event.chat);
  }

  @OnEvent(ChatParticipantRemovedEvent.eventName)
  async onChatParticipantRemoved(event: ChatParticipantRemovedEvent) {
    this.logCaller(event.context, this.onChatParticipantRemoved);

    const rooms = event.chat.participants.map((p) => `chat-${p.id}`);
    rooms.push(`chat-${event.chatParticipant.id}`);
    this.server.sockets
      .to(rooms)
      .emit('chat-participant-removed', event.chatParticipant);
    this.server.sockets.to(rooms).emit('chat-updated', event.chat);
  }

  @OnEvent(ChatMessageSentEvent.eventName)
  async onReceiveMessage(event: ChatMessageSentEvent) {
    this.logCaller(event.context, this.onReceiveMessage);
    const rooms = event.chat.participants.map((p) => `chat-${p.id}`);
    this.server.sockets.to(rooms).emit('receive-message', event.message);
    this.server.sockets.to(rooms).emit('chat-updated', event.chat);
  }

  @OnEvent(ChatBlockedEvent.eventName)
  async onChatBlocked(event: ChatBlockedEvent) {
    this.logCaller(event.context, this.onChatBlocked);
    const rooms = event.chat.participants.map((p) => `chat-${p.id}`);
    this.server.sockets.to(rooms).emit('chat-blocked', event.chat);
    this.server.sockets.to(rooms).emit('chat-updated', event.chat);
  }

  @OnEvent(ChatUnblockedEvent.eventName)
  async onChatUnblocked(event: ChatBlockedEvent) {
    this.logCaller(event.context, this.onChatUnblocked);
    const rooms = event.chat.participants.map((p) => `chat-${p.id}`);
    this.server.sockets.to(rooms).emit('chat-unblocked', event.chat);
    this.server.sockets.to(rooms).emit('chat-updated', event.chat);
  }

  @OnEvent(ChatReadEvent.eventName)
  async onChatRead(event: ChatReadEvent) {
    this.logCaller(event.context, this.onChatRead);
    const rooms = event.chat.participants.map((p) => `chat-${p.id}`);
    this.server.sockets.to(rooms).emit('chat-read', event.chat);
    this.server.sockets.to(rooms).emit('chat-updated', event.chat);
  }
}
