export const submitPodcastReplyHTML = (podcastTitle: string) => {
    return `
    <!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Simple Transactional Email</title>
    <style>
      /* -------------------------------------
          GLOBAL RESETS
      ------------------------------------- */
      img {
        border: none;
        -ms-interpolation-mode: bicubic;
        max-width: 100%; }
      body {
        background-color: #f6f6f6;
        font-family: sans-serif;
        -webkit-font-smoothing: antialiased;
        font-size: 14px;
        line-height: 1.4;
        margin: 0;
        padding: 0;
        -ms-text-size-adjust: 100%;
        -webkit-text-size-adjust: 100%; }
      table {
        border-collapse: separate;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
        width: 100%; }
        table td {
          font-family: sans-serif;
          font-size: 14px;
          vertical-align: top; }
    </style>
  </head>
  <body class="">
          <p>Hi,</p>
          <div>We have received your request to submit "${podcastTitle}" to iTunes and Google Play.</div>
          <p>You will receive an email once "${podcastTitle}" is available on iTunes and Google Play.</p>
          <p>This can take from 5-7 days.</p>
          <br/>
          <p>If you have questions, contact our customer service team.</p>
          <p>Thank you!</p>

          <br/>
          <p>Your Podsheets team</p>
  </body>
</html>
    `;
};
