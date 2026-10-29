import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { TransacoesController } from '../src/transacoes/transacoes.controller';
import { TransacoesService } from '../src/transacoes/transacoes.service';
import { Transacao } from '../src/transacoes/schemas/transacao.schema';
import { CriarTransacaoDto } from '../src/transacoes/dto/criar-transacao.dto';

describe('Transacoes', () => {
  let app: INestApplication;
  const registros: CriarTransacaoDto[] = [];

  class ModeloTeste {
    constructor(private readonly dados: CriarTransacaoDto) {}

    async save() {
      registros.push(this.dados);
      return this.dados;
    }

    static find() {
      return { sort: () => ({ lean: () => ({ exec: async () => [...registros].reverse() }) }) };
    }
  }

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({
      controllers: [TransacoesController],
      providers: [
        TransacoesService,
        { provide: getModelToken(Transacao.name), useValue: ModeloTeste }
      ]
    }).compile();
    app = modulo.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('cadastra transacoes e calcula as metricas', async () => {
    await request(app.getHttpServer()).post('/transacoes').send({
      descricao: 'Salario', valor: 1000, tipo: 'receita', categoria: 'Trabalho', consumoConsciente: true
    }).expect(201);
    await request(app.getHttpServer()).post('/transacoes').send({
      descricao: 'Aluguel', valor: 250, tipo: 'despesa', categoria: 'Moradia', consumoConsciente: true
    }).expect(201);
    await request(app.getHttpServer()).post('/transacoes').send({
      descricao: 'Delivery', valor: 50, tipo: 'despesa', categoria: 'Alimentacao', consumoConsciente: false
    }).expect(201);
    const resposta = await request(app.getHttpServer()).get('/transacoes').expect(200);
    expect(resposta.body.historico).toHaveLength(3);
    expect(resposta.body.metricas).toEqual({ saldoTotal: 700, totalDespesas: 300, totalGastoImpulso: 50 });
  });

  it('rejeita tipo de transacao invalido', async () => {
    await request(app.getHttpServer()).post('/transacoes').send({
      descricao: 'Teste', valor: 20, tipo: 'outro', categoria: 'Outros', consumoConsciente: false
    }).expect(400);
  });
});
