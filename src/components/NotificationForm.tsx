import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { generateToken, getDefaultTerms } from "@/lib/notificationUtils";
import { Loader2, FileText, User, Building2 } from "lucide-react";
import { fetchAddressByCep } from "@/lib/cepService";
import { DisclaimerDialog } from "@/components/DisclaimerDialog";

interface NotificationFormData {
  // Credor
  creditorName: string;
  creditorDocument: string;
  creditorAddress: string;
  creditorCity: string;
  creditorState: string;
  creditorZip: string;
  creditorComplement: string;
  creditorEmail: string;
  creditorPhone: string;
  
  // Devedor
  debtorName: string;
  debtorDocument: string;
  debtorAddress: string;
  debtorCity: string;
  debtorState: string;
  debtorZip: string;
  debtorComplement: string;
  debtorEmail: string;
  debtorPhone: string;
  
  // Débito
  debtAmount: number;
  debtDescription: string;
  dueDate: string;
  propertyAddress: string;
  paymentDeadlineDays: number;
  termsAndClauses: string;
}

interface NotificationFormProps {
  onSuccess: (notificationId: string) => void;
}

export const NotificationForm = ({ onSuccess }: NotificationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [pendingData, setPendingData] = useState<NotificationFormData | null>(null);
  const [creatorData, setCreatorData] = useState<{ ip: string; hash: string } | null>(null);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<NotificationFormData>({
    defaultValues: {
      paymentDeadlineDays: 10,
      termsAndClauses: getDefaultTerms(),
    }
  });

  const creditorZip = watch("creditorZip");
  const debtorZip = watch("debtorZip");

  useEffect(() => {
    const loadCreditorAddress = async () => {
      if (creditorZip?.replace(/\D/g, '').length === 8) {
        const address = await fetchAddressByCep(creditorZip);
        if (address) {
          setValue("creditorAddress", address.logradouro);
          setValue("creditorCity", address.localidade);
          setValue("creditorState", address.uf);
          toast.success("Endereço do credor preenchido automaticamente");
        }
      }
    };
    loadCreditorAddress();
  }, [creditorZip, setValue]);

  useEffect(() => {
    const loadDebtorAddress = async () => {
      if (debtorZip?.replace(/\D/g, '').length === 8) {
        const address = await fetchAddressByCep(debtorZip);
        if (address) {
          setValue("debtorAddress", address.logradouro);
          setValue("debtorCity", address.localidade);
          setValue("debtorState", address.uf);
          toast.success("Endereço do devedor preenchido automaticamente");
        }
      }
    };
    loadDebtorAddress();
  }, [debtorZip, setValue]);

  const onSubmit = async (data: NotificationFormData) => {
    setPendingData(data);
    setShowDisclaimer(true);
  };

  const handleDisclaimerConfirm = async (creator: { ip: string; hash: string }) => {
    setShowDisclaimer(false);
    setCreatorData(creator);
    
    if (!pendingData) return;
    
    const data = pendingData;
    setIsSubmitting(true);
    try {
      const token = generateToken();
      
      const { data: notification, error } = await supabase
        .from("extrajudicial_notifications")
        .insert({
          token,
          creator_ip: creator.ip,
          creator_hash: creator.hash,
          creditor_name: data.creditorName,
          creditor_document: data.creditorDocument,
          creditor_address: data.creditorAddress,
          creditor_city: data.creditorCity,
          creditor_state: data.creditorState,
          creditor_zip: data.creditorZip,
          creditor_complement: data.creditorComplement,
          creditor_email: data.creditorEmail,
          creditor_phone: data.creditorPhone,
          debtor_name: data.debtorName,
          debtor_document: data.debtorDocument,
          debtor_address: data.debtorAddress,
          debtor_city: data.debtorCity,
          debtor_state: data.debtorState,
          debtor_zip: data.debtorZip,
          debtor_complement: data.debtorComplement,
          debtor_email: data.debtorEmail,
          debtor_phone: data.debtorPhone,
          debt_amount: data.debtAmount,
          debt_description: data.debtDescription,
          due_date: data.dueDate,
          property_address: data.propertyAddress,
          payment_deadline_days: data.paymentDeadlineDays,
          terms_and_clauses: data.termsAndClauses,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Notificação criada com sucesso!", {
        description: `Token: ${token}`,
      });
      
      onSuccess(notification.id);
    } catch (error) {
      console.error("Error creating notification:", error);
      toast.error("Erro ao criar notificação", {
        description: "Por favor, tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DisclaimerDialog
        open={showDisclaimer}
        onConfirm={handleDisclaimerConfirm}
        onCancel={() => {
          setShowDisclaimer(false);
          setPendingData(null);
        }}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Dados do Credor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Qualificação do Credor
          </CardTitle>
          <CardDescription>Informações da parte credora</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="creditorName">Nome/Razão Social *</Label>
            <Input id="creditorName" {...register("creditorName", { required: true })} />
          </div>
          <div>
            <Label htmlFor="creditorDocument">CPF/CNPJ *</Label>
            <Input id="creditorDocument" {...register("creditorDocument", { required: true })} />
          </div>
          <div>
            <Label htmlFor="creditorZip">CEP *</Label>
            <Input id="creditorZip" placeholder="00000-000" {...register("creditorZip", { required: true })} />
          </div>
          <div>
            <Label htmlFor="creditorEmail">E-mail</Label>
            <Input id="creditorEmail" type="email" {...register("creditorEmail")} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="creditorAddress">Endereço *</Label>
            <Input id="creditorAddress" {...register("creditorAddress", { required: true })} />
          </div>
          <div>
            <Label htmlFor="creditorCity">Cidade *</Label>
            <Input id="creditorCity" {...register("creditorCity", { required: true })} />
          </div>
          <div>
            <Label htmlFor="creditorState">Estado *</Label>
            <Input id="creditorState" maxLength={2} {...register("creditorState", { required: true })} />
          </div>
          <div>
            <Label htmlFor="creditorComplement">Complemento</Label>
            <Input id="creditorComplement" {...register("creditorComplement")} />
          </div>
          <div>
            <Label htmlFor="creditorPhone">Telefone</Label>
            <Input id="creditorPhone" {...register("creditorPhone")} />
          </div>
        </CardContent>
      </Card>

      {/* Dados do Devedor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-destructive" />
            Qualificação do Devedor
          </CardTitle>
          <CardDescription>Informações da parte devedora</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="debtorName">Nome/Razão Social *</Label>
            <Input id="debtorName" {...register("debtorName", { required: true })} />
          </div>
          <div>
            <Label htmlFor="debtorDocument">CPF/CNPJ *</Label>
            <Input id="debtorDocument" {...register("debtorDocument", { required: true })} />
          </div>
          <div>
            <Label htmlFor="debtorZip">CEP *</Label>
            <Input id="debtorZip" placeholder="00000-000" {...register("debtorZip", { required: true })} />
          </div>
          <div>
            <Label htmlFor="debtorEmail">E-mail</Label>
            <Input id="debtorEmail" type="email" {...register("debtorEmail")} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="debtorAddress">Endereço *</Label>
            <Input id="debtorAddress" {...register("debtorAddress", { required: true })} />
          </div>
          <div>
            <Label htmlFor="debtorCity">Cidade *</Label>
            <Input id="debtorCity" {...register("debtorCity", { required: true })} />
          </div>
          <div>
            <Label htmlFor="debtorState">Estado *</Label>
            <Input id="debtorState" maxLength={2} {...register("debtorState", { required: true })} />
          </div>
          <div>
            <Label htmlFor="debtorComplement">Complemento</Label>
            <Input id="debtorComplement" {...register("debtorComplement")} />
          </div>
          <div>
            <Label htmlFor="debtorPhone">Telefone</Label>
            <Input id="debtorPhone" {...register("debtorPhone")} />
          </div>
        </CardContent>
      </Card>

      {/* Dados do Débito */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-warning" />
            Informações do Débito
          </CardTitle>
          <CardDescription>Detalhes da dívida e prazos</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="debtAmount">Valor do Débito (R$) *</Label>
            <Input id="debtAmount" type="number" step="0.01" {...register("debtAmount", { required: true, valueAsNumber: true })} />
          </div>
          <div>
            <Label htmlFor="dueDate">Data de Vencimento *</Label>
            <Input id="dueDate" type="date" {...register("dueDate", { required: true })} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="debtDescription">Descrição do Débito *</Label>
            <Textarea id="debtDescription" {...register("debtDescription", { required: true })} rows={3} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="propertyAddress">Endereço do Imóvel *</Label>
            <Input id="propertyAddress" {...register("propertyAddress", { required: true })} />
          </div>
          <div>
            <Label htmlFor="paymentDeadlineDays">Prazo para Pagamento (dias) *</Label>
            <Input id="paymentDeadlineDays" type="number" {...register("paymentDeadlineDays", { required: true, valueAsNumber: true })} />
          </div>
        </CardContent>
      </Card>

      {/* Termos e Cláusulas */}
      <Card>
        <CardHeader>
          <CardTitle>Termos e Cláusulas</CardTitle>
          <CardDescription>Texto legal da notificação</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea 
            {...register("termsAndClauses", { required: true })} 
            rows={15}
            className="font-mono text-sm"
          />
        </CardContent>
      </Card>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Gerando Notificação...
          </>
        ) : (
          <>
            <FileText className="mr-2 h-4 w-4" />
            Gerar Notificação
          </>
        )}
      </Button>
    </form>
    </>
  );
};