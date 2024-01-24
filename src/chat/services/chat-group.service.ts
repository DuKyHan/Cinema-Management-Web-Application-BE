
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ChatOutputDto,
  CreateChatGroupInputDto,
  CreateChatGroupParticipantInputDto,
  DeleteChatParticipantGroupInputDto,
  LeaveChatGroupInputDto,
  MakeParticipantChatGroupOwnerInputDto,
  UpdateChatGroupInputDto,
} from '../dtos';
import {
  ChatCreatedEvent,
  ChatDeletedEvent,
  ChatParticipantLeftEvent,
  ChatParticipantRemovedEvent,
  ChatUpdatedEvent,
} from '../events';
import {
  CanNotRemoveChatOwnerException,
  ChatNotFoundException,
  ChatParticipantAlreadyExistsException,
  ChatParticipantNotFoundException,
} from '../exceptions';
import { ChatService } from './chat.service';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { PrismaService } from 'src/prisma';

@Injectable()
export class ChatGroupService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly chatService: ChatService,
  ) {
    super(logger);
  }

  async createChatGroup(context: RequestContext, dto: CreateChatGroupInputDto) {
    this.logCaller(context, this.createChatGroup);

    const toAccounts = await this.prisma.account.findMany({
      where: {
        id: {
          in: dto.to,
        },
      },
    });

    if (toAccounts.length !== dto.to.length) {
      throw new ChatParticipantNotFoundException();
    }

    const chat = await this.prisma.chat.create({
      data: {
        isGroup: true,
        createdBy: context.account.id,
        ownerId: context.account.id,
        name: dto.name,
        avatar: dto.avatar,
        ChatParticipant: {
          create: [
            {
              accountId: context.account.id,
            },
            ...dto.to.map((to) => ({
              accountId: to,
            })),
          ],
        },
        // ChatMessage:
        //   dto.initialMessage == null
        //     ? undefined
        //     : {
        //         create: [
        //           {
        //             message: dto.initialMessage,
        //             sender: context.account.id,
        //           },
        //         ],
        //       },
      },
      include: this.chatService.getChatInclude(),
    });

    const output = await this.chatService.mapToDto(context, chat);

    this.eventEmitter.emit(
      ChatCreatedEvent.eventName,
      new ChatCreatedEvent(context, output),
    );

    return output;
  }

  async updateChatGroup(
    context: RequestContext,
    dto: UpdateChatGroupInputDto,
    options?: { useChat?: ChatOutputDto },
  ) {
    this.logCaller(context, this.updateChatGroup);

    const chat =
      options?.useChat ?? (await this.getChatGroupOrThrow(context, dto.chatId));

    const res = await this.prisma.chat.update({
      where: {
        id: dto.chatId,
      },
      data: {
        name: dto.name,
        avatar: dto.avatar,
      },
      include: this.chatService.getChatInclude(),
    });

    const output = await this.chatService.mapToDto(context, res);

    this.eventEmitter.emit(
      ChatUpdatedEvent.eventName,
      new ChatUpdatedEvent(context, output),
    );

    return output;
  }

  async deleteChatGroup(
    context: RequestContext,
    id: number,
    options?: { useChat?: ChatOutputDto },
  ) {
    this.logCaller(context, this.deleteChatGroup);

    const chat =
      options?.useChat ?? (await this.getChatGroupOrThrow(context, id));

    const res = await this.prisma.chat.delete({
      where: {
        id: id,
      },
      include: this.chatService.getChatInclude(),
    });

    const output = await this.chatService.mapToDto(context, res);

    this.eventEmitter.emit(
      ChatDeletedEvent.eventName,
      new ChatDeletedEvent(context, output),
    );

    return output;
  }

  async makeParticipantChatGroupOwner(
    context: RequestContext,
    dto: MakeParticipantChatGroupOwnerInputDto,
    options?: { useChat?: ChatOutputDto },
  ) {
    this.logCaller(context, this.makeParticipantChatGroupOwner);

    const chat =
      options?.useChat ?? (await this.getChatGroupOrThrow(context, dto.chatId));

    const chatParticipant = await this.prisma.chatParticipant.findFirst({
      where: {
        chatId: dto.chatId,
        accountId: dto.accountId,
      },
    });
    if (!chatParticipant) {
      throw new ChatParticipantNotFoundException();
    }

    await this.prisma.chat.update({
      where: {
        id: dto.chatId,
      },
      data: {
        ownerId: dto.accountId,
      },
    });

    const output = await this.getChatGroupOrThrow(context, chat.id);

    this.eventEmitter.emit(
      ChatUpdatedEvent.eventName,
      new ChatUpdatedEvent(context, output),
    );

    return output;
  }

  async addParticipantToChatGroup(
    context: RequestContext,
    dto: CreateChatGroupParticipantInputDto,
    options?: { useChat?: ChatOutputDto },
  ) {
    this.logCaller(context, this.addParticipantToChatGroup);

    const chat =
      options?.useChat ?? (await this.getChatGroupOrThrow(context, dto.chatId));

    const chatParticipants = await this.prisma.chatParticipant.findMany({
      where: {
        chatId: dto.chatId,
        accountId: {
          in: dto.accountIds,
        },
      },
    });
    if (chatParticipants.length > 0) {
      throw new ChatParticipantAlreadyExistsException();
    }

    await this.prisma.chatParticipant.createMany({
      data: dto.accountIds.map((accountId) => ({
        chatId: dto.chatId,
        accountId: accountId,
      })),
    });

    const output = await this.getChatGroupOrThrow(context, chat.id);

    this.eventEmitter.emit(
      ChatUpdatedEvent.eventName,
      new ChatUpdatedEvent(context, output),
    );

    return output;
  }

  async removeParticipantFromChatGroup(
    context: RequestContext,
    dto: DeleteChatParticipantGroupInputDto,
    options?: { useChat?: ChatOutputDto },
  ) {
    this.logCaller(context, this.removeParticipantFromChatGroup);

    const chat =
      options?.useChat ?? (await this.getChatGroupOrThrow(context, dto.chatId));

    if (chat.ownerId === dto.accountId) {
      throw new CanNotRemoveChatOwnerException();
    }

    const chatParticipant = chat.participants.find(
      (p) => p.id === dto.accountId,
    );
    if (!chatParticipant) {
      throw new ChatParticipantNotFoundException();
    }

    await this.prisma.chatParticipant.delete({
      where: {
        id: chatParticipant.participantId,
      },
    });

    const output = await this.getChatGroupOrThrow(context, chat.id);

    this.eventEmitter.emit(
      ChatParticipantRemovedEvent.eventName,
      new ChatParticipantRemovedEvent(context, output, chatParticipant),
    );

    return output;
  }

  async leaveChatGroup(context: RequestContext, dto: LeaveChatGroupInputDto) {
    this.logCaller(context, this.leaveChatGroup);

    const chat = await this.getChatGroupOrThrow(context, dto.chatId);

    const chatParticipantProfile = chat.participants.find(
      (p) => p.id === context.account.id,
    );

    if (!chatParticipantProfile) {
      throw new ChatParticipantNotFoundException();
    }

    if (chat.participantIds.length === 1) {
      return this.deleteChatGroup(context, dto.chatId, { useChat: chat });
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.chatParticipant.delete({
        where: {
          chatId: chat.id,
          id: chatParticipantProfile.participantId,
        },
      });

      if (chatParticipantProfile.id == chat.ownerId) {
        const newOwner = chat.participants.find(
          (p) => p.id !== chatParticipantProfile.id,
        );
        await tx.chat.update({
          where: {
            id: chat.id,
          },
          data: {
            ownerId: newOwner!.id,
          },
          include: this.chatService.getChatInclude(),
        });
      }
    });

    const output = await this.getChatGroupOrThrow(context, dto.chatId, {
      validateIsParticipant: false,
    });

    this.eventEmitter.emit(
      ChatParticipantLeftEvent.eventName,
      new ChatParticipantLeftEvent(context, output, chatParticipantProfile),
    );

    return output;
  }

  async getChatGroupOrThrow(
    context: RequestContext,
    id: number,
    options?: {
      validateIsParticipant?: boolean;
    },
  ) {
    const res = await this.chatService.getChatOrThrow(context, id, options);
    if (!res.isGroup) {
      throw new ChatNotFoundException();
    }
    return res;
  }
}
