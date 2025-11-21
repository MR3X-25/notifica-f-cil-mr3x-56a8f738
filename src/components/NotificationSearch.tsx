import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Search, Loader2, FileCheck, AlertCircle } from "lucide-react";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/notificationUtils";
import { NotificationList } from "@/components/NotificationList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List } from "lucide-react";

interface NotificationSearchProps {
  onViewPreview?: (id: string) => void;
}

export const NotificationSearch = ({ onViewPreview }: NotificationSearchProps) => {
  const [searchToken, setSearchToken] = useState("");
  const [searchHash, setSearchHash] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [allNotifications, setAllNotifications] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!searchToken && !searchHash) {
      toast.error("Por favor, informe o token ou hash para buscar");
      return;
    }

    setIsSearching(true);
    try {
      let query = supabase.from("extrajudicial_notifications").select("*");

      if (searchToken) {
        query = query.eq("token", searchToken.trim().toUpperCase());
      } else if (searchHash) {
        query = query.eq("acceptance_hash", searchHash.trim().toLowerCase());
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast.error("Notificação não encontrada");
          setResult(null);
        } else {
          throw error;
        }
        return;
      }

      setResult(data);
      toast.success("Notificação encontrada!");
    } catch (error) {
      console.error("Error searching notification:", error);
      toast.error("Erro ao buscar notificação");
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setSearchToken("");
    setSearchHash("");
    setResult(null);
  };

  const loadAllNotifications = async () => {
    setIsLoadingAll(true);
    try {
      const { data, error } = await supabase
        .from("extrajudicial_notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAllNotifications(data || []);
    } catch (error) {
      console.error("Error loading notifications:", error);
      toast.error("Erro ao carregar notificações");
    } finally {
      setIsLoadingAll(false);
    }
  };

  useEffect(() => {
    loadAllNotifications();
  }, []);

  return (
    <Tabs defaultValue="search" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="search" className="gap-2">
          <Search className="h-4 w-4" />
          Buscar por Token/Hash
        </TabsTrigger>
        <TabsTrigger value="list" className="gap-2">
          <List className="h-4 w-4" />
          Todas as Notificações
        </TabsTrigger>
      </TabsList>

      <TabsContent value="search" className="space-y-6">
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar e Verificar Notificação
          </CardTitle>
          <CardDescription>
            Busque por token ou hash de aceite para verificar autenticidade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="searchToken">Token da Notificação</Label>
            <Input
              id="searchToken"
              placeholder="MR3X-NEJ-2025-XXXXXX"
              value={searchToken}
              onChange={(e) => setSearchToken(e.target.value)}
              disabled={isSearching || !!searchHash}
            />
          </div>

          <div className="text-center text-sm text-muted-foreground">
            - OU -
          </div>

          <div className="space-y-2">
            <Label htmlFor="searchHash">Hash de Aceite</Label>
            <Input
              id="searchHash"
              placeholder="hash..."
              value={searchHash}
              onChange={(e) => setSearchHash(e.target.value)}
              disabled={isSearching || !!searchToken}
              className="font-mono text-xs"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSearch} disabled={isSearching} className="flex-1">
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Buscar
                </>
              )}
            </Button>
            <Button onClick={handleClear} variant="outline">
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card className={result.accepted ? "border-success" : "border-warning"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.accepted ? (
                <>
                  <FileCheck className="h-5 w-5 text-success" />
                  <span className="text-success">Notificação Verificada</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-warning" />
                  <span className="text-warning">Notificação Pendente</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold">Token:</span>
                <p className="font-mono text-primary">{result.token}</p>
              </div>
              <div>
                <span className="font-semibold">Status:</span>
                <p className={result.accepted ? "text-success" : "text-warning"}>
                  {result.accepted ? "Aceita" : "Pendente"}
                </p>
              </div>
              <div>
                <span className="font-semibold">Credor:</span>
                <p>{result.creditor_name}</p>
              </div>
              <div>
                <span className="font-semibold">Devedor:</span>
                <p>{result.debtor_name}</p>
              </div>
              <div>
                <span className="font-semibold">Valor:</span>
                <p className="font-bold">{formatCurrency(Number(result.debt_amount))}</p>
              </div>
              <div>
                <span className="font-semibold">Vencimento:</span>
                <p>{formatDate(result.due_date)}</p>
              </div>
              <div className="md:col-span-2">
                <span className="font-semibold">Emissão:</span>
                <p>{formatDateTime(result.created_at)}</p>
              </div>
              
              {result.accepted && (
                <>
                  <div className="md:col-span-2 pt-4 border-t border-border">
                    <span className="font-semibold text-success">Informações de Aceite:</span>
                  </div>
                  <div>
                    <span className="font-semibold">Data/Hora:</span>
                    <p>{formatDateTime(result.accepted_at)}</p>
                  </div>
                  <div>
                    <span className="font-semibold">IP:</span>
                    <p className="font-mono">{result.acceptance_ip}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-semibold">Hash de Verificação:</span>
                    <p className="font-mono text-xs break-all bg-muted p-2 rounded mt-1">
                      {result.acceptance_hash}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="bg-legal-blue-light p-4 rounded-lg">
              <p className="text-sm font-semibold text-primary mb-2">
                🔒 Autenticidade Verificada
              </p>
              <p className="text-xs text-foreground">
                Esta notificação foi gerada pelo sistema MR3X e pode ser verificada a qualquer momento através do token ou hash de aceite.
                {result.accepted && " O aceite foi registrado com criptografia segura e não pode ser alterado."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      </TabsContent>

      <TabsContent value="list" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5" />
              Todas as Notificações
            </CardTitle>
            <CardDescription>
              Lista completa de notificações emitidas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAll ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <NotificationList 
                notifications={allNotifications} 
                onViewPreview={(id) => onViewPreview?.(id)}
              />
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};