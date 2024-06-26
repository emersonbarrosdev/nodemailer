import  'dotenv/config'
const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors"); // Importe o módulo CORS
const server = express();
const port = process.env.PORT || 3000; // Use a variável de ambiente para a porta
const { parsePhoneNumberFromString } = require("libphonenumber-js");

//Configurar o middleware CORS
server.use(cors());

//configurar o body-parser para analisar dados de formulário
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

//Rota para lidar com o envio do formulário
server.post("/send-email", (req, res) => {
  const { fullName, email, phone, eventType, numberOfPeoples, message } =
    req.body;

  // Formatar o número de telefone se estiver preenchido
  let formattedPhone = "-";
  if (phone) {
    formattedPhone = parsePhoneNumberFromString(phone, "BR");
    if (formattedPhone) {
      formattedPhone = formattedPhone.formatNational();
    } else {
      // Se o número de telefone não puder ser formatado, use o valor original
      formattedPhone = phone;
    }
  }

  let formattedNumberOfPeoples = numberOfPeoples || "-";
  let formattedMessage = message || "-";

  //configurar transporte de email
  const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: "587",
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  //configurar o email a ser enviado
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: fullName.toUpperCase(),
    html: `
    <table style="border-collapse: collapse; width: 60%; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
      <tr style="background-color: #23372C; border-top-left-radius: 10px; border-top-right-radius: 10px;">
        <td colspan="2" style="padding: 12px; text-align: center; color: #F1E9D4;"><h3>DETALHES DO CLIENTE</h3></td>
      </tr>
      <tr style="background-color: #f2f2f2;">
        <td style="padding: 12px; text-align: right; font-weight: bold; border-bottom: 1px solid #ddd;">Nome:</td>
        <td style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">${fullName}</td>
      </tr>
      <tr style="background-color: #fff;">
        <td style="padding: 12px; text-align: right; font-weight: bold; border-bottom: 1px solid #ddd;">E-mail:</td>
        <td style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">${email}</td>
      </tr>
      <tr style="background-color: #f2f2f2;">
        <td style="padding: 12px; text-align: right; font-weight: bold; border-bottom: 1px solid #ddd;">Celular:</td>
        <td style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">${formattedPhone}</td>
      </tr>
      <tr style="background-color: #fff;">
        <td style="padding: 12px; text-align: right; font-weight: bold; border-bottom: 1px solid #ddd;">Evento:</td>
        <td style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">${eventType}</td>
      </tr>
      <tr style="background-color: #f2f2f2;">
        <td style="padding: 12px; text-align: right; font-weight: bold; border-bottom: 1px solid #ddd;">Pessoas:</td>
        <td style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">${formattedNumberOfPeoples}</td>
      </tr>
      <tr style="background-color: #fff;">
        <td style="padding: 12px; text-align: right; font-weight: bold; border-bottom: 1px solid #ddd;">Mensagem:</td>
        <td style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">${formattedMessage}</td>
      </tr>
    </table>
  `,
  };

  //Enviar email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Erro ao enviar e-mail:", error);
      res.status(500).json({
        error: "Backend - Erro ao enviar e-mail. Por favor, tente novamente.",
      });
    } else {
      console.log("E-mail enviado:", info.response);
      res.status(200).json({
        message: "Backend - E-mail enviado com sucesso!",
        data: req.body,
      });
    }
  });
});

// Iniciar o servidor
server.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

module.exports = server;
