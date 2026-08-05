import type { GraduacaoNivel, GraduacaoAdultoNivel, GraduacaoKidsNivel } from '../dto/AlunoDTO';
import type { StatusPagamento } from '../dto/PagamentoDTO';

export const formatarCPF = (cpf: string): string => {
  const nums = cpf.replace(/\D/g, '');
  return nums.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatarTelefone = (tel: string): string => {
  const nums = tel.replace(/\D/g, '');
  if (nums.length === 11) return nums.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  return nums.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
};

export const formatarData = (data: string): string => {
  if (!data) return '';
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
};

export const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
};

export const calcularIdade = (dataNascimento: string): number => {
  const hoje = new Date();
  const nasc = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
};

export const validarCPF = (cpf: string): boolean => {
  const nums = cpf.replace(/\D/g, '');
  if (nums.length !== 11 || /^(\d)\1+$/.test(nums)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(nums[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(nums[9])) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(nums[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(nums[10]);
};

export const GRADUACAO_CORES: Record<GraduacaoNivel, { bg: string; text: string; border: string }> = {
  Branca:             { bg: 'bg-white/10',      text: 'text-white',     border: 'border-white/40' },
  Amarela:            { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/40' },
  'Amarela e branca': { bg: 'bg-yellow-200/20', text: 'text-yellow-600', border: 'border-yellow-500/40' },
  Laranja:            { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/40' },
  'Laranja e cinza':  { bg: 'bg-orange-200/20', text: 'text-orange-600', border: 'border-orange-500/40' },
  Cinza:              { bg: 'bg-slate-500/20',  text: 'text-slate-400',  border: 'border-slate-500/40' },
  'Cinza e branca':   { bg: 'bg-slate-200/20',  text: 'text-slate-500',  border: 'border-slate-500/40' },
  Verde:              { bg: 'bg-green-500/20',  text: 'text-green-400',  border: 'border-green-500/40' },
  'Verde e branca':   { bg: 'bg-green-200/20',  text: 'text-green-600',  border: 'border-green-500/40' },
  Azul:               { bg: 'bg-blue-500/20',   text: 'text-blue-400',   border: 'border-blue-500/40' },
  'Azul e branca':    { bg: 'bg-blue-200/20',   text: 'text-blue-600',   border: 'border-blue-500/40' },
  Marrom:             { bg: 'bg-amber-800/30',  text: 'text-amber-600',  border: 'border-amber-700/40' },
  'Marrom e branca':  { bg: 'bg-amber-200/20',  text: 'text-amber-700',  border: 'border-amber-700/40' },
  Vermelha:           { bg: 'bg-red-500/20',    text: 'text-red-400',    border: 'border-red-500/40' },
  'Vermelha e branca': { bg: 'bg-red-200/20',   text: 'text-red-600',    border: 'border-red-500/40' },
  Preta:              { bg: 'bg-white/5',       text: 'text-yellow-400', border: 'border-yellow-500/60' },
};

export const GRADUACAO_ORDEM_ADULTO: GraduacaoAdultoNivel[] = [
  'Branca',
  'Amarela',
  'Amarela e branca',
  'Verde',
  'Verde e branca',
  'Azul',
  'Azul e branca',
  'Marrom',
  'Marrom e branca',
  'Vermelha',
  'Vermelha e branca',
  'Preta',
];

export const GRADUACAO_ORDEM_KIDS: GraduacaoKidsNivel[] = [
  'Laranja',
  'Laranja e cinza',
  'Cinza',
  'Cinza e branca',
  'Branca',
];

export const GRADUACAO_ORDEM: GraduacaoNivel[] = [...GRADUACAO_ORDEM_ADULTO, ...GRADUACAO_ORDEM_KIDS];

export const STATUS_PAGAMENTO_CONFIG: Record<StatusPagamento, { label: string; bg: string; text: string }> = {
  PAGO:     { label: 'Pago',     bg: 'bg-green-500/20',  text: 'text-green-400' },
  PENDENTE: { label: 'Pendente', bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  VENCIDO:  { label: 'Vencido',  bg: 'bg-red-500/20',    text: 'text-red-400' },
};

export const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

export const gerarId = (): string => Math.random().toString(36).substring(2, 11);
