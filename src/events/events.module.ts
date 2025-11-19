import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventLog } from './event-log.entity';
import { EventsService } from './events.service';

@Module({
  imports: [TypeOrmModule.forFeature([EventLog])],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
