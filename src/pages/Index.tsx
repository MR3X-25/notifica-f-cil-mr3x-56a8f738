import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationForm } from "@/components/NotificationForm";
import { NotificationPreview } from "@/components/NotificationPreview";
import { NotificationSearch } from "@/components/NotificationSearch";
import { NotificationDashboard } from "@/components/NotificationDashboard";
import { FileText, Search, Eye, LayoutDashboard } from "lucide-react";
import logo from "@/assets/mr3x-logo-3d.png";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  const [currentNotificationId, setCurrentNotificationId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleNotificationCreated = (id: string) => {
    setCurrentNotificationId(id);
    setActiveTab("preview");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-legal-blue-light">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={logo} alt="MR3X Logo" className="h-12 w-auto" />
              <div>
                <h1 className="text-xl font-bold text-primary">
                  Sistema de Notificação Extrajudicial
                </h1>
                <p className="text-sm text-muted-foreground">
                  MR3X - Gestão e Tecnologia em Pagamentos de Aluguéis
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 lg:w-[800px] mx-auto">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="create" className="gap-2">
              <FileText className="h-4 w-4" />
              Criar
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2" disabled={!currentNotificationId}>
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="search" className="gap-2">
              <Search className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="max-w-6xl mx-auto">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Dashboard de Notificações
                </h2>
                <p className="text-muted-foreground">
                  Visão geral das estatísticas e métricas
                </p>
              </div>
              <NotificationDashboard />
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Criar Nova Notificação Extrajudicial
                </h2>
                <p className="text-muted-foreground">
                  Preencha os dados para gerar uma notificação conforme a legislação brasileira
                </p>
              </div>
              <NotificationForm onSuccess={handleNotificationCreated} />
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <div className="max-w-5xl mx-auto">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Preview da Notificação
                </h2>
                <p className="text-muted-foreground">
                  Revise o documento antes de finalizar
                </p>
              </div>
              {currentNotificationId && (
                <NotificationPreview 
                  notificationId={currentNotificationId}
                  onAccept={() => {
                    // Could trigger some action after acceptance
                  }}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            <div className="max-w-3xl mx-auto">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Buscar e Verificar Notificação
                </h2>
                <p className="text-muted-foreground">
                  Verifique a autenticidade de uma notificação através do token ou hash
                </p>
              </div>
              <NotificationSearch 
                onViewPreview={(id) => {
                  setCurrentNotificationId(id);
                  setActiveTab("preview");
                }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>© 2025 MR3X - Gestão e Tecnologia em Pagamentos de Aluguéis</p>
          <p className="mt-1">Sistema de Notificação Extrajudicial - Conforme Legislação Brasileira</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;