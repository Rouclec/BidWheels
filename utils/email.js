const nodemailer = require("nodemailer");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.fullname.split(" ")[0];
    this.url = url;
    this.from = `Bid4Wheels ${process.env.EMAIL_FROM}`;
  }

  newTransport() {
    //     if (process.env.NODE_ENV === "production") {
    //       //TODO: create a transporter for sendgrid
    //       return 1;
    //     } else {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      //Activate less secure app options in gmail
    });
    //     }
  }

  //send the actual email
  async send(subject, message) {
    //define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html: message,
    };

    //create a transport and send mail
    await this.newTransport().sendMail(mailOptions);
  }

  async sendPasswordReset() {
    await this.send(
      "Your password reset token (Valid for only 10 minutes)",
      `Hi, ${
        this.firstName
      }, ${"\n"} Forgot your password? Submite a PATCH request to this <a href="${
        this.url
      }">link</a>: ${"\n\n"} If you didn't forget your password, please ignore this message ${"\n"} -MIROUVETTE, CEO ${"\n"} Bid4Wheels Inc, Iknite Hackaton street, Buea Cameroon`
    );
  }

  async verificationMail() {
    await this.send(
      "Your account has been successfully verified",
      `Hello, ${this.firstName} your Bid 4 Wheels seller's account has been successfully verified. Please <a href="${this.url}">login</a> again to enjoy our services`
    );
  }
};

module.exports = class BiddingEmail {
  constructor(user, productName) {
    this.to = user.email;
    this.firstName = user.fullname.split(" ")[0];
    this.productName = productName;
    this.from = `Bid4Wheels ${process.env.EMAIL_FROM}`;
  }

  newTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      //Activate less secure app options in gmail
    });
    //     }
  }

  //send the actual email
  async send(subject, message) {
    //define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html: message,
    };

    //create a transport and send mail
    await this.newTransport().sendMail(mailOptions);
  }

  async sendBiddingWonMail() {
    await this.send(
      "You won the bidding!",
      `Hello ${this.firstName} you have won the bidding for ${this.productName}, Please complete the payment within 2 days to secure this item!`
    );
  }
};
