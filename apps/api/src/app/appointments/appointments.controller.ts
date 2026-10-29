import { Appointment, Pet, User } from '@app/database';
import {
  BadRequestException, Body, Controller, Delete, Get, NotFoundException,
  Param, ParseIntPipe, Patch, Post, Query, Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger/dist';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { CreateAppointmentDto, UpdateAppointmentDto } from './appointments.dto';

@ApiTags('appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(
    @InjectRepository(Appointment) private repo: Repository<Appointment>,
    @InjectRepository(Pet) private pets: Repository<Pet>,
    @InjectRepository(User) private users: Repository<User>,
  ) {}

  @Get()
  async findAll(@Query('from') from?: string, @Query('to') to?: string, @Query('pet') pet?: string) {
    const where: FindOptionsWhere<Appointment> = {};
    if (from && to) where.scheduleAt = Between(new Date(from), new Date(to));
    else if (from) where.scheduleAt = MoreThanOrEqual(new Date(from));
    else if (to) where.scheduleAt = LessThanOrEqual(new Date(to));
    if (pet) where.pet = { uuid: pet };
    const [data, count] = await this.repo.findAndCount({
      where,
      relations: { pet: { client: true }, user: true },
      order: { scheduleAt: 'ASC', scheduleTime: 'ASC' },
      take: 300,
    });
    return { data, count };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const appt = await this.repo.findOne({ where: { id }, relations: { pet: { client: true }, user: true } });
    if (!appt) throw new NotFoundException();
    return appt;
  }

  private async pet(uuid: string) {
    const pet = await this.pets.findOneBy({ uuid });
    if (!pet) throw new BadRequestException('Unknown pet');
    return pet;
  }

  private async vet(uuid: string) {
    const user = await this.users.findOneBy({ uuid });
    if (!user) throw new BadRequestException('Unknown user');
    return user;
  }

  @Post()
  async create(@Body() dto: CreateAppointmentDto, @Req() req: { user: { sub: string } }) {
    const { petUuid, userUuid, ...rest } = dto;
    const saved = await this.repo.save(
      this.repo.create({
        ...rest,
        scheduleAt: rest.scheduleAt as unknown as Date,
        pet: await this.pet(petUuid),
        user: await this.vet(userUuid || req.user.sub),
      }),
    );
    return this.findOne(saved.id);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAppointmentDto) {
    const appt = await this.repo.findOneBy({ id });
    if (!appt) throw new NotFoundException();
    const { petUuid, userUuid, ...rest } = dto;
    this.repo.merge(appt, { ...rest, scheduleAt: rest.scheduleAt as unknown as Date });
    if (petUuid) appt.pet = await this.pet(petUuid);
    if (userUuid) appt.user = await this.vet(userUuid);
    await this.repo.save(appt);
    return this.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.repo.softDelete(id);
    return { deleted: true };
  }
}
