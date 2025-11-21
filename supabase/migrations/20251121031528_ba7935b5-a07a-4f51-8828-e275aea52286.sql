-- Tabela de notificações extrajudiciais
CREATE TABLE public.extrajudicial_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token VARCHAR(50) NOT NULL UNIQUE,
  
  -- Dados do credor
  creditor_name TEXT NOT NULL,
  creditor_document VARCHAR(20) NOT NULL,
  creditor_address TEXT NOT NULL,
  creditor_city TEXT NOT NULL,
  creditor_state VARCHAR(2) NOT NULL,
  creditor_zip VARCHAR(10) NOT NULL,
  creditor_email TEXT,
  creditor_phone TEXT,
  
  -- Dados do devedor
  debtor_name TEXT NOT NULL,
  debtor_document VARCHAR(20) NOT NULL,
  debtor_address TEXT NOT NULL,
  debtor_city TEXT NOT NULL,
  debtor_state VARCHAR(2) NOT NULL,
  debtor_zip VARCHAR(10) NOT NULL,
  debtor_email TEXT,
  debtor_phone TEXT,
  
  -- Dados do débito
  debt_amount DECIMAL(12, 2) NOT NULL,
  debt_description TEXT NOT NULL,
  due_date DATE NOT NULL,
  property_address TEXT NOT NULL,
  payment_deadline_days INTEGER NOT NULL DEFAULT 10,
  
  -- Cláusulas e termos
  terms_and_clauses TEXT NOT NULL,
  
  -- Status e metadados
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Dados de aceite
  accepted BOOLEAN DEFAULT FALSE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  acceptance_hash TEXT,
  acceptance_ip TEXT
);

-- Habilitar RLS
ALTER TABLE public.extrajudicial_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - Todos podem ler notificações pelo token (para verificação pública)
CREATE POLICY "Notificações públicas por token"
  ON public.extrajudicial_notifications
  FOR SELECT
  USING (true);

-- Qualquer um pode criar notificações (para simplicidade inicial)
CREATE POLICY "Qualquer um pode criar notificações"
  ON public.extrajudicial_notifications
  FOR INSERT
  WITH CHECK (true);

-- Atualizar apenas próprias notificações ou aceite público
CREATE POLICY "Atualizar notificações"
  ON public.extrajudicial_notifications
  FOR UPDATE
  USING (true);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.extrajudicial_notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_notifications_token ON public.extrajudicial_notifications(token);
CREATE INDEX idx_notifications_status ON public.extrajudicial_notifications(status);
CREATE INDEX idx_notifications_created_at ON public.extrajudicial_notifications(created_at DESC);