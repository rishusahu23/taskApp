const sgMail=require('@sendgrid/mail')


sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail=(email,name)=>{
    sgMail.send({
        to:email,
        from:'rishusahu23@gmail.com',
        subject:'Thanks for joining in',
        text:`Welocme to app, ${name}. Let me know how you go along with app `
    })
}

const sendDeleteAccountEmail=(email,name)=>{
    sgMail.send({
        to:email,
        from:'rishusahu23@gmail.com',
        subject:'Thanks for your service',
        text:`Please provide some fedback, why are you deleting your account`
    })
}

module.exports={
    sendWelcomeEmail,
    sendDeleteAccountEmail
}

