import { Client } from '@app/database';
import {
  Body, ConflictException, Controller, Delete, Get, NotFoundException,
  Param, ParseUUIDPipe, Patch, Post, Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger/dist';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreateClientDto, UpdateClientDto } from './clients.dto';

@ApiTags('clients')
@Controller('clients')
export class ClientsController {
  constructor(@InjectRepository(Client) private repo: Repository<Client>) {}

  @Get()
  async findAll(@Query('q') q?: string) {
    const where = q
      ? ['firstName', 'lastName', 'email', 'phone'].map((f) => ({ [f]: ILike(`%${q}%`) }))
      : undefined;
    const [data, count] = await this.repo.findAndCount({
      where,
      relations: { pets: true },
      order: { lastName: 'ASC', firstName: 'ASC' },
      take: 200,
    });
    return { data, count };
  }

  @Get(':uuid')
  async findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
    const client = await this.repo.findOne({ where: { uuid }, relations: { pets: true } });
    if (!client) throw new NotFoundException();
    return client;
  }

  @Post()
  async create(@Body() dto: CreateClientDto) {
    if (await this.repo.findOneBy({ email: dto.email })) {
      throw new ConflictException('A client with this email already exists');
    }
    return this.repo.save(this.repo.create(dto));
  }

  @Patch(':uuid')
  async update(@Param('uuid', ParseUUIDPipe) uuid: string, @Body() dto: UpdateClientDto) {
    const client = await this.repo.findOneBy({ uuid });
    if (!client) throw new NotFoundException();
    return this.repo.save(this.repo.merge(client, dto));
  }

  @Delete(':uuid')
  async remove(@Param('uuid', ParseUUIDPipe) uuid: string) {
    await this.repo.softDelete(uuid);
    return { deleted: true };
  }
}
