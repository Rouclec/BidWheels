const nodemailer = require("nodemailer");

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
}
