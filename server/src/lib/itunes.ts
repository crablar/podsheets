import * as puppeteer from "puppeteer";
import config from "../config";

export async function addItunesPodcast(rssFeedUrl) {
  (async() => {
    const browser = await puppeteer.launch({
      headless: true,
    });

    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)\
    AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36");
    await page.goto("https://itunesconnect.apple.com/login");
    await page.waitFor(5000);
    const frames = await page.frames();
    const authFrame = frames.find(f => f.name() === "aid-auth-widget-iFrame");
    const usernameField = await authFrame.$("#account_name_text_field");
    await usernameField.type(config.itunes.username);
    let signInButton = await authFrame.$("#sign-in");
    signInButton.click();
    await page.waitFor(2000);

    const passwordField = await authFrame.$("#password_text_field");
    await passwordField.type(config.itunes.password);
    signInButton = await authFrame.$("#sign-in");
    signInButton.click();
    await page.waitFor(2000);

    await page.goto("https://podcastsconnect.apple.com/my-podcasts/new-feed");
    const newFeedUrlField = await page.waitFor("#new-feed-url");
    await newFeedUrlField.type(rssFeedUrl);
    const validateFeedButton = await page.waitFor("button.tb-btn--primary.new-feed-validate");
    validateFeedButton.click();

    const submitFeedButton = await page.waitFor("button.tb-btn--primary.new-feed-submit");
    await page.waitFor(10000);
    submitFeedButton.click();
    await page.waitFor(25000);
    await page.screenshot({path: "submitted.png"});
    await browser.close();
  })();
}
