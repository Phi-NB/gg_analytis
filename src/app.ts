import express, { Request, Response } from "express";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;
const scopes = "https://www.googleapis.com/auth/analytics.readonly";
const view_id = "235279192";

const jwt = new google.auth.JWT(
  process.env.CLIENT_EMAIL,
  null,
  process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
  scopes
);

// async function getTopPosts() {
//   try {
//     await jwt.authorize();

//     const response = await google.analytics("v3").data.ga.get({
//       auth: jwt,
//       ids: "ga:" + view_id,
//       "start-date": "2019-01-01",
//       "end-date": "today",
//       dimensions: "ga:pagePath,ga:pageTitle",
//       metrics: "ga:pageviews",
//       sort: "-ga:pageviews",
//       "max-results": "10",
//       filters: "ga:medium==organic",
//     });

//     console.log(response);
//   } catch (err) {
//     console.log(err);
//   }
// }

app.get("/", async (req: Request, res: Response) => {
  try {
    const analyticsreporting = google.analyticsreporting({
      version: "v4",
      auth: jwt,
    });

    const response = await analyticsreporting.reports.batchGet({
      requestBody: {
        reportRequests: [
          {
            viewId: view_id,
            dateRanges: [
              {
                startDate: "2023-01-01",
                endDate: "2023-01-31",
              },
            ],
            metrics: [
              {
                expression: "ga:sessions",
              },
              {
                expression: "ga:admin",
              },
            ],
            dimensions: [
              {
                name: "ga:date",
              },
            ],
          },
        ],
      },
    });

    console.log(JSON.stringify(response.data, null, 2));
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
