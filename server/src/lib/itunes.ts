import * as puppeteer from "puppeteer";

export async function addItunesPodcast(rssFeedUrl) {
  (async() => {
    const browser = await puppeteer.launch({
      headless: false,
    });

    const page = await browser.newPage();
    await page.goto("https://itunesconnect.apple.com/login");
    await page.waitFor(5000);
    const frames = await page.frames();
    const authFrame = frames.find(f => f.name() === "aid-auth-widget-iFrame");

    const usernameField = await authFrame.$("#account_name_text_field");
    await usernameField.type(process.env.ITUNES_USER);
    let signInButton = await authFrame.$("#sign-in");
    signInButton.click();
    await page.waitFor(2000);

    const passwordField = await authFrame.$("#password_text_field");
    await passwordField.type(process.env.ITUNES_PASS);
    signInButton = await authFrame.$("#sign-in");
    signInButton.click();
    await page.waitFor(2000);

    await page.goto("https://podcastsconnect.apple.com/my-podcasts/new-feed");
    const newFeedUrlField = await page.waitFor("#new-feed-url");
    await newFeedUrlField.type(rssFeedUrl);
    let validateFeedButton = await page.waitFor("button.tb-btn--primary.new-feed-validate");
    validateFeedButton.click();

    let submitFeedButton = await page.waitFor("button.tb-btn--primary.new-feed-submit");
    await page.waitFor(5000);
    console.log(submitFeedButton)
    // button logs correctly but nothing happens on click
    submitFeedButton.click();

    await page.waitFor(45000);

    await browser.close();
  })();
}
