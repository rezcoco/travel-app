import { Resend } from 'resend';

const resend = new Resend("re_QBXVSAjY_KjhtquhPtm1eK1QYhcwPYPZt");

export async function sendEmail(email: string, subject: string, data: any) {
  await resend.emails.send({
    from: 'Go Out <notifications@goout.my.id>',
    to: email,
    subject,
    html: data
  });
}