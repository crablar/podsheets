import * as express from "express";
import * as _ from "lodash";
import { Types } from "mongoose";
import * as PodcastRSS from "podcast";
import * as stripePackage from "stripe";
import * as convert from "xml-js";
import config from "../config";
import * as auth from "../lib/auth";
import { logger } from "../lib/logger";
import Analytic from "../models/analytic";
import Episode, { IEpisode } from "../models/episode";
import Podcast, { IPodcast } from "../models/podcast";
import User, { IUser } from "../models/user";

const stripe = stripePackage(config.stripe.secretKey);

async function getSelectedPodcast(userId) {
    const podcasts = await Podcast.find({ owner: userId });
    const user = await User.findOne({ _id: userId });
    const selectedPodcast = user.selectedPodcast;
    if (podcasts.length > 0) {
        if (selectedPodcast) {
            // The user has a selected podcast
            const podcast = _.find(podcasts, { _id: selectedPodcast });
            if (podcast) {
                return podcast._id;
            } else if (podcasts.length > 0) {
                return podcasts[0]._id;
            } else {
                return undefined;
            }
        } else {
            // The user doesn't have a selected podcast falling back to first in array
            return podcasts[0]._id;
        }
    } else {
        return undefined;
    }
}

const getPlanId = (storageAmount) => {
    switch (storageAmount) {
        case 300:
            return "basic-monthly";
        case 1000:
            return "intermediate-monthly";
        case 2500:
            return "advanced-monthly";
    }
};

/* Create Stripe Plans */

// Basic Plan
stripe.plans.create({
    name: "Basic Plan",
    id: "basic-monthly",
    interval: "month",
    currency: "usd",
    amount: 500,
}, function (err, plan) {
    // asynchronously called
});

// Intermediate Plan
stripe.plans.create({
    name: "Intermediate Plan",
    id: "intermediate-monthly",
    interval: "month",
    currency: "usd",
    amount: 1000,
}, function (err, plan) {
    // asynchronously called
});

// Advanced Plan
stripe.plans.create({
    name: "Advanced Plan",
    id: "advanced-monthly",
    interval: "month",
    currency: "usd",
    amount: 2000,
}, (err, plan) => {
    return;
});

export default (router: express.Router) => {

    router.post("/subscribe", auth.mustBeLoggedIn, async (req, res) => {

        const owner = req.user._id;
        // subscription.data.current_period_end
        const currentPodcast = await Podcast.findOne({ owner }).exec();
        let current_period_end = 0;
        if (currentPodcast.subscription && (currentPodcast.subscription as any).current_period_end) {
            current_period_end = (currentPodcast.subscription as any).current_period_end * 1000;
        }

        const now = (new Date()).getTime();

        // If the subscription is not active or it has never been active
        if (now > current_period_end) {

            stripe.customers.create({
                email: req.body.stripeEmail,
                source: req.body.stripeToken,
            })
                .then(customer =>
                    stripe.subscriptions.create({
                        customer: customer.id,
                        plan: getPlanId(req.body.storageLimit),
                    }, function (err, subscription) {
                        const fields = {
                            subscription: {
                                storageLimit: req.body.storageLimit,
                                data: subscription,
                            },
                        };
                        // tslint:disable-next-line:no-shadowed-variable
                        // tslint:disable-next-line:max-line-length
                        Podcast.update({ "owner.0": owner }, fields, { upsert: true, new: true, multi: true }, async (error, p) => {
                            if (error) { return res.status(403).send(err.message); }
                            const podcast = await Podcast.findOne({ "owner.0": owner });
                            res.json({ podcast });
                        });
                    }));

        } else {
            // We have an active subscription which needs to be updated
            stripe.subscriptions.update((currentPodcast.subscription as any).id, {
                plan: getPlanId(req.body.storageLimit),
            }, function (err, subscription) {

                const fields = {
                    subscription: {
                        storageLimit: req.body.storageLimit,
                        data: subscription,
                    },
                };

                // tslint:disable-next-line:no-shadowed-variable
                // tslint:disable-next-line:max-line-length
                Podcast.update({ "owner.0": owner }, fields, { upsert: true, new: true, multi: true }, async (error, p) => {
                    if (err) { return res.status(403).send(err.message); }
                    const podcast = await Podcast.findOne({ "owner.0": owner });
                    res.json({ podcast });
                });
            },
            );
        }
    });

    router.post("/cancel-subscription", auth.mustBeLoggedIn, async (req, res) => {

        const owner = req.user._id;

        const podcast = await Podcast.findOne({ "owner.0": owner }).exec();

        const subscription = (podcast.subscription as any).data.id;

        stripe.subscriptions.del(subscription,
            function (err, confirmation) {
                if (err) {
                    res.sendStatus(500);
                } else {

                    const fields = {
                        "subscription.data.canceled_at": confirmation.canceled_at,
                        "subscription.storageLimit": 100, // Resetting to free tier
                    };

                    // tslint:disable-next-line:max-line-length
                    Podcast.update({ "owner.0": owner }, fields, { upsert: true, new: false, multi: true }, async (error, pod) => {
                        if (error) {
                            // tslint:disable-next-line:no-console
                            console.warn("ERROR", error);
                            return res.sendStatus(403).send(error.message);
                        }
                        const updatedPodcast = JSON.parse(JSON.stringify({podcast}));
                        res.json({ podcast: updatedPodcast });
                    });

                }
            },
        );

    });

    router.post("/billing-history", auth.mustBeLoggedIn, async (req, res) => {

        const owner = req.user._id;

        const podcast = await Podcast.findOne({ "owner.0": owner }).exec();

        let customer = null;
        if (podcast.subscription && (podcast.subscription as any).data) {
            customer = (podcast.subscription as any).data.customer;
        }
        if (customer) {
            stripe.charges.list(
                { customer },
                function (err, charges) {
                    if (err) { return res.status(403).send(err.message); }
                    res.json({ charges });
                },
            );
        } else {
            res.status(200).send();
        }

    });

};

export function stripeWebhook(req, res) {

    // Webhook type
    const type = req.body.type;

    if (type === "invoice.payment_succeeded") {
        // Subscription prolonged
        const data = req.body.data.object;
        const paid = data.paid;
        const subscription = data.subscription;

        const current_period_end = new Date();
        current_period_end.setMonth(current_period_end.getMonth() + 1);
        current_period_end.setDate(current_period_end.getDate() + 3);
        current_period_end.setMilliseconds(0);
        const end = current_period_end.getTime() / 1000;

        const fields = {
            // tslint:disable-next-line:radix
            "subscription.data.current_period_end": end,
            "usedStorage": 0,
        };
        // tslint:disable-next-line:max-line-length
        Podcast.update({ "subscription.data.id": subscription }, fields, { upsert: true, new: false, multi: true });
    }

    // Return a response immediately, because webhooks don't like to wait for long
    res.send(200);

}
