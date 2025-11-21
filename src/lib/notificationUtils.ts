import CryptoJS from 'crypto-js';

export const generateToken = (): string => {
  const year = new Date().getFullYear();
  const randomPart = Math.floor(Math.random() * 900000) + 100000;
  return `MR3X-NEJ-${year}-${randomPart}`;
};

export const generateHash = (data: string): string => {
  return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDocument = (document: string): string => {
  const cleaned = document.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    // CPF: 000.000.000-00
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (cleaned.length === 14) {
    // CNPJ: 00.000.000/0000-00
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  
  return document;
};

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const getDefaultTerms = (): string => {
  return `NOTIFICAÇÃO EXTRAJUDICIAL

Pelo presente instrumento, o CREDOR, acima qualificado, vem, por meio desta, NOTIFICAR EXTRAJUDICIALMENTE o DEVEDOR, também qualificado, dos seguintes fatos e fundamentos jurídicos:

1. DO DÉBITO
O DEVEDOR encontra-se em débito com o CREDOR, referente ao não pagamento de valores devidos conforme discriminado acima.

2. DO PRAZO PARA PAGAMENTO
Fica concedido ao DEVEDOR o prazo determinado nesta notificação, contados a partir do recebimento da presente, para que efetue o pagamento integral do débito, sob pena de:
a) Inscrição do nome do devedor nos órgãos de proteção ao crédito (SPC, SERASA);
b) Propositura de ação judicial de cobrança;
c) Incidência de juros, multa e correção monetária conforme legislação vigente.

3. DA FUNDAMENTAÇÃO LEGAL
Esta notificação é realizada com base nos artigos 867 e seguintes do Código Civil Brasileiro e demais legislações aplicáveis.

4. DAS CONSIDERAÇÕES FINAIS
O CREDOR coloca-se à disposição para eventuais esclarecimentos e negociações amigáveis para quitação do débito, podendo ser contatado através dos dados informados acima.

A presente notificação é enviada em cumprimento às formalidades legais, visando a solução amigável do débito antes da adoção de medidas judiciais.`;
};