import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Shield, AlertCircle } from "lucide-react";

interface DisclaimerDialogProps {
  open: boolean;
  onConfirm: (creatorData: { ip: string; hash: string }) => void;
  onCancel: () => void;
}

export const DisclaimerDialog = ({ open, onConfirm, onCancel }: DisclaimerDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      // Get user IP
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipResponse.json();
      
      // Generate creation hash
      const timestamp = new Date().toISOString();
      const hashData = `${ip}-${timestamp}`;
      const encoder = new TextEncoder();
      const data = encoder.encode(hashData);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      onConfirm({ ip, hash });
    } catch (error) {
      console.error('Error generating creator data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-6 w-6 text-primary" />
            Termo de Responsabilidade e Isenção
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base space-y-4 pt-4">
            <div className="bg-warning/10 border border-warning rounded-lg p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm text-foreground">
                <p className="font-semibold">IMPORTANTE - LEIA COM ATENÇÃO</p>
                <p>
                  Ao gerar esta notificação extrajudicial, você declara ser o legítimo credor do débito aqui descrito
                  e assume total responsabilidade pela veracidade das informações prestadas.
                </p>
              </div>
            </div>

            <div className="text-sm text-foreground space-y-3">
              <h3 className="font-bold text-base">Declaração de Responsabilidade:</h3>
              
              <p>
                1. <strong>RESPONSABILIDADE DO CREDOR:</strong> A presente notificação é emitida sob exclusiva
                responsabilidade do credor declarante, não cabendo à plataforma MR3X qualquer responsabilidade
                sobre a obrigação de pagamento caso o devedor não efetue o pagamento do débito notificado.
              </p>

              <p>
                2. <strong>VERACIDADE DAS INFORMAÇÕES:</strong> O credor declara que todas as informações
                prestadas são verdadeiras e que possui documentação comprobatória do débito notificado,
                podendo ser responsabilizado civil e criminalmente por falsidade ideológica ou documental.
              </p>

              <p>
                3. <strong>BASE LEGAL:</strong> Esta notificação extrajudicial tem amparo nos artigos 867 e
                seguintes do Código Civil Brasileiro e artigos 726 e 729 do Código de Processo Civil,
                constituindo o devedor em mora para fins legais.
              </p>

              <p>
                4. <strong>REGISTRO E RASTREABILIDADE:</strong> Ao confirmar, seu IP e hash de identificação
                serão registrados juntamente com data e hora, garantindo a rastreabilidade e autenticidade
                da emissão desta notificação, conforme Lei 13.709/2018 (LGPD).
              </p>

              <p>
                5. <strong>ISENÇÃO DA PLATAFORMA:</strong> A plataforma MR3X atua apenas como facilitadora
                tecnológica para emissão de notificações extrajudiciais, não se responsabilizando pelo
                conteúdo, consequências ou efeitos jurídicos decorrentes da notificação emitida.
              </p>
            </div>

            <div className="bg-legal-blue-light border border-primary rounded-lg p-4 mt-4">
              <p className="text-sm font-semibold text-primary">
                🔒 Ao clicar em "Li e Aceito", você confirma ter lido, compreendido e concordado com todos
                os termos acima descritos, assumindo total responsabilidade pela notificação que será gerada.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? "Processando..." : "Li e Aceito"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
