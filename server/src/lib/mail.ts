import * as nodemailer from "nodemailer";
import Email from "../models/email";
import { collaboratorHTML } from "../templates/collaborator-invite";
import { submitContactMessageHTML } from "../templates/submit-contact-form";
import { submitPodcastHTML } from "../templates/submit-podcast";
import { submitPodcastReplyHTML } from "../templates/submit-podcast-reply";
import { verificationHTML } from "../templates/verification";

const transporter = nodemailer.createTransport({
    host: "smtp.mailgun.org",
    port: 465,
    secure: true,
    auth: {
        user: "",
        pass: "",
    },
});

export async function sendColabInvite(email: string, userID: any, podcastID: any) {
    const data = await Email.create({
        user: userID,
        transaction: "invite",
        podcast: podcastID,
    });

    const mailOptions = {
        from: '"Podsheets" <noreply@podsheets.com>',
        to: email,
        subject: "Invitation",
        text: "You have been invited to collaborate on Podsheets",
        html: collaboratorHTML(String(data._id)),
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            // tslint:disable-next-line:no-console
            return console.log(error);
        }
    });
}

export async function sendPodcastSubmission(id: string, title: string, email: string, rssFeed: string) {
    let mailOptions = {
        from: '"Podsheets" <noreply@podsheets.com>',
        to: "podsheets@gmail.com",
        subject: "[Podcast Submission] - New podcast submission",
        text: "include the information of the submission here",
        html: submitPodcastHTML(id, email, rssFeed),
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            // tslint:disable-next-line:no-console
            return console.log(error);
        }
    });

    mailOptions = {
        from: '"Podsheets" <noreply@podsheets.com>',
        to: email,
        subject: "[Podcast Submission] - " + title,
        text: "We have received your podcast for submission to iTunes and Google Play",
        html: submitPodcastReplyHTML(title),
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            // tslint:disable-next-line:no-console
            return console.log(error);
        }
    });
}

export async function sendContactMessage(name: string, email: string, message: string, podcastEmail: string) {
    const mailOptions = {
        from: '"Podsheets" <noreply@podsheets.com>',
        to: podcastEmail,
        subject: "[New Message] - You have received a message.",
        text: "You have received a new message",
        html: submitContactMessageHTML(name, email, message),
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            // tslint:disable-next-line:no-console
            return console.log(error);
        }
    });
}

export async function sendVerification(email: string, userID: any) {

    const data = await Email.create({
        user: userID,
        transaction: "verification",
    });

    const mailOptions = {
        from: '"Podsheets" <noreply@podsheets.com>',
        to: email,
        subject: "Welcome to Podsheets",
        text: "Please verify your email",
        html: verificationHTML(String(data._id)),
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            // tslint:disable-next-line:no-console
            return console.log(error);
        }
    });
}
