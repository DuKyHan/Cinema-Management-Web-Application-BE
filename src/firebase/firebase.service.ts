
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { credential } from 'firebase-admin';
import { App, initializeApp } from 'firebase-admin/app';
import { Messaging, getMessaging } from 'firebase-admin/messaging';
import firebaseConfig from 'src/common/configs/subconfigs/firebase.config';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private _firebaseApp: App;
  public get firebaseApp(): App {
    return this._firebaseApp;
  }
  private _firebaseMessaging: Messaging;
  public get firebaseMessaging(): Messaging {
    return this._firebaseMessaging;
  }

  constructor(
    @Inject(firebaseConfig.KEY)
    private readonly firebaseConfigApi: ConfigType<typeof firebaseConfig>,
  ) {}

  async onModuleInit() {
    this._firebaseApp = initializeApp({
      credential: credential.cert({
        projectId: this.firebaseConfigApi.projectId,
        clientEmail: this.firebaseConfigApi.clientEmail,
        privateKey: this.firebaseConfigApi.privateKey,
      }),
      projectId: this.firebaseConfigApi.projectId,
    });
    this._firebaseMessaging = getMessaging(this._firebaseApp);
  }
}
