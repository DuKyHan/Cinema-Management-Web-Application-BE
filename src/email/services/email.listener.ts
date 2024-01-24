
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from './email.service';
import { AppLogger } from 'src/common/logger';
import { AbstractService } from 'src/common/services';
import { AccountRegisteredEvent } from 'src/auth/events';
import { TokenType } from 'src/token/constants';
import { TokenService } from 'src/token/services';

@Injectable()
export class EmailListener extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService,
  ) {
    super(logger);
  }

  @OnEvent(AccountRegisteredEvent.eventName, { async: true })
  async handleAccountRegisteredEvent(event: AccountRegisteredEvent) {
    const context = event.context;
    this.logCaller(context, this.handleAccountRegisteredEvent);
    
    const account = event.account; 
    console.log("ACCOUNT",account) 
    // Generate TOKEN
    const token = await this.tokenService.createToken(
      context,
      account.id,
      TokenType.EmailVerification,
    );

    // Send TOKEN to account email
    await this.emailService.sendEmailVerificationEmail(
      context,
      account.email,
      token,
    );
  }
}
