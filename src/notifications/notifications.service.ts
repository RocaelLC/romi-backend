import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { Appointment } from '../appointments/appointment.entity';
import { AppointmentStatus, NotificationType } from '../common/enums';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { Between, Repository, FindOptionsWhere, IsNull } from 'typeorm';

interface NotifyPayload {
    title: string;
    body: string;
    type: NotificationType;
    appointmentId?: string;
}

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationsRepo: Repository<Notification>,
        @InjectRepository(Appointment)
        private readonly appointmentsRepo: Repository<Appointment>,
        private readonly realtimeGateway: RealtimeGateway,
    ) { }

   async notifyUser(userId: string, payload: NotifyPayload) {
  const notification = this.notificationsRepo.create({
    userId,
    ...payload,
  });
  const saved = await this.notificationsRepo.save(notification);

  try {
    this.realtimeGateway.emitNotification(userId, saved);
  } catch (err) {
    console.warn("[NotificationsService] Error emitiendo notificación realtime:", err);
  }

  return saved;
}
    async notifyAppointmentStatus(
        appointmentId: string,
        newStatus: AppointmentStatus,
    ) {
        const appointment = await this.appointmentsRepo.findOne({
            where: { id: appointmentId },
        });
        if (!appointment) return;

        const title = 'Estado de cita actualizado';

        const statusText =
            newStatus === AppointmentStatus.ACCEPTED
                ? 'aceptada'
                : newStatus === AppointmentStatus.REJECTED
                    ? 'rechazada'
                    : newStatus === AppointmentStatus.CANCELLED
                        ? 'cancelada'
                        : newStatus === AppointmentStatus.ATTENDED
                            ? 'atendida'
                            : 'actualizada';

        const dateText = appointment.scheduledAt
            ? appointment.scheduledAt.toLocaleString('es-MX', {
                dateStyle: 'short',
                timeStyle: 'short',
            })
            : '';

        const body = `La cita del ${dateText} ahora está en estado ${statusText}.`;

        await Promise.all([
            this.notifyUser(appointment.doctorId, {
                title,
                body,
                type: this.mapStatusToNotification(newStatus),
                appointmentId,
            }),
            this.notifyUser(appointment.patientId, {
                title,
                body,
                type: this.mapStatusToNotification(newStatus),
                appointmentId,
            }),
        ]);
    }

    async sendReminders(now: Date = new Date()) {
        const windows = [
            { label: '24 horas', hours: 24 },
            { label: '2 horas', hours: 2 },
        ];

        for (const window of windows) {
            const target = new Date(now.getTime() + window.hours * 60 * 60 * 1000);
            const from = new Date(target.getTime() - 5 * 60 * 1000);
            const to = new Date(target.getTime() + 5 * 60 * 1000);

            const appts = await this.appointmentsRepo.find({
                where: {
                    status: AppointmentStatus.ACCEPTED,
                    scheduledAt: Between(from, to),
                },
            });

            await Promise.all(
                appts.map((appt) =>
                    Promise.all([
                        this.notifyUser(appt.doctorId, {
                            title: 'Recordatorio de cita',
                            body: `Tu cita es en ${window.label}.`,
                            type: NotificationType.APPT_REMINDER,
                            appointmentId: appt.id,
                        }),
                        this.notifyUser(appt.patientId, {
                            title: 'Recordatorio de cita',
                            body: `Tu cita es en ${window.label}.`,
                            type: NotificationType.APPT_REMINDER,
                            appointmentId: appt.id,
                        }),
                    ]),
                ),
            );
        }
    }

    async listForUser(userId: string, onlyUnread = false) {
  const where: FindOptionsWhere<Notification> = { userId };

  if (onlyUnread) {
    where.readAt = IsNull(); // leer solo las no leídas
  }

  return this.notificationsRepo.find({
    where,
    order: { createdAt: 'DESC' },
  });
}


    async markAsRead(userId: string, notificationId: string) {
        const notification = await this.notificationsRepo.findOne({
            where: { id: notificationId, userId },
        });
        if (!notification) throw new NotFoundException('Notification not found');

        notification.readAt = new Date();
        await this.notificationsRepo.save(notification);
        return notification;
    }

    private mapStatusToNotification(status: AppointmentStatus): NotificationType {
        switch (status) {
            case AppointmentStatus.ACCEPTED:
                return NotificationType.APPT_ACCEPTED;
            case AppointmentStatus.REJECTED:
                return NotificationType.APPT_REJECTED;
            case AppointmentStatus.CANCELLED:
                return NotificationType.APPT_CANCELLED;
            case AppointmentStatus.ATTENDED:
                return NotificationType.APPT_ATTENDED;
            default:
                return NotificationType.APPT_CREATED;
        }
    }
}
