"use client";

import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      <LandingHeader />
      <main className="flex-1 container mx-auto px-4 py-8 md:px-6 md:py-12 lg:py-16">
        <section id="termos" className="mb-10 space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold border-b-2 border-primary pb-4 mb-6 text-primary">
            Termos de Uso – ChurchOn
          </h1>
          <p className="text-sm text-muted-foreground">
            <strong>Última atualização:</strong> 13 de Outubro de 2025
          </p>

          <p className="mb-4 text-muted-foreground leading-relaxed">
            Bem-vindo(a) ao <strong className="text-foreground">ChurchOn</strong>, um software como serviço (SaaS) desenvolvido para auxiliar igrejas
            na gestão administrativa e ministerial. Ao utilizar o ChurchOn, você concorda com estes Termos de Uso.
          </p>

          <h2 className="text-2xl md:text-3xl font-semibold mt-8 mb-4 text-foreground">1. Aceitação dos Termos</h2>
          <p className="mb-4 text-muted-foreground leading-relaxed">
            O uso do ChurchOn implica concordância integral com estes Termos. Caso não concorde, interrompa o uso da plataforma.
          </p>

          <h2 className="text-2xl md:text-3xl font-semibold mt-8 mb-4 text-foreground">2. Cadastro e Conta</h2>
          <p className="mb-4 text-muted-foreground leading-relaxed">
            O acesso exige conta de usuário. O titular deve fornecer informações verdadeiras e manter a confidencialidade da senha.
            Toda atividade realizada sob a conta é de responsabilidade do usuário.
          </p>

          <h2 className="text-2xl md:text-3xl font-semibold mt-8 mb-4 text-foreground">3. Planos e Pagamentos</h2>
          <p className="mb-4 text-muted-foreground leading-relaxed">
            O uso do ChurchOn pode estar sujeito a planos pagos, conforme valores exibidos no site ou aplicativo.
            O não pagamento poderá suspender ou encerrar o acesso.
            Pagamentos são processados de forma segura por prestadores autorizados.
          </p>

          <h2 className="text-2xl md:text-3xl font-semibold mt-8 mb-4 text-foreground">4. Uso Permitido</h2>
          <p className="mb-4 text-muted-foreground leading-relaxed">
            O usuário compromete-se a usar o sistema apenas para fins legítimos. É proibido:
            uso para atividades ilícitas, tentativa de acesso não autorizado,
            violação de direitos de propriedade intelectual ou alteração do código da aplicação.
          </p>

          <h2 className="text-2xl md:text-3xl font-semibold mt-8 mb-4 text-foreground">5. Propriedade Intelectual</h2>
          <p className="mb-4 text-muted-foreground leading-relaxed">
            Todo o conteúdo, design e código do ChurchOn pertencem exclusivamente à ChurchOn e são protegidos por leis de direitos autorais.
          </p>

          <h2 className="text-2xl md:text-3xl font-semibold mt-8 mb-4 text-foreground">6. Limitação de Responsabilidade</h2>
          <p className="mb-4 text-muted-foreground leading-relaxed">
            A ChurchOn não se responsabiliza por danos indiretos, falhas de conexão, perda de dados ou conteúdo inserido por usuários.
            O serviço é oferecido “como está”, podendo haver atualizações e interrupções temporárias.
          </p>

          <h2 className="text-2xl md:text-3xl font-semibold mt-8 mb-4 text-foreground">7. Suporte e Comunicação</h2>
          <p className="mb-4 text-muted-foreground leading-relaxed">
            O suporte é prestado pelos canais oficiais indicados no site ou aplicativo.
          </p>

          <h2 className="text-2xl md:text-3xl font-semibold mt-8 mb-4 text-foreground">8. Cancelamento e Encerramento</h2>
          <p className="mb-4 text-muted-foreground leading-relaxed">
            O usuário pode encerrar sua conta a qualquer momento. A ChurchOn pode suspender ou encerrar contas
            que violem estes Termos ou causem prejuízos à plataforma.
          </p>

          <h2 className="text-2xl md:text-3xl font-semibold mt-8 mb-4 text-foreground">9. Alterações dos Termos</h2>
          <p className="mb-4 text-muted-foreground leading-relaxed">
            A ChurchOn poderá modificar estes Termos de Uso a qualquer momento. O uso continuado após as alterações
            representa aceitação das novas condições.
          </p>

          <h2 className="text-2xl md:text-3xl font-semibold mt-8 mb-4 text-foreground">10. Foro e Legislação Aplicável</h2>
          <p className="mb-4 text-muted-foreground leading-relaxed">
            Estes Termos são regidos pelas leis do Brasil. Fica eleito o foro da comarca do domicílio do usuário
            para dirimir controvérsias relacionadas ao uso da plataforma.
          </p>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}