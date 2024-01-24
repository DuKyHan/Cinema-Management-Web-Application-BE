
import { Body, Controller, Delete, Post, Put } from '@nestjs/common';
import { ChatAuthService } from '../auth';
import {
  CreateChatGroupInputDto,
  CreateChatGroupParticipantInputDto,
  DeleteChatGroupInputDto,
  DeleteChatParticipantGroupInputDto,
  LeaveChatGroupInputDto,
  MakeParticipantChatGroupOwnerInputDto,
  UpdateChatGroupInputDto,
} from '../dtos';
import { ChatGroupService, ChatService } from '../services';
import { ReqContext, RequestContext } from 'src/common/request-context';

@Controller('chats/groups')
export class ChatGroupController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGroupService: ChatGroupService,
    private readonly chatAuthService: ChatAuthService,
  ) {}

  @Post()
  async createChatGroup(
    @ReqContext() context: RequestContext,
    @Body() dto: CreateChatGroupInputDto,
  ) {
    return this.chatGroupService.createChatGroup(context, dto);
  }

  @Put()
  async updateChatGroup(
    @ReqContext() context: RequestContext,
    @Body() dto: UpdateChatGroupInputDto,
  ) {
    const chat = await this.chatAuthService.validateIsChatGroupOwner(
      context,
      dto.chatId,
    );
    return this.chatGroupService.updateChatGroup(context, dto, {
      useChat: chat,
    });
  }

  @Delete()
  async deleteChatGroup(
    @ReqContext() context: RequestContext,
    @Body() dto: DeleteChatGroupInputDto,
  ) {
    const chat = await this.chatAuthService.validateIsChatGroupOwner(
      context,
      dto.chatId,
    );
    return this.chatGroupService.deleteChatGroup(context, dto.chatId, {
      useChat: chat,
    });
  }

  @Post('leave')
  async leaveChatGroup(
    @ReqContext() context: RequestContext,
    @Body() dto: LeaveChatGroupInputDto,
  ) {
    return this.chatGroupService.leaveChatGroup(context, dto);
  }

  @Post('participants')
  async createChatGroupParticipant(
    @ReqContext() context: RequestContext,
    @Body() dto: CreateChatGroupParticipantInputDto,
  ) {
    const chat = await this.chatAuthService.validateIsChatGroupOwner(
      context,
      dto.chatId,
    );
    return this.chatGroupService.addParticipantToChatGroup(context, dto, {
      useChat: chat,
    });
  }

  @Delete('participants')
  async deleteChatGroupParticipant(
    @ReqContext() context: RequestContext,
    @Body() dto: DeleteChatParticipantGroupInputDto,
  ) {
    const chat = await this.chatAuthService.validateIsChatGroupOwner(
      context,
      dto.chatId,
    );
    return this.chatGroupService.removeParticipantFromChatGroup(context, dto, {
      useChat: chat,
    });
  }

  @Post('make-owner')
  async makeParticipantChatGroupOwner(
    @ReqContext() context: RequestContext,
    @Body() dto: MakeParticipantChatGroupOwnerInputDto,
  ) {
    const chat = await this.chatAuthService.validateIsChatGroupOwner(
      context,
      dto.chatId,
    );
    return this.chatGroupService.makeParticipantChatGroupOwner(context, dto, {
      useChat: chat,
    });
  }
}
