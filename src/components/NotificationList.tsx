import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/notificationUtils";
import { Download, Mail, MessageSquare, Eye, FileCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface NotificationListProps {
  notifications: any[];
  onViewPreview: (id: string) => void;
}

export const NotificationList = ({ notifications, onViewPreview }: NotificationListProps) => {
  const handleDownloadPDF = (notification: any) => {
    toast.info("Função de download PDF em desenvolvimento");
  };

  const handleSendEmail = (notification: any) => {
    const subject = encodeURIComponent(`Notificação Extrajudicial - ${notification.token}`);
    const body = encodeURIComponent(
      `Prezado(a) ${notification.debtor_name},\n\n` +
      `Você recebeu uma notificação extrajudicial.\n\n` +
      `Token: ${notification.token}\n` +
      `Valor: ${formatCurrency(Number(notification.debt_amount))}\n` +
      `Vencimento: ${formatDate(notification.due_date)}\n\n` +
      `Para mais detalhes, acesse: ${window.location.origin}/verify/${notification.token}`
    );
    
    window.open(`mailto:${notification.debtor_email || ''}?subject=${subject}&body=${body}`);
  };

  const handleSendWhatsApp = (notification: any) => {
    const phone = notification.debtor_phone?.replace(/\D/g, '') || '';
    const message = encodeURIComponent(
      `*Notificação Extrajudicial*\n\n` +
      `Prezado(a) ${notification.debtor_name},\n\n` +
      `Você recebeu uma notificação extrajudicial.\n\n` +
      `*Token:* ${notification.token}\n` +
      `*Valor:* ${formatCurrency(Number(notification.debt_amount))}\n` +
      `*Vencimento:* ${formatDate(notification.due_date)}\n\n` +
      `Acesse para mais detalhes: ${window.location.origin}/verify/${notification.token}`
    );
    
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhuma notificação encontrada
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <Card key={notification.id} className={notification.accepted ? "border-success" : ""}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono font-bold text-lg text-primary">
                      {notification.token}
                    </h3>
                    {notification.accepted ? (
                      <FileCheck className="h-5 w-5 text-success" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-warning" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Emitido em: {formatDateTime(notification.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(Number(notification.debt_amount))}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Venc: {formatDate(notification.due_date)}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-semibold">Credor:</span>
                  <p className="text-muted-foreground">{notification.creditor_name}</p>
                </div>
                <div>
                  <span className="font-semibold">Devedor:</span>
                  <p className="text-muted-foreground">{notification.debtor_name}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewPreview(notification.id)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadPDF(notification)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Baixar PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendEmail(notification)}
                  disabled={!notification.debtor_email}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  E-mail
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendWhatsApp(notification)}
                  disabled={!notification.debtor_phone}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  WhatsApp
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
