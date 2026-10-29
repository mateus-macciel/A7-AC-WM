import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CriarTransacaoDto {
  @IsString()
  @IsNotEmpty()
  descricao!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  valor!: number;

  @IsIn(['receita', 'despesa'])
  tipo!: 'receita' | 'despesa';

  @IsString()
  @IsNotEmpty()
  categoria!: string;

  @IsBoolean()
  consumoConsciente!: boolean;
}
