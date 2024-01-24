import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import { MailerModule } from '@nestjs-modules/mailer';
import { CommonModule } from 'src/common/common.module';
import emailConfig from 'src/common/configs/subconfigs/email.config';
import { rootProjectPath } from 'src/common/utils';
import { TokenModule } from 'src/token/token.module';
import { EmailListener, EmailService } from './services';

@Module({
  imports: [
    CommonModule,
    MailerModule.forRootAsync({
      inject: [emailConfig.KEY],
      useFactory: (emailConfigApi: ConfigType<typeof emailConfig>) => ({
        transport: {
          service: emailConfigApi.service,
          host: emailConfigApi.host,
          port: emailConfigApi.port,
          //secure: true,
          auth: {
            user: emailConfigApi.user,
            pass: emailConfigApi.password,
          },
        },
        defaults: {
          from: emailConfigApi.default.from,
        },
        template: {
          dir: `${rootProjectPath}/templates`,
          adapter: new EjsAdapter(),
          options: {
            strict: false,
          },
        },
      }),
    }),
    TokenModule,
  ],
  providers: [EmailService, EmailListener],
  exports: [EmailService],
})
export class EmailModule {}
