import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

const analyticsDataClient = new BetaAnalyticsDataClient({
  keyFilename: "/home/phi/code/GG_anlytics/gamecenter-4745e-19d8c0731b0c.json",
});

dotenv.config();

const app = express();
const port = 3000;

app.get("/", async (req: Request, res: Response) => {
  const [response] = await analyticsDataClient.runReport({
    property: `properties/387721433`,
    dateRanges: [
      {
        startDate: "2020-03-31",
        endDate: "today",
      },
    ],
    dimensions: [
      {
        name: "city",
      },
    ],
    metrics: [
      {
        name: "activeUsers",
      },
    ],
  });

  console.log("Report result:");
  response.rows.forEach((row) => {
    console.log(row.dimensionValues[0].value, row.metricValues[0].value);
  });
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
