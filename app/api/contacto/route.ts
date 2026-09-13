import nodemailer from "nodemailer";

// Este endpoint es 100% genérico: no tiene ningún correo ni credencial
// escrita en el código. Cada sitio (cada cliente que arriende esta
// plantilla) configura sus propias variables de entorno y los mensajes
// del formulario de contacto le llegarán a su propio correo.
//
// Variables de entorno requeridas (ver .env.local.example):
// - CONTACT_EMAIL_USER : correo Gmail que ENVÍA el mensaje (la cuenta de la app)
// - CONTACT_EMAIL_PASS : contraseña de aplicación de ese correo Gmail
// - CONTACT_EMAIL_TO   : correo que RECIBE los mensajes (puede ser el mismo
//                        que CONTACT_EMAIL_USER si no se define aparte)

export async function POST(req: Request) {
  try {
    const { nombre, email, mensaje } = await req.json();

    if (!nombre || !email || !mensaje) {
      return Response.json(
        { success: false, error: "Faltan campos obligatorios." },
        { status: 400 }
      );
    }

    const user = process.env.CONTACT_EMAIL_USER;
    const pass = process.env.CONTACT_EMAIL_PASS;
    const to = process.env.CONTACT_EMAIL_TO || user;

    if (!user || !pass || !to) {
      console.error(
        "Faltan variables de entorno CONTACT_EMAIL_USER / CONTACT_EMAIL_PASS / CONTACT_EMAIL_TO"
      );
      return Response.json(
        { success: false, error: "El formulario de contacto no está configurado." },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });

    await transporter.sendMail({
      // Gmail rechaza (o marca como spam) correos que dicen venir de un
      // remitente distinto al autenticado, así que el "from" siempre es
      // la cuenta configurada y usamos "replyTo" para poder responderle
      // directamente al visitante desde el cliente de correo.
      from: `"Formulario de contacto" <${user}>`,
      replyTo: email,
      to,
      subject: `Nuevo mensaje de ${nombre}`,
      text: `De: ${nombre} <${email}>\n\n${mensaje}`,
      html: `
        <h3>Nuevo mensaje desde el formulario de contacto</h3>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${mensaje}</p>
      `,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error enviando correo:", error);
    return Response.json({ success: false, error: "No se pudo enviar el mensaje." }, { status: 500 });
  }
}
