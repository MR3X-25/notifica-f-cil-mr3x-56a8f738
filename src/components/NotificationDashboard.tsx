import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, FileCheck, AlertCircle, Clock, DollarSign, TrendingUp, BarChart3 } from "lucide-react";
import { formatCurrency } from "@/lib/notificationUtils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { ReportExport } from "./ReportExport";

interface DashboardStats {
  total: number;
  accepted: number;
  pending: number;
  ignored: number;
  totalValue: number;
  acceptedValue: number;
  pendingValue: number;
}

interface MonthlyData {
  month: string;
  total: number;
  accepted: number;
  pending: number;
}

const COLORS = ['hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--muted))'];

export const NotificationDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    accepted: 0,
    pending: 0,
    ignored: 0,
    totalValue: 0,
    acceptedValue: 0,
    pendingValue: 0,
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("extrajudicial_notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const notifications = data || [];

      // Calculate stats
      const accepted = notifications.filter(n => n.accepted === true);
      const pending = notifications.filter(n => n.accepted === false && n.status !== 'ignored');
      const ignored = notifications.filter(n => n.status === 'ignored');

      const totalValue = notifications.reduce((sum, n) => sum + Number(n.debt_amount), 0);
      const acceptedValue = accepted.reduce((sum, n) => sum + Number(n.debt_amount), 0);
      const pendingValue = pending.reduce((sum, n) => sum + Number(n.debt_amount), 0);

      setStats({
        total: notifications.length,
        accepted: accepted.length,
        pending: pending.length,
        ignored: ignored.length,
        totalValue,
        acceptedValue,
        pendingValue,
      });

      // Calculate monthly data (last 6 months)
      const months: { [key: string]: MonthlyData } = {};
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
        months[key] = { month: monthName, total: 0, accepted: 0, pending: 0 };
      }

      notifications.forEach(n => {
        const date = new Date(n.created_at);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (months[key]) {
          months[key].total++;
          if (n.accepted) {
            months[key].accepted++;
          } else if (n.status !== 'ignored') {
            months[key].pending++;
          }
        }
      });

      setMonthlyData(Object.values(months));
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const pieData = [
    { name: 'Aceitas', value: stats.accepted },
    { name: 'Pendentes', value: stats.pending },
    { name: 'Ignoradas', value: stats.ignored },
  ].filter(d => d.value > 0);

  const acceptanceRate = stats.total > 0 ? ((stats.accepted / stats.total) * 100).toFixed(1) : '0';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Notificações</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.totalValue)} em valor total
            </p>
          </CardContent>
        </Card>

        <Card className="border-success/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aceitas</CardTitle>
            <FileCheck className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.accepted}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.acceptedValue)} confirmados
            </p>
          </CardContent>
        </Card>

        <Card className="border-warning/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.pendingValue)} em aberto
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Aceite</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{acceptanceRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.accepted} de {stats.total} notificações
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Monthly */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notificações por Mês</CardTitle>
            <CardDescription>Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="total" name="Total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="accepted" name="Aceitas" fill="hsl(142.1 76.2% 36.3%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" name="Pendentes" fill="hsl(47.9 95.8% 53.1%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart - Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuição por Status</CardTitle>
            <CardDescription>Visão geral das notificações</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Nenhuma notificação encontrada
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Value Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Valores por Status</CardTitle>
          <CardDescription>Comparação de valores totais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <span className="font-medium">Valor Total</span>
              </div>
              <p className="text-2xl font-bold text-primary">{formatCurrency(stats.totalValue)}</p>
            </div>
            <div className="p-4 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-center gap-2 mb-2">
                <FileCheck className="h-5 w-5 text-success" />
                <span className="font-medium">Valor Aceito</span>
              </div>
              <p className="text-2xl font-bold text-success">{formatCurrency(stats.acceptedValue)}</p>
            </div>
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                <span className="font-medium">Valor Pendente</span>
              </div>
              <p className="text-2xl font-bold text-warning">{formatCurrency(stats.pendingValue)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Reports */}
      <ReportExport />
    </div>
  );
};
