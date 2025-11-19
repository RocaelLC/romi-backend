import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
  Param,
  Patch,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  async list(@Req() req: any, @Query('onlyUnread') onlyUnread?: string) {
    const userId = req.user.sub;
    const only = onlyUnread === 'true';
    return this.service.listForUser(userId, only);
  }
  
  @Patch(':id/read')
  async markRead(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.sub;
    return this.service.markAsRead(userId, id);
  }
}
