import {
    Body,
    Column,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Link,
    Preview,
    Row,
    Section,
    Text,
} from '@react-email/components';
import * as React from 'react';

import { BASE_URL } from '../../config';

interface ForgotPasswordEmailProps {
    validationCode?: string;
}

export const ForgotPasswordEmail = ({ validationCode }: ForgotPasswordEmailProps) => (
    <Html>
        <Head />
        <Preview>Confirm your password change</Preview>
        <Body style={main}>
            <Container style={container}>
                <Section style={logoContainer}>
                    <Img src={`${BASE_URL}/static/email_logo.png`} width="120" alt="Slack" />
                </Section>
                <Heading style={h1}>Confirm your reset password</Heading>
                <Text style={heroText}>Your reset password code is below. Enter this code to reset your password.</Text>

                <Section style={codeBox}>
                    <Text style={confirmationCodeText}>{validationCode}</Text>
                </Section>

                <Text style={text}>
                    If you didn't request this email, there's nothing to worry about, you can safely ignore it.
                </Text>

                <Section>
                    <Row style={footerLogos}>
                        <Column style={{ width: '66%' }}>
                            <Img src={`${BASE_URL}/static/email_logo.png`} width="120" alt="Slack" />
                        </Column>
                        <Column>
                            <Section>
                                <Row>
                                    <Column>
                                        <Link href="https://x.com/officialJKT48">
                                            <Img
                                                src={`${BASE_URL}/static/slack-twitter.png`}
                                                width="32"
                                                height="32"
                                                alt="Slack"
                                                style={socialMediaIcon}
                                            />
                                        </Link>
                                    </Column>
                                    <Column>
                                        <Link href="https://www.instagram.com/jkt48/">
                                            <Img
                                                src={`${BASE_URL}/static/slack-instagram.png`}
                                                width="32"
                                                height="32"
                                                alt="Slack"
                                                style={socialMediaIcon}
                                            />
                                        </Link>
                                    </Column>
                                    <Column>
                                        <Link href="https://www.facebook.com/official.JKT48/">
                                            <Img
                                                src={`${BASE_URL}/static/slack-facebook.png`}
                                                width="32"
                                                height="32"
                                                alt="Slack"
                                                style={socialMediaIcon}
                                            />
                                        </Link>
                                    </Column>
                                </Row>
                            </Section>
                        </Column>
                    </Row>
                </Section>

                <Section>
                    <Link style={footerLink} href="https://jkt48.com/" target="_blank" rel="noopener noreferrer">
                        Home
                    </Link>
                    &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
                    <Link style={footerLink} href="https://slack.com/legal" target="_blank" rel="noopener noreferrer">
                        Policies
                    </Link>
                    &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
                    <Link style={footerLink} href="https://jkt48.com/member/" target="_blank" rel="noopener noreferrer">
                        Member
                    </Link>
                    <Text style={footerText}>
                        ©{new Date().getFullYear()} PT. TOEI TECHNO INTERNATIONAL INDONESIA <br />
                        EightyEight @ Kasablanka Office Tower 26 Floor <br />
                        <br />
                        All rights reserved.
                    </Text>
                </Section>
            </Container>
        </Body>
    </Html>
);

ForgotPasswordEmail.PreviewProps = {
    validationCode: 'DJZ-TLX',
} as ForgotPasswordEmailProps;

export default ForgotPasswordEmail;

const footerText = {
    fontSize: '12px',
    color: '#b7b7b7',
    lineHeight: '15px',
    textAlign: 'left' as const,
    marginBottom: '50px',
};

const footerLink = {
    color: '#b7b7b7',
    textDecoration: 'underline',
};

const footerLogos = {
    marginBottom: '32px',
    paddingLeft: '8px',
    paddingRight: '8px',
    width: '100%',
};

const socialMediaIcon = {
    display: 'inline',
    marginLeft: '32px',
};

const main = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

const container = {
    margin: '0 auto',
    padding: '0px 20px',
};

const logoContainer = {
    marginTop: '32px',
};

const h1 = {
    color: '#1d1c1d',
    fontSize: '36px',
    fontWeight: '700',
    margin: '30px 0',
    padding: '0',
    lineHeight: '42px',
};

const heroText = {
    fontSize: '20px',
    lineHeight: '28px',
    marginBottom: '30px',
};

const codeBox = {
    background: 'rgb(245, 244, 245)',
    borderRadius: '4px',
    marginBottom: '30px',
    padding: '40px 10px',
};

const confirmationCodeText = {
    fontSize: '30px',
    textAlign: 'center' as const,
    verticalAlign: 'middle',
};

const text = {
    color: '#000',
    fontSize: '14px',
    lineHeight: '24px',
};
