import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Heading,
  render,
} from "@react-email/components"
import * as React from "react"

interface EmailConfirmation {
  fullName: string
  verifyUrl: string
}

export const EmailConfirmation = ({
  fullName,
  verifyUrl,
}: EmailConfirmation) => (
  <Html>
    <Head />
    <Preview>Please confirm your email address</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading as="h2">Hi {fullName}</Heading>
        <Text style={paragraph}>
          Thanks for creating account. Please verify your email address by
          clicking the button below.
        </Text>
        <Section style={btnContainer}>
          <Button style={button} href={verifyUrl}>
            Verify Email Address
          </Button>
        </Section>
        <Text style={paragraph}>
          Best,
          <br />
          The Go Out team
        </Text>
        <Hr style={hr} />
        <Text style={footer}>13930 East Jakarta, Indonesia</Text>
      </Container>
    </Body>
  </Html>
)

export default EmailConfirmation

export function emailConfirmation(fullName: string, verifyUrl: string) {
  return render(<EmailConfirmation fullName={fullName} verifyUrl={verifyUrl} />)
}

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
}

const logo = {
  margin: "0 auto",
}

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
}

const btnContainer = {
  textAlign: "center" as const,
}

const button = {
  backgroundColor: "#656ee8",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 16px",
}

const hr = {
  borderColor: "#cccccc",
  margin: "20px 0",
}

const footer = {
  color: "#8898aa",
  fontSize: "12px",
}
