
export type CanalOrigem = 'TRAFEGO_PAGO' | 'CALLIX' | 'INDICACAO';
export type TipoServico = 'REVISAO' | 'HABILITACAO';

export interface MetricasDiarias {
  leads_recebidos: number;
  leads_desqualificados: number;
  reunioes_agendadas: number;
  reunioes_realizadas: number;
  no_show: number;
  contratos_mes_atual: number;
  contratos_meses_anteriores: number;
}

export interface RegistroPerformance {
  data_registro: Date;
  colaboradora_id: string; // Ex: 'GISELLE', 'SHEILA'
  canal: CanalOrigem;
  servico: TipoServico;
  metricas: MetricasDiarias;
}