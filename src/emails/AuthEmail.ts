import { transport } from "../config/nodemailer";

interface IEmail {
  email: string;
  name: string;
  token: string;
}

export class AuthEmail {
  static async sendConfirmationEmail(user: IEmail) {
    try {
      const info = await transport.sendMail({
        from: "uptask@uptask.com",
        to: user.email.toString(),
        subject: "Confirmación de cuenta",
        html: `
          <h1>Bienvenido a Uptask</h1>
          <p>Hola ${user.name}, Para confirmar tu cuenta, haz click en el siguiente enlace e ingresa el siguiente token:
            <strong>${user.token}</strong>
          </p>
          <p><a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar cuenta</a></p>
          <p>El token es valido por 10 minutos.</p>
          <p>¡Gracias por usar Uptask!</p>
          <p>El equipo de Uptask</p>
        `,
      });

      console.log("Email sent: ", info.messageId);
    } catch (error) {
      console.log(error);
    }
  }
}
