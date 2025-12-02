import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/notificationUtils";
import jsPDF from "jspdf";

type StatusFilter = "all" | "accepted" | "pending" | "ignored";

export const ReportExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const fetchFilteredData = async () => {
    let query = supabase
      .from("extrajudicial_notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      query = query.lte("created_at", endDate + "T23:59:59");
    }

    const { data, error } = await query;
    if (error) throw error;

    let filtered = data || [];

    // Apply status filter
    if (statusFilter === "accepted") {
      filtered = filtered.filter(n => n.accepted === true);
    } else if (statusFilter === "pending") {
      filtered = filtered.filter(n => n.accepted === false && n.status !== 'ignored');
    } else if (statusFilter === "ignored") {
      filtered = filtered.filter(n => n.status === 'ignored');
    }

    return filtered;
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const data = await fetchFilteredData();

      const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPos = margin;

      // Header
      pdf.setFontSize(18);
      pdf.setTextColor(30, 58, 95);
      pdf.text("Relatório de Notificações Extrajudiciais", pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      // Filter info
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      const filterText = `Período: ${startDate || 'Início'} a ${endDate || 'Fim'} | Status: ${
        statusFilter === 'all' ? 'Todos' : 
        statusFilter === 'accepted' ? 'Aceitas' : 
        statusFilter === 'pending' ? 'Pendentes' : 'Ignoradas'
      } | Total: ${data.length} notificações`;
      pdf.text(filterText, pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      // Calculate totals
      const totalValue = data.reduce((sum, n) => sum + Number(n.debt_amount), 0);
      const acceptedCount = data.filter(n => n.accepted).length;
      const pendingCount = data.filter(n => !n.accepted && n.status !== 'ignored').length;

      // Summary
      pdf.setFontSize(10);
      pdf.setTextColor(0);
      pdf.text(`Valor Total: ${formatCurrency(totalValue)} | Aceitas: ${acceptedCount} | Pendentes: ${pendingCount}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // Table header
      const colWidths = [35, 45, 45, 25, 25, 45, 45];
      const headers = ['Token', 'Credor', 'Devedor', 'Valor', 'Status', 'Data Emissão', 'Data Aceite'];
      
      pdf.setFillColor(30, 58, 95);
      pdf.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F');
      pdf.setTextColor(255);
      pdf.setFontSize(9);
      
      let xPos = margin + 2;
      headers.forEach((header, i) => {
        pdf.text(header, xPos, yPos);
        xPos += colWidths[i];
      });
      yPos += 8;

      // Table rows
      pdf.setTextColor(0);
      pdf.setFontSize(8);

      data.forEach((notification, index) => {
        if (yPos > pageHeight - 20) {
          pdf.addPage();
          yPos = margin;
        }

        // Alternate row background
        if (index % 2 === 0) {
          pdf.setFillColor(245, 247, 250);
          pdf.rect(margin, yPos - 4, pageWidth - 2 * margin, 7, 'F');
        }

        xPos = margin + 2;
        
        const status = notification.accepted ? 'Aceita' : 
                      notification.status === 'ignored' ? 'Ignorada' : 'Pendente';
        
        const rowData = [
          notification.token?.substring(0, 20) || '',
          notification.creditor_name?.substring(0, 25) || '',
          notification.debtor_name?.substring(0, 25) || '',
          formatCurrency(Number(notification.debt_amount)).replace('R$', ''),
          status,
          formatDate(notification.created_at),
          notification.accepted_at ? formatDate(notification.accepted_at) : '-'
        ];

        rowData.forEach((cell, i) => {
          pdf.text(String(cell), xPos, yPos);
          xPos += colWidths[i];
        });

        yPos += 7;
      });

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(100);
      pdf.text(`Gerado em: ${formatDateTime(new Date().toISOString())} | MR3X - Sistema de Notificações`, pageWidth / 2, pageHeight - 10, { align: 'center' });

      pdf.save(`Relatorio_Notificacoes_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("Relatório PDF exportado com sucesso!");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Erro ao exportar PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const data = await fetchFilteredData();

      // Create CSV content
      const headers = [
        'Token',
        'Credor',
        'CPF/CNPJ Credor',
        'Devedor',
        'CPF/CNPJ Devedor',
        'Valor',
        'Data Vencimento',
        'Status',
        'Data Emissão',
        'Data Aceite',
        'IP Aceite',
        'Hash Aceite',
        'Endereço Imóvel',
        'Descrição'
      ];

      const rows = data.map(n => [
        n.token,
        n.creditor_name,
        n.creditor_document,
        n.debtor_name,
        n.debtor_document,
        n.debt_amount,
        n.due_date,
        n.accepted ? 'Aceita' : (n.status === 'ignored' ? 'Ignorada' : 'Pendente'),
        n.created_at,
        n.accepted_at || '',
        n.acceptance_ip || '',
        n.acceptance_hash || '',
        n.property_address,
        n.debt_description
      ]);

      const csvContent = [
        headers.join(';'),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
      ].join('\n');

      // Add BOM for Excel UTF-8 compatibility
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `Relatorio_Notificacoes_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Relatório Excel/CSV exportado com sucesso!");
    } catch (error) {
      console.error("Error exporting Excel:", error);
      toast.error("Erro ao exportar Excel");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Exportar Relatórios
        </CardTitle>
        <CardDescription>
          Exporte relatórios das notificações em PDF ou Excel/CSV
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Data Início</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">Data Fim</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="accepted">Aceitas</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="ignored">Ignoradas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 pt-4">
          <Button onClick={exportToPDF} disabled={isExporting} variant="outline">
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            Exportar PDF
          </Button>
          <Button onClick={exportToExcel} disabled={isExporting} variant="outline">
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="mr-2 h-4 w-4" />
            )}
            Exportar Excel/CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
