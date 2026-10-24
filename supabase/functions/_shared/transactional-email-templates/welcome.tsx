/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface WelcomeProps {
  name?: string
}

const LOGO_URL = 'https://magnetize.site/app-icon-512.png'
const APP_URL = 'https://magnetize.site/dashboard'

export function WelcomeEmail({ name }: WelcomeProps) {
  const displayName = (name || '').trim() || 'lá'

  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Sua conta na Magnetize está pronta — ela está te esperando 🔥</Preview>
      <Body style={main}>
        <Container style={wrapper}>
          {/* Cartão escuro principal */}
          <Section style={card}>
            <Img src={LOGO_URL} alt="Magnetize" width="64" height="64" style={logo} />
            <Text style={brand}>MAGNETIZE</Text>

            <Heading style={h1}>E aí, {displayName} 👋</Heading>
            <Text style={subtitle}>
              Sua conta foi criada com sucesso. Agora é só
              <strong style={{ color: '#ffffff' }}> gerar sem limites</strong> — a sua
              geração está te esperando do outro lado.
            </Text>

            <Section style={stepsBox}>
              <Text style={step}>
                <span style={stepNumber}>1</span>&nbsp;&nbsp;Escolha o que quer criar
              </Text>
              <Text style={step}>
                <span style={stepNumber}>2</span>&nbsp;&nbsp;Envie a foto dela
              </Text>
              <Text style={{ ...step, marginBottom: '0' }}>
                <span style={stepNumber}>3</span>&nbsp;&nbsp;Receba o resultado na hora
              </Text>
            </Section>

            <Button style={button} href={APP_URL}>
              Acessar o site →
            </Button>

            <Text style={hint}>
              Toque no botão acima para entrar direto na sua conta e continuar de onde parou.
            </Text>
          </Section>

          {/* Rodapé */}
          <Section style={footerSection}>
            <Text style={footer}>
              Você recebeu este e-mail porque criou uma conta na Magnetize.
            </Text>
            <Text style={footer}>© 2026 Magnetize · magnetize.site</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: WelcomeEmail,
  subject: (data: Record<string, any>) =>
    `Bem-vindo à Magnetize${data?.name ? `, ${String(data.name).trim()}` : ''} 🔥`,
  displayName: 'Boas-vindas',
  previewData: { name: 'Lucas' },
} satisfies TemplateEntry

// ---------- Estilos (identidade Magnetize: carvão + brasa) ----------

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  padding: '24px 0',
}

const wrapper = {
  margin: '0 auto',
  maxWidth: '560px',
}

const card = {
  backgroundColor: '#0d0d12',
  borderRadius: '20px',
  padding: '40px 28px',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 auto',
  borderRadius: '16px',
}

const brand = {
  color: '#8a8a96',
  fontSize: '12px',
  letterSpacing: '4px',
  margin: '16px 0 0',
}

const h1 = {
  color: '#fafafa',
  fontSize: '30px',
  fontWeight: '800' as const,
  lineHeight: '1.25',
  margin: '24px 0 8px',
}

const subtitle = {
  color: '#a1a1ab',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 28px',
}

const stepsBox = {
  backgroundColor: '#16161d',
  border: '1px solid #26262f',
  borderRadius: '14px',
  padding: '18px 22px',
  margin: '0 0 28px',
  textAlign: 'left' as const,
}

const step = {
  color: '#d4d4d8',
  fontSize: '15px',
  margin: '0 0 12px',
  lineHeight: '1.5',
}

const stepNumber = {
  display: 'inline-block',
  backgroundColor: '#f32525',
  color: '#ffffff',
  fontWeight: '700' as const,
  fontSize: '13px',
  borderRadius: '999px',
  width: '22px',
  height: '22px',
  lineHeight: '22px',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#f32525',
  borderRadius: '999px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '17px',
  fontWeight: '700' as const,
  padding: '16px 40px',
  textDecoration: 'none',
}

const hint = {
  color: '#71717a',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: '22px 0 0',
}

const footerSection = {
  padding: '24px 16px 0',
  textAlign: 'center' as const,
}

const footer = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '0 0 6px',
}
