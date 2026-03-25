import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Section,
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface UpgradeEmailProps {
  name: string;
}

export const UpgradeEmail = ({ name }: UpgradeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Account Upgraded - PRO Tier</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Thank you for Upgrading, {name}!</Heading>
          <Text style={text}>
            Your account has been successfully upgraded to the PRO Tier. You now have access to unlimited simulations, advanced exports, and full API capabilities.
          </Text>
          <Section style={btnContainer}>
            <Button style={button} href="https://localhost:3000/dashboard">
              Generate API Keys
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            AI Reliability Platform • Secure & robust AI products.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default UpgradeEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0 0 20px',
  padding: '0 48px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 20px',
  padding: '0 48px',
};

const btnContainer = {
  textAlign: 'center' as const,
  padding: '0 48px',
};

const button = {
  backgroundColor: '#0052FF',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '12px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 48px',
};
