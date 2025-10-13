"use client";

import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      <LandingHeader />
      <main className="flex-1 container mx-auto px-4 py-8 md:px-6 md:py-12 lg:py-16">
        <section id="privacidade" className="mb-10 space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold border-b-2 border-primary pb-4 mb-6 text-primary">
            Política de Privacidade – ChurchOn
          </h1>
          <p className="text-sm text-muted-foreground">
            <strong>Última atualização:</strong> 25 de Julho de 2024
          </p>

          <p className="mb-4 text-muted-foreground leading-relaxed">
            A <strong className="text-foreground">ChurchOn</strong> valoriza a privacidade e a segurança dos dados de seus usuários.
            Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos as informações pessoais
            fornecidas pelos usuários em nossa plataforma de gestão de igrejas.
          </p>

          <h2 className="text-2xl md:text-3xl font-semibold mt-8 mb-4 text-foreground">1. Coleta de Informações</h2>
          <p className="mb-4 text-muted-foreground leading-relaxed">
            Ao utilizar o ChurchOn, podemos coletar as seguintes informações:
            nome, e-mail, telefone, senha, dados da igreja, informações de pagamento (processadas com segurança)
            e dados técnicos como IP e dispositivo.
          </p>

          <h2 className="text-2xl md:text-3xl font-semibold mt-8 mb-4 text-foreground">2. Finalidade do Tratamento</h2>
          <p className="mb-4 text-muted-foreground leading-relaxed">
            Os dados são utilizados para criar e gerenciar contas, processar pagamentos,
            oferecer suporte, enviar comunicações e melhorar a experiência do usuário.
          </p>

          <h2 className="text-2xl md:text-3xl font-semibold mt-8 mb-4 text-foreground">3. Base Legal</h2>
          <p className="mb-4 text-muted-foreground leading-relaxed">
            O tratamento é realizado conforme a <strong className="text-foreground">Lei nº 13.709/2018 (LGPD)</strong>,
            com base em execução de contrato, obrigação legal, legítimo interesse e consentimento do usuário.
          </p>

          <h2 className="text-2xl md:text-3xl font-semibold mt-8 mb-4 text-foreground">4. Compartilhamento de Dados</h2>
          <p className="mb-4 text-muted-foreground leading-relaxed">
            A ChurchOn não vende dados pessoais. O compartilhamento ocorre apenas com prestadores de serviços essenciais
            (pagamentos, hospedagem, e-mails) ou autoridades, quando exigido por lei.
          </p>

          <h2 className="text-2xl md:text-3xl font-semibold mt-8 mb-4 text-foreground">5. Armazenamento e Segurança</h2>
          <p className="mb-4 text-muted-foreground leading-relaxed">
            Adotamos medidas técnicas e organizacionais para proteger os dados contra acesso não autorizado, perda ou uso indevido.
            As informações são armazenadas em servidores seguros.
          </p>

          <h2 className="text-2xl md:text-3xl font-semibold mt-8 mb-4 text-foreground">6. Direitos do Usuário</h2>
          <p className="mb-4 text-muted-foreground leading-relaxed">
            O usuário pode solicitar acesso, correção, exclusão ou portabilidade dos seus dados a qualquer momento,
            bem como revogar consentimentos, através do canal de contato disponível no site ou aplicativo.
          </p>

          <h2 className="text-2xl md:text-3xl font-semibold mt-8 mb-4 text-foreground">7. Retenção de Dados</h2>
          <p className="mb-4 text-muted-foreground leading-relaxed">
            Os dados serão mantidos enquanto necessários à prestação do serviço e cumprimento de obrigações legais.
          </p>

          <h2 className="text-2xl md:text-3xl font-semibold mt-8 mb-4 text-foreground">8. Alterações nesta Política</h2>
          <p className="mb-4 text-muted-foreground leading-relaxed">
            A ChurchOn poderá atualizar esta Política a qualquer momento, mediante aviso no site ou aplicativo.
          </p>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}