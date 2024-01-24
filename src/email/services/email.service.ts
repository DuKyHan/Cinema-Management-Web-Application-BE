import { MailerService } from '@nestjs-modules/mailer';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import tokenConfig from 'src/common/configs/subconfigs/token.config';
import { AppLogger } from 'src/common/logger';
import { RequestContext } from 'src/common/request-context';
import { AbstractService } from 'src/common/services';
import { secondsToHoursMinutesSeconds } from 'src/common/utils';

@Injectable()
export class EmailService extends AbstractService {
  constructor(
    logger: AppLogger,
    private readonly mailerService: MailerService,
    @Inject(tokenConfig.KEY)
    private readonly tokenConfigApi: ConfigType<typeof tokenConfig>,
  ) {
    super(logger);
  }

  async sendEmailVerificationEmail(
    ctx: RequestContext,
    email: string,
    token: string,
  ) {
    this.logCaller(ctx, this.sendEmailVerificationEmail);
    const tokenLife = secondsToHoursMinutesSeconds(this.tokenConfigApi.lifeSec);
    try {
      const res = await this.mailerService.sendMail({
        to: email,
        subject: 'TheHelpers Account Email Verification - Action Required',
        text: `Please confirm your email address. Here is the code: ${token}. Note: The code will be expired after ${tokenLife}.`,
        template: 'email-verify-account',
        context: {
          token: token,
          tokenLife: tokenLife,
        },
      });
      this.logger.log(ctx, `successfully send email ${res.messageId}`);
    } catch (err) {
      this.logger.warn(ctx, `cannot send email: "${err}"`);
    }
  }

  async sendResetPasswordEmail(
    ctx: RequestContext,
    email: string,
    token: string,
  ) {
    this.logCaller(ctx, this.sendResetPasswordEmail);
    const tokenLife = secondsToHoursMinutesSeconds(this.tokenConfigApi.lifeSec);
    try {
      const res = await this.mailerService.sendMail({
        to: email,
        subject: 'TheHelpers Account Password Reset - Action Required',
        text: `Please confirm your password reset. Here is the code: ${token}. Note: The code will be expired after ${tokenLife}.`,
        template: 'email-reset-password',
        context: {
          token: token,
          tokenLife: tokenLife,
        },
      });
      ('Use the code below to reset your password. Note: The code will be expired after 15 minutes.');
      this.logger.log(ctx, `successfully send email ${res.messageId}`);
    } catch (err) {
      this.logger.warn(ctx, `cannot send email: "${err}"`);
    }
  }

  async sendTicketEmail(
    context: RequestContext,
    email: string,
    data: {
      ticketId: number;
      film: string;
      cinema: string;
      room: string;
      seat: string;
      foodAndBeverages: {
        name: string;
        quantity: number;
        price: number;
      }[];
      totalPrice: number;
    },
  ) {
    this.logCaller(context, this.sendTicketEmail);
    let foodAndBeveragesString = '';
    data.foodAndBeverages.forEach((item, index) => {
      foodAndBeveragesString += `${item.name} x${item.quantity} - ${item.price}`;
      if (index !== data.foodAndBeverages.length - 1) {
        foodAndBeveragesString += ', ';
      }
    });
    try {
      const res = await this.mailerService.sendMail({
        to: email,
        subject: 'TheHelpers Ticket Information',
        text: `You have successfully purchased a ticket for ${data.film} at ${data.cinema}. Here is your ticket information:`,
        template: 'ticket-purchase',
        context: {
          ...data,
          foodAndBeverages: foodAndBeveragesString,
        },
      });
      this.logger.log(context, `successfully send email ${res.messageId}`);
    } catch (err) {
      this.logger.warn(context, `cannot send email: "${err}"`);
    }
  }
}
