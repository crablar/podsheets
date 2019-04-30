import * as puppeteer from "puppeteer";

export async function addItunesPodcast() {
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
    await page.waitFor(5000);
    // await page.screenshot({path: 'out.png', fullPage: true});
    await browser.close();
  })();
}
