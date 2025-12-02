import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Search, Loader2, FileCheck, AlertCircle, Filter, X } from "lucide-react";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/notificationUtils";
import { NotificationList } from "@/components/NotificationList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface NotificationSearchProps {
  onViewPreview?: (id: string) => void;
}

type StatusFilter = "all" | "pending" | "accepted" | "ignored";

export const NotificationSearch = ({ onViewPreview }: NotificationSearchProps) => {
  const [searchToken, setSearchToken] = useState("");
  const [searchHash, setSearchHash] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [allNotifications, setAllNotifications] = useState<any[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<any[]>([]);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

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

  // Apply filters
  useEffect(() => {
    let filtered = [...allNotifications];

    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "accepted") {
        filtered = filtered.filter(n => n.accepted === true);
      } else if (statusFilter === "pending") {
        filtered = filtered.filter(n => n.accepted === false && n.status !== 'ignored');
      } else if (statusFilter === "ignored") {
        filtered = filtered.filter(n => n.status === 'ignored');
      }
    }

    // Search query filter (name or document)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(n => 
        n.debtor_name?.toLowerCase().includes(query) ||
        n.debtor_document?.toLowerCase().includes(query) ||
        n.creditor_name?.toLowerCase().includes(query) ||
        n.creditor_document?.toLowerCase().includes(query) ||
        n.token?.toLowerCase().includes(query)
      );
    }

    setFilteredNotifications(filtered);
  }, [allNotifications, statusFilter, searchQuery]);

  useEffect(() => {
    loadAllNotifications();
  }, []);

  const clearFilters = () => {
    setStatusFilter("all");
    setSearchQuery("");
  };

  const getStatusCounts = () => {
    const accepted = allNotifications.filter(n => n.accepted === true).length;
    const pending = allNotifications.filter(n => n.accepted === false && n.status !== 'ignored').length;
    const ignored = allNotifications.filter(n => n.status === 'ignored').length;
    return { accepted, pending, ignored, total: allNotifications.length };
  };

  const counts = getStatusCounts();

  return (
    <Tabs defaultValue="list" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="list" className="gap-2">
          <List className="h-4 w-4" />
          Histórico de Notificações
        </TabsTrigger>
        <TabsTrigger value="search" className="gap-2">
          <Search className="h-4 w-4" />
          Buscar por Token/Hash
        </TabsTrigger>
      </TabsList>

      <TabsContent value="list" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5" />
              Histórico de Notificações
            </CardTitle>
            <CardDescription>
              Filtre e busque notificações por status, nome ou documento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status Summary */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-sm">
                Total: {counts.total}
              </Badge>
              <Badge variant="outline" className="text-sm bg-success/10 text-success border-success">
                Aceitas: {counts.accepted}
              </Badge>
              <Badge variant="outline" className="text-sm bg-warning/10 text-warning border-warning">
                Pendentes: {counts.pending}
              </Badge>
              <Badge variant="outline" className="text-sm bg-muted text-muted-foreground">
                Ignoradas: {counts.ignored}
              </Badge>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="searchQuery" className="sr-only">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="searchQuery"
                    placeholder="Buscar por nome, documento ou token..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Label htmlFor="statusFilter" className="sr-only">Status</Label>
                <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="accepted">Aceitas</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="ignored">Ignoradas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(statusFilter !== "all" || searchQuery) && (
                <Button variant="ghost" size="icon" onClick={clearFilters} title="Limpar filtros">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Results */}
            {isLoadingAll ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {filteredNotifications.length !== allNotifications.length && (
                  <p className="text-sm text-muted-foreground">
                    Exibindo {filteredNotifications.length} de {allNotifications.length} notificações
                  </p>
                )}
                <NotificationList 
                  notifications={filteredNotifications} 
                  onViewPreview={(id) => onViewPreview?.(id)}
                />
              </>
            )}
          </CardContent>
        </Card>
      </TabsContent>

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
    </Tabs>
  );
};
