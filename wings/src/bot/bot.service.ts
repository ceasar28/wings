import { Injectable, Logger } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';

@Injectable()
export class BotService {
  private readonly bot: TelegramBot;
  private logger = new Logger(BotService.name);

  constructor() {}
}
