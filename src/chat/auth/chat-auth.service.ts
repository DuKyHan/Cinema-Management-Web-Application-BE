
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ChatGroupService } from '../services';
import { AbstractService } from 'src/common/services';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';

@Injectable()
export class ChatAuthService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly chatGroupService: ChatGroupService,
  ) {
    super(logger);
  }

  async validateIsChatGroupOwner(context: RequestContext, chatId: number) {
    const res = await this.chatGroupService.getChatGroupOrThrow(
      context,
      chatId,
    );
    if (res.ownerId !== context.account.id) {
      throw new ForbiddenException();
    }
    return res;
  }
}
