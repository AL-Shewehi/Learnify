import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const sendEmail = async ({
  to,
  subject,
  html,
}: EmailOptions): Promise<void> => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM, DEVELOPMENT } =
    process.env;

  if (DEVELOPMENT === "true") {
    console.log("📧 ============ EMAIL (DEV MODE) ============");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(html.replace(/<[^>]*>/g, ""));
    console.log("📧 ==========================================");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  })

  await transporter.sendMail({
    from: EMAIL_FROM || "LMS Platform <noreply@lmsplatform.com>",
    to,
    subject,
    html,
  })
};

export default sendEmail;