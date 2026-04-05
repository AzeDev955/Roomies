import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env['EMAIL_USER'],
    pass: process.env['EMAIL_PASS'],
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error('❌ Error de conexión Nodemailer:', error);
  } else {
    console.log('✅ Nodemailer conectado a Gmail correctamente');
  }
});

export async function enviarMagicLink(email: string, nombre: string, token: string): Promise<void> {
  const url = `${process.env['BACKEND_URL'] ?? 'http://localhost:3001'}/api/auth/verificar/${token}`;

  try {
    await transporter.sendMail({
      from: `"Roomies App" <${process.env['EMAIL_USER']}>`,
      to: email,
      subject: '¡Bienvenido a Roomies! Verifica tu cuenta',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #212529;">
          <h2 style="color: #007AFF; margin-bottom: 8px;">¡Hola, ${nombre}!</h2>
          <p style="color: #6c757d; margin-bottom: 24px;">
            Gracias por unirte a Roomies. Pulsa el botón para verificar tu correo y activar tu cuenta.
          </p>
          <a href="${url}"
             style="display: inline-block; background-color: #007AFF; color: #ffffff;
                    text-decoration: none; padding: 14px 28px; border-radius: 12px;
                    font-weight: 600; font-size: 16px;">
            Verificar mi cuenta
          </a>
          <p style="color: #9e9e9e; font-size: 13px; margin-top: 32px;">
            Si no te has registrado en Roomies, puedes ignorar este correo.<br/>
            El enlace expira en 24 horas.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('❌ Error al enviar el correo:', error);
    throw error;
  }
}
