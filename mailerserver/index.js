const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const sendMail = async (data) => {

  const helpmessages = JSON.stringify(data.helpmessage);
  const messages = JSON.stringify(data.messages);

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: data.fromEmail,
      pass: data.password,
    },
  });

  // Use the transporter to send emails
  try {
    const res = await transporter.sendMail({
      from: data.fromEmail,
      to: data.toEmail,
      subject: "Hello",
      html: messages,
      text: helpmessages,
    });
    console.log(res);
  } catch (error) {
    console.log(error);
  }
};



app.post('/', async (req, res) => {
  console.log("here is now");
  console.log(req.body);
  // const { title, content } = req.body;
  // Do something with the name and email data

  sendMail(req.body);


  res.status(201).json({ message: 'User created successfully' });
});


app.listen(3000, () => console.log('server'))