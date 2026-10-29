import { Appointment, Client, Pet } from '@app/database';
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger/dist';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, MoreThanOrEqual, Repository } from 'typeorm';

const iso = (d: Date) => d.toISOString().slice(0, 10);

@ApiTags('stats')
@Controller('stats')
export class StatsController {
  constructor(
    @InjectRepository(Client) private clients: Repository<Client>,
    @InjectRepository(Pet) private pets: Repository<Pet>,
    @InjectRepository(Appointment) private appts: Repository<Appointment>,
  ) {}

  @Get()
  async get() {
    const today = new Date();
    const week = new Date(Date.now() + 7 * 86400000);
    const [clients, pets, todayCount, upcoming] = await Promise.all([
      this.clients.count(),
      this.pets.count(),
      this.appts.count({ where: { scheduleAt: new Date(iso(today)) } }),
      this.appts.find({
        where: { scheduleAt: Between(new Date(iso(today)), new Date(iso(week))) },
        relations: { pet: { client: true }, user: true },
        order: { scheduleAt: 'ASC', scheduleTime: 'ASC' },
        take: 10,
      }),
    ]);
    const total = await this.appts.count({ where: { scheduleAt: MoreThanOrEqual(new Date(iso(today))) } });
    return { clients, pets, appointmentsToday: todayCount, appointmentsUpcoming: total, upcoming };
  }
}
