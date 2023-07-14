const sgMail = require('@sendgrid/mail')
const sendgridApiKey = process.env.SENDGRID_API_KEY;
const fromMail=process.env.FROM_MAIL
// this lets send grid know it is associated with account of this key
sgMail.setApiKey(sendgridApiKey);

// sending mail is asynchronous  '' send '' method  returns promise

const sendWelcomeMail=(email,name)=>{

  sgMail.send({
        to: email, // Change to your recipient
        from: fromMail, // Change to your verified sender
        subject: 'Thanks For Joining in .. ',
        text: `Welcome to the app ${name} . Let us know how you get along with the app`,
      }).then(rs=>console.log("email sent")).catch(e=>console.log(e))
}

const sendDeleteMail=(email,name)=>{

  sgMail.send({
      to: email, // Change to your recipient
      from: fromMail, // Change to your verified sender
      subject: `Good Bye ${name} .. `,
      text: `Thanks ${name} for being the part of our community , Do let us know why you decided to leave us, Hope to see you back sometime soon`,
     // html: '<strong>Thanks for being a part of our Community</strong>',
    }).then(rs=>console.log("email sent")).catch(e=>console.log(e))
}

module.exports = {
    sendWelcomeMail,sendDeleteMail
}
