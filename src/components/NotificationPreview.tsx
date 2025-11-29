import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Download, CheckCircle, FileCheck } from "lucide-react";
import Barcode from "react-barcode";
import { QRCodeSVG } from "qrcode.react";
import { formatCurrency, formatDate, formatDocument, generateHash, formatDateTime } from "@/lib/notificationUtils";
import logo from "@/assets/mr3x-logo-3d.png";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface NotificationPreviewProps {
  notificationId: string;
  onAccept?: () => void;
}

export const NotificationPreview = ({ notificationId, onAccept }: NotificationPreviewProps) => {
  const [notification, setNotification] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    loadNotification();
  }, [notificationId]);

  const loadNotification = async () => {
    try {
      const { data, error } = await supabase
        .from("extrajudicial_notifications")
        .select("*")
        .eq("id", notificationId)
        .single();

      if (error) throw error;
      setNotification(data);
    } catch (error) {
      console.error("Error loading notification:", error);
      toast.error("Erro ao carregar notificação");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      const acceptanceData = {
        token: notification.token,
        timestamp: new Date().toISOString(),
        notificationId: notification.id,
      };
      
      const hash = generateHash(JSON.stringify(acceptanceData));
      
      // Get user IP (simplified - in production use a proper service)
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipResponse.json();

      const { error } = await supabase
        .from("extrajudicial_notifications")
        .update({
          accepted: true,
          accepted_at: new Date().toISOString(),
          acceptance_hash: hash,
          acceptance_ip: ip,
        })
        .eq("id", notificationId);

      if (error) throw error;

      toast.success("Notificação aceita com sucesso!", {
        description: `Hash: ${hash.substring(0, 16)}...`,
      });
      
      await loadNotification();
      onAccept?.();
    } catch (error) {
      console.error("Error accepting notification:", error);
      toast.error("Erro ao aceitar notificação");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleGeneratePDF = async () => {
    try {
      const element = document.getElementById('notification-document');
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Notificacao_${notification.token}.pdf`);
      
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Erro ao gerar PDF");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!notification) {
    return <div className="text-center p-12 text-muted-foreground">Notificação não encontrada</div>;
  }

  const qrCodeUrl = `${window.location.origin}/verify/${notification.token}`;

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <Button variant="outline" onClick={handleGeneratePDF}>
          <Download className="mr-2 h-4 w-4" />
          Baixar PDF
        </Button>
        {!notification.accepted && (
          <Button onClick={handleAccept} disabled={isAccepting}>
            {isAccepting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Aceitando...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Aceitar Notificação
              </>
            )}
          </Button>
        )}
      </div>

      {/* Acceptance Status */}
      {notification.accepted && (
        <Card className="bg-success/10 border-success">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <FileCheck className="h-5 w-5 text-success mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="font-semibold text-success">Notificação Aceita</p>
                <p className="text-sm text-muted-foreground">
                  Data: {formatDateTime(notification.accepted_at)}
                </p>
                <p className="text-sm text-muted-foreground">
                  IP: {notification.acceptance_ip}
                </p>
                <p className="text-xs font-mono text-muted-foreground break-all">
                  Hash: {notification.acceptance_hash}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Document */}
      <Card className="bg-card shadow-lg relative" id="notification-document">
        <CardContent className="p-8 space-y-6">
          {/* Vertical Barcode on Left Margin */}
          <div className="absolute left-0 top-8 bottom-8 flex items-center justify-center" style={{ width: '48px' }}>
            <div style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', width: '300px' }}>
              <Barcode 
                value={notification.token} 
                height={40} 
                fontSize={10} 
                width={1.5}
                background="transparent"
                margin={0}
              />
            </div>
          </div>

          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-primary pb-6 ml-16">
            <div className="flex-shrink-0">
              <img src={logo} alt="MR3X Logo" style={{ width: '132px', height: '132px' }} className="object-contain" />
            </div>
            <div className="flex-1 text-center px-8">
              <h1 className="text-2xl font-bold text-primary mb-2">
                NOTIFICAÇÃO EXTRAJUDICIAL
              </h1>
              <p className="text-sm text-foreground font-semibold">
                MR3X - GESTÃO E TECNOLOGIA EM PAGAMENTOS DE ALUGUÉIS
              </p>
            </div>
            <div className="flex-shrink-0">
              <QRCodeSVG value={qrCodeUrl} size={132} />
            </div>
          </div>

          {/* Token Display */}
          <div className="bg-legal-blue-light p-4 rounded-lg text-center ml-16">
            <p className="text-sm font-semibold text-primary mb-2">Token da Notificação:</p>
            <p className="text-xl font-mono font-bold text-primary">{notification.token}</p>
          </div>

          {/* Creditor Information */}
          <div className="space-y-3 ml-16">
            <h2 className="text-lg font-bold text-primary border-b border-border pb-2">
              QUALIFICAÇÃO DO CREDOR
            </h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div>
                <span className="font-semibold">Nome/Razão Social:</span>
                <p className="text-foreground">{notification.creditor_name}</p>
              </div>
              <div>
                <span className="font-semibold">CPF/CNPJ:</span>
                <p className="text-foreground">{formatDocument(notification.creditor_document)}</p>
              </div>
              <div className="col-span-2">
                <span className="font-semibold">Endereço:</span>
                <p className="text-foreground">
                  {notification.creditor_address}, {notification.creditor_city}/{notification.creditor_state} - CEP: {notification.creditor_zip}
                </p>
              </div>
              {notification.creditor_email && (
                <div>
                  <span className="font-semibold">E-mail:</span>
                  <p className="text-foreground">{notification.creditor_email}</p>
                </div>
              )}
              {notification.creditor_phone && (
                <div>
                  <span className="font-semibold">Telefone:</span>
                  <p className="text-foreground">{notification.creditor_phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Debtor Information */}
          <div className="space-y-3 ml-16">
            <h2 className="text-lg font-bold text-destructive border-b border-border pb-2">
              QUALIFICAÇÃO DO DEVEDOR
            </h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div>
                <span className="font-semibold">Nome/Razão Social:</span>
                <p className="text-foreground">{notification.debtor_name}</p>
              </div>
              <div>
                <span className="font-semibold">CPF/CNPJ:</span>
                <p className="text-foreground">{formatDocument(notification.debtor_document)}</p>
              </div>
              <div className="col-span-2">
                <span className="font-semibold">Endereço:</span>
                <p className="text-foreground">
                  {notification.debtor_address}, {notification.debtor_city}/{notification.debtor_state} - CEP: {notification.debtor_zip}
                </p>
              </div>
              {notification.debtor_email && (
                <div>
                  <span className="font-semibold">E-mail:</span>
                  <p className="text-foreground">{notification.debtor_email}</p>
                </div>
              )}
              {notification.debtor_phone && (
                <div>
                  <span className="font-semibold">Telefone:</span>
                  <p className="text-foreground">{notification.debtor_phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Debt Information */}
          <div className="space-y-3 ml-16">
            <h2 className="text-lg font-bold text-warning border-b border-border pb-2">
              INFORMAÇÕES DO DÉBITO
            </h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div>
                <span className="font-semibold">Valor:</span>
                <p className="text-foreground font-bold text-lg">{formatCurrency(Number(notification.debt_amount))}</p>
              </div>
              <div>
                <span className="font-semibold">Data de Vencimento:</span>
                <p className="text-foreground">{formatDate(notification.due_date)}</p>
              </div>
              <div className="col-span-2">
                <span className="font-semibold">Descrição:</span>
                <p className="text-foreground">{notification.debt_description}</p>
              </div>
              <div className="col-span-2">
                <span className="font-semibold">Endereço do Imóvel:</span>
                <p className="text-foreground">{notification.property_address}</p>
              </div>
              <div>
                <span className="font-semibold">Prazo para Pagamento:</span>
                <p className="text-foreground">{notification.payment_deadline_days} dias</p>
              </div>
            </div>
          </div>

          {/* Terms and Clauses */}
          <div className="space-y-3 ml-16">
            <h2 className="text-lg font-bold text-primary border-b border-border pb-2">
              TERMOS E CLÁUSULAS
            </h2>
            <div className="text-sm text-foreground whitespace-pre-wrap font-serif leading-relaxed">
              {notification.terms_and_clauses}
            </div>
          </div>

          {/* Footer with Barcode */}
          <div className="border-t-2 border-primary pt-6 mt-8 ml-16">
            <div className="flex justify-center">
              <div className="text-center">
                <Barcode value={notification.token} height={50} fontSize={12} />
                <p className="text-xs text-muted-foreground mt-2">
                  Emitido em: {formatDateTime(notification.created_at)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};