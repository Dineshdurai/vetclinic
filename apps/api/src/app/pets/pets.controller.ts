import { Client, Pet } from '@app/database';
import {
  BadRequestException, Body, Controller, Delete, Get, NotFoundException,
  Param, ParseUUIDPipe, Patch, Post, Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger/dist';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreatePetDto, UpdatePetDto } from './pets.dto';

@ApiTags('pets')
@Controller('pets')
export class PetsController {
  constructor(
    @InjectRepository(Pet) private repo: Repository<Pet>,
    @InjectRepository(Client) private clients: Repository<Client>,
  ) {}

  @Get()
  async findAll(@Query('q') q?: string, @Query('client') client?: string) {
    const base = client ? { client: { uuid: client } } : {};
    const where = q
      ? [{ ...base, name: ILike(`%${q}%`) }, { ...base, race: ILike(`%${q}%`) }]
      : base;
    const [data, count] = await this.repo.findAndCount({
      where,
      relations: { client: true },
      order: { name: 'ASC' },
      take: 200,
    });
    return { data, count };
  }

  @Get(':uuid')
  async findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
    const pet = await this.repo.findOne({
      where: { uuid },
      relations: { client: true, appointments: true },
      order: { appointments: { scheduleAt: 'DESC' } },
    });
    if (!pet) throw new NotFoundException();
    return pet;
  }

  private async client(uuid: string) {
    const client = await this.clients.findOneBy({ uuid });
    if (!client) throw new BadRequestException('Unknown client');
    return client;
  }

  @Post()
  async create(@Body() dto: CreatePetDto) {
    const { clientUuid, ...rest } = dto;
    return this.repo.save(
      this.repo.create({ ...rest, birht: rest.birht as unknown as Date, client: await this.client(clientUuid) }),
    );
  }

  @Patch(':uuid')
  async update(@Param('uuid', ParseUUIDPipe) uuid: string, @Body() dto: UpdatePetDto) {
    const pet = await this.repo.findOneBy({ uuid });
    if (!pet) throw new NotFoundException();
    const { clientUuid, ...rest } = dto;
    this.repo.merge(pet, { ...rest, birht: rest.birht as unknown as Date });
    if (clientUuid) pet.client = await this.client(clientUuid);
    return this.repo.save(pet);
  }

  @Delete(':uuid')
  async remove(@Param('uuid', ParseUUIDPipe) uuid: string) {
    await this.repo.softDelete(uuid);
    return { deleted: true };
  }
}
