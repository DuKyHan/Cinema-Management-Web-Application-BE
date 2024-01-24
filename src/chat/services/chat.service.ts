import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { AccountService } from 'src/account/services';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { requireNonNull } from 'src/common/utils';
import { NotificationService } from 'src/notification/services';
import { PrismaService } from 'src/prisma';
import { ProfileOutputDto, getProfileBasicSelect } from 'src/profile/dtos';
import { ProfileService } from 'src/profile/services';
import {
  ChatMessagesQueryDto,
  ChatParticipantQueryDto,
  ChatQueryDto,
  ChatQuerySort,
  ChatsQueryDto,
  CreateChatInputDto,
  CreateMessageInputDto,
  UpdateChatInputDto,
} from '../dtos';
import { ChatMessageOutputDto, ChatOutputDto } from '../dtos/chat.output.dto';
import {
  ChatBlockedEvent,
  ChatCreatedEvent,
  ChatMessageSentEvent,
  ChatReadEvent,
  ChatUnblockedEvent,
  ChatUpdatedEvent,
} from '../events';
import {
  CannotBlockGroupChatException,
  ChatIsBlockedException,
  ChatIsNotBlockedException,
  ChatNotFoundException,
  ChatParticipantNotFoundException,
} from '../exceptions';

@Injectable()
export class ChatService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly prisma: PrismaService,
    private readonly accountService: AccountService,
    private readonly profileService: ProfileService,
    private readonly eventEmitter: EventEmitter2,
    private readonly notificationService: NotificationService,
  ) {
    super(logger);
  }

  async getChats(context: RequestContext, query: ChatsQueryDto) {
    this.logCaller(context, this.getChats);

    const chats = await this.prisma.chat.findMany({
      where: this.getChatWhere(query, context.account.id),
      include: this.getChatInclude(query),
      orderBy: this.getChatOrderBy(query.sort),
      take: query.limit,
      skip: query.offset,
    });

    return Promise.all(chats.map((chat) => this.mapToDto(context, chat)));
  }

  async getChatById(context: RequestContext, id: number, query: ChatQueryDto) {
    this.logCaller(context, this.getChatById);

    const chat = await this.prisma.chat.findUnique({
      where: {
        id: id,
        ChatParticipant: {
          some: {
            accountId: context.account.id,
          },
        },
      },
      include: this.getChatInclude(query),
    });

    if (!chat) {
      return null;
    }

    return this.mapToDto(context, chat);
  }

  async getChatToAccountByAccountId(
    context: RequestContext,
    accountId: number,
    query: ChatQueryDto,
  ) {
    this.logCaller(context, this.getChatById);

    const chat = await this.prisma.chat.findFirst({
      where: {
        isGroup: false,
        ChatParticipant: {
          every: {
            accountId: {
              in: [context.account.id, accountId],
            },
          },
        },
      },
      include: this.getChatInclude(query),
    });

    if (!chat) {
      return null;
    }

    return this.mapToDto(context, chat);
  }

  getChatWhere(query: ChatsQueryDto, requesterId: number) {
    const where: Prisma.ChatWhereInput = {
      ChatParticipant: {
        some: {
          accountId: requesterId,
        },
      },
      OR: [
        {
          isGroup: false,
          // ChatMessage: {
          //   some: {},
          // },
        },
        {
          isGroup: true,
        },
      ],
    };

    if (query.name) {
      const whereName: Prisma.ChatWhereInput[] = [
        {
          name: {
            contains: query.name,
            mode: 'insensitive',
          },
        },
        {
          ChatParticipant: {
            some: {
              Account: {
                profile: {
                  OR: [
                    {
                      username: {
                        contains: query.name,
                        mode: 'insensitive',
                      },
                    },
                    {
                      firstName: {
                        contains: query.name,
                        mode: 'insensitive',
                      },
                    },
                    {
                      lastName: {
                        contains: query.name,
                        mode: 'insensitive',
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      ];
      where.AND = {
        OR: whereName,
      };
    }

    if (query.isBlocked) {
      where.isBlocked = query.isBlocked;
    }

    if (query.isGroup) {
      where.isGroup = query.isGroup;
    }

    if (query.hasMessage) {
      where.ChatMessage = {
        some: {},
      };
    }

    if (Object.keys(where).length === 0) {
      return undefined;
    }

    return where;
  }

  getChatInclude(extra?: { messageLimit?: number; messageOffset?: number }) {
    const include: Prisma.ChatInclude = {
      ChatParticipant: true,
    };

    include.ChatMessage = {
      orderBy: {
        createdAt: 'desc',
      },
      take: extra?.messageLimit ?? 1,
      skip: extra?.messageOffset,
    };

    if (Object.keys(include).length === 0) {
      return undefined;
    }

    return include;
  }

  getChatOrderBy(sort?: ChatQuerySort) {
    if (!sort) {
      return undefined;
    }
    const orderBy: Prisma.ChatOrderByWithAggregationInput = {};
    switch (sort) {
      case ChatQuerySort.CreatedAtAsc:
        orderBy.createdAt = 'asc';
        break;
      case ChatQuerySort.CreatedAtDesc:
        orderBy.createdAt = 'desc';
        break;
      case ChatQuerySort.UpdatedAtAsc:
        orderBy.updatedAt = 'asc';
        break;
      case ChatQuerySort.UpdatedAtDesc:
        orderBy.updatedAt = 'desc';
        break;
    }
    return orderBy;
  }

  async getChatParticipants(
    context: RequestContext,
    query: ChatParticipantQueryDto,
  ): Promise<ProfileOutputDto[]> {
    this.logCaller(context, this.getChatParticipants);

    const where: Prisma.ChatParticipantWhereInput = {
      Chat: {
        ChatParticipant: {
          some: {
            accountId: context.account.id,
          },
        },
      },
    };
    if (query.excludeId) {
      where.Account = {
        id: {
          notIn: query.excludeId,
        },
      };
    }
    if (query.search) {
      if (!where.Account) {
        where.Account = {};
      }
      where.Account.profile = {
        OR: [
          {
            username: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
          {
            firstName: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
          {
            lastName: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
        ],
      };
    }

    const participants = await this.prisma.chatParticipant.findMany({
      where: where,
      take: query.limit,
      skip: query.offset,
    });
    const accountIds = new Set(participants.map((p) => p.accountId));
    const profiles = await this.profileService.getProfiles(context, {
      ids: Array.from(accountIds),
      select: getProfileBasicSelect,
    });
    return profiles;
  }

  async getChatMessages(
    context: RequestContext,
    id: number,
    query: ChatMessagesQueryDto,
  ) {
    this.logCaller(context, this.getChatMessages);

    await this.getChatOrThrow(context, id);
    const messages = await this.prisma.chatMessage.findMany({
      where: {
        chatId: id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: query.limit,
      skip: query.offset,
    });

    return this.outputArray(ChatMessageOutputDto, messages);
  }

  async createChat(context: RequestContext, dto: CreateChatInputDto) {
    this.logCaller(context, this.createChat);

    if (dto.to === context.account.id) {
      throw new ChatParticipantNotFoundException();
    }

    const toAccount = await this.prisma.account.findUnique({
      where: {
        id: dto.to,
      },
    });

    if (!toAccount) {
      throw new ChatParticipantNotFoundException();
    }

    const exist = await this.getChatToAccountByAccountId(context, dto.to, {});
    if (exist) {
      return exist;
    }

    const chat = await this.prisma.chat.create({
      data: {
        isGroup: false,
        createdBy: context.account.id,
        ownerId: context.account.id,
        avatar: dto.avatar,
        ChatParticipant: {
          create: [
            {
              accountId: context.account.id,
            },
            {
              accountId: dto.to,
            },
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
      include: this.getChatInclude(),
    });

    const output = await this.mapToDto(context, chat);

    this.eventEmitter.emit(
      ChatCreatedEvent.eventName,
      new ChatCreatedEvent(context, output),
    );

    return output;
  }

  async updateChat(context: RequestContext, dto: UpdateChatInputDto) {
    this.logCaller(context, this.updateChat);

    const chat = await this.getChatOrThrow(context, dto.chatId);

    const res = await this.prisma.chat.update({
      where: {
        id: dto.chatId,
      },
      data: dto,
      include: this.getChatInclude(),
    });

    const output = await this.mapToDto(context, res);

    this.eventEmitter.emit(
      ChatUpdatedEvent.eventName,
      new ChatUpdatedEvent(context, output),
    );

    return output;
  }

  async sendChatMessage(context: RequestContext, dto: CreateMessageInputDto) {
    this.logCaller(context, this.sendChatMessage);

    let chat = await this.getChatOrThrow(context, dto.chatId);

    if (chat.isBlocked) {
      throw new ChatIsBlockedException();
    }

    const message = await this.prisma.$transaction(async (tx) => {
      const participant = chat.participants.find(
        (p) => p.id === context.account.id,
      );
      const message = await tx.chatMessage.create({
        data: {
          ...dto,
          chatId: dto.chatId,
          sender: participant!.participantId,
        },
      });
      const otherParticipants = chat.participants
        .filter((p) => p.id !== context.account.id)
        .map((p) => p.id);
      await tx.chatParticipant.updateMany({
        where: {
          chatId: dto.chatId,
          accountId: {
            in: otherParticipants,
          },
        },
        data: {
          read: false,
        },
      });
      const newChat = await tx.chat.update({
        where: {
          id: dto.chatId,
        },
        data: {
          updatedAt: new Date(),
        },
        include: this.getChatInclude(),
      });
      chat = await this.mapToDto(context, newChat);
      return message;
    });

    this.eventEmitter.emit(
      ChatMessageSentEvent.eventName,
      new ChatMessageSentEvent(context, chat, message),
    );

    // this.notificationService.sendNotifications(context, {
    //   accountIds: chat.participants.map((p) => p.id),
    //   type: NotificationType.Chat,
    //   chatId: chat.id,
    //   title:
    //     chat.name ??
    //     getProfileNameOrNull(
    //       requireNonNull(
    //         chat.participants.find((p) => p.id !== context.account.id),
    //       ),
    //     ) ??
    //     'Chat',
    //   description: message.message,
    //   pushOnly: true,
    // });

    return this.output(ChatMessageOutputDto, message);
  }

  async blockChat(context: RequestContext, id: number) {
    this.logCaller(context, this.blockChat);

    const chat = await this.getChatOrThrow(context, id);

    if (chat.isBlocked) {
      throw new ChatIsBlockedException();
    }

    if (chat.isGroup) {
      throw new CannotBlockGroupChatException();
    }

    const res = await this.prisma.chat.update({
      where: {
        id: id,
      },
      data: {
        isBlocked: true,
        blockedBy: context.account.id,
        blockedAt: new Date(),
      },
      include: this.getChatInclude(),
    });

    const output = await this.mapToDto(context, res);

    this.eventEmitter.emit(
      ChatBlockedEvent.eventName,
      new ChatBlockedEvent(context, output),
    );

    return output;
  }

  async unblockChat(context: RequestContext, id: number) {
    this.logCaller(context, this.unblockChat);

    const chat = await this.getChatOrThrow(context, id);

    if (!chat.isBlocked) {
      throw new ChatIsNotBlockedException();
    }

    const res = await this.prisma.chat.update({
      where: {
        id: id,
      },
      data: {
        isBlocked: false,
        blockedBy: null,
        blockedAt: null,
      },
      include: this.getChatInclude(),
    });

    const output = await this.mapToDto(context, res);

    this.eventEmitter.emit(
      ChatUnblockedEvent.eventName,
      new ChatUnblockedEvent(context, output),
    );

    return output;
  }

  async readChat(context: RequestContext, id: number) {
    this.logCaller(context, this.readChat);

    await this.getChatOrThrow(context, id);
    const chatParticipant = await this.prisma.chatParticipant.findFirst({
      where: {
        chatId: id,
        accountId: context.account.id,
      },
    });
    if (!chatParticipant) {
      throw new ChatParticipantNotFoundException();
    }

    await this.prisma.chatParticipant.update({
      where: {
        id: chatParticipant.id,
      },
      data: {
        read: true,
      },
    });

    const output = await this.getChatOrThrow(context, id);

    this.eventEmitter.emit(
      ChatReadEvent.eventName,
      new ChatReadEvent(
        context,
        output,
        requireNonNull(
          output.participants.find((p) => p.id === context.account.id),
        ),
      ),
    );

    return output;
  }

  async getChatOrThrow(
    context: RequestContext,
    id: number,
    options?: {
      validateIsParticipant?: boolean;
    },
  ) {
    this.logCaller(context, this.getChatOrThrow);

    const where: Prisma.ChatWhereUniqueInput = {
      id: id,
    };

    if (options?.validateIsParticipant != false) {
      where.ChatParticipant = {
        some: {
          accountId: context.account.id,
        },
      };
    }

    const chat = await this.prisma.chat.findUnique({
      where: where,
      include: this.getChatInclude(),
    });

    if (!chat) {
      throw new ChatNotFoundException();
    }

    return this.mapToDto(context, chat);
  }

  async countUnreadChats(context: RequestContext) {
    this.logCaller(context, this.countUnreadChats);

    const count = await this.prisma.chatParticipant.count({
      where: {
        accountId: context.account.id,
        read: false,
      },
    });

    return count;
  }

  async mapToDto(context: RequestContext, raw: any) {
    const participantIds = raw.ChatParticipant?.map((p) => p.id);
    const accountIds = raw.ChatParticipant?.map((p) => p.accountId);
    const profiles =
      participantIds == null
        ? undefined
        : await this.profileService.getProfiles(context, {
            ids: accountIds,
            select: getProfileBasicSelect,
          });
    const accounts = await this.accountService.getAccounts(context, accountIds);
    const participants = profiles?.map((p) => ({
      ...p,
      chatId: raw.id,
      participantId: raw.ChatParticipant?.find((cp) => cp.accountId === p.id)
        ?.id,
      read: raw.ChatParticipant?.find((cp) => cp.accountId === p.id)?.read,
      email: accounts?.find((a) => a.id === p.id)?.email,
    }));

    // const mayBeProfileName =
    //   profiles == null
    //     ? undefined
    //     : profiles.length > 2
    //     ? getProfileNames(profiles, { short: true, max: 3 })
    //     : getProfileName(profiles?.find((p) => p.id !== context.account.id));

    const output = {
      ...raw,
      name: raw.name,
      messages: raw.ChatMessage,
      latestMessage: raw.ChatMessage.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      )[0],
      participantIds: participantIds,
      participants: participants,
    };

    return this.output(ChatOutputDto, output);
  }
}
