import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(private readonly notifications: NotificationsService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleReminderCron() {
    await this.notifications.sendReminders();
    this.logger.debug('Reminders executed');
  }
}
