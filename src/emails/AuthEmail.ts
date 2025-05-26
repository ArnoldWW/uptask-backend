import { transport } from "../config/nodemailer";

interface IEmail {
  email: string;
  name: string;
  token: string;
}

export class AuthEmail {
  // Method to send email to confirm account
  static async sendConfirmationEmail(user: IEmail) {
    try {
      const info = await transport.sendMail({
        from: "uptask@uptask.com",
        to: user.email.toString(),
        subject: "UPTASK - Confirmación de cuenta",
        html: `
          <h1>Bienvenido a Uptask</h1>
          <p>Hola ${user.name}; Para confirmar tu cuenta, haz click en el siguiente enlace e ingresa el siguiente token:
            <strong>${user.token}</strong>
          </p>
          <p><a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar cuenta</a></p>
          <p>El token es valido por 10 minutos.</p>
          <p>¡Gracias por usar Uptask!</p>
          <p>El equipo de Uptask</p>
        `
      });

      console.log("Email sent: ", info.messageId);
    } catch (error) {
      console.log(error);
    }
  }

  // Method to send email to reset password
  static async sendResetPasswordEmail(user: IEmail) {
    try {
      const info = await transport.sendMail({
        from: "uptask@uptask.com",
        to: user.email.toString(),
        subject: "UPTASK - Restablecer contraseña",
        html: `
          <h1>Restablecer contraseña</h1>
          <p>Hola ${user.name}; Para resetear tu contraseña, haz click en el siguiente enlace e ingresa el siguiente token: 
            <strong>${user.token}</strong>
          </p>
          <p><a href="${process.env.FRONTEND_URL}/auth/new-password">Restablecer contraseña</a></p>
          <p>El token es valido por 10 minutos.</p>
          <p>¡Gracias por usar Uptask!</p>
          <p>El equipo de Uptask</p>
        `
      });

      console.log("Email sent: ", info.messageId);
    } catch (error) {
      console.log(error);
    }
  }
}
