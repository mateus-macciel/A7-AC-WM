import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CriarTransacaoDto } from './dto/criar-transacao.dto';
import { Transacao, TransacaoDocument } from './schemas/transacao.schema';

@Injectable()
export class TransacoesService {
  constructor(@InjectModel(Transacao.name) private readonly transacaoModel: Model<TransacaoDocument>) {}

  async cadastrar(dados: CriarTransacaoDto) {
    const transacao = new this.transacaoModel(dados);
    return transacao.save();
  }

  async listar() {
    const historico = await this.transacaoModel.find().sort({ _id: -1 }).lean().exec();
    let saldo = 0;
    let despesas = 0;
    let impulso = 0;

    for (const transacao of historico) {
      const centavos = Math.round(transacao.valor * 100);
      if (transacao.tipo === 'receita') {
        saldo += centavos;
      } else {
        saldo -= centavos;
        despesas += centavos;
        if (!transacao.consumoConsciente) impulso += centavos;
      }
    }

    return {
      historico,
      metricas: {
        saldoTotal: saldo / 100,
        totalDespesas: despesas / 100,
        totalGastoImpulso: impulso / 100
      }
    };
  }
}
