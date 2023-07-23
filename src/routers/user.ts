import express, { NextFunction, Request, Response } from "express";
import {
  PROJECT_ID,
  analyticsDataClient,
} from "../../configs/analytics/analyticsClient";
import { dateValidator, numberWithCommas } from "../../utils";
import { StatusCodes } from "http-status-codes";
import { MESSAGE_ERROR, MESSAGE_SUCCESS } from "../../constants/message";
import { IRunReportRequestBody } from "../../interfaces/request";
import Joi, { CustomHelpers } from "joi";
import { NAME_METRICS } from "../../constants";
import moment from "moment";

const router = express.Router();

router.post(
  "/runRealtimeReport",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const [response] = await analyticsDataClient.runReport({
        property: `properties/${PROJECT_ID}`,
        dateRanges: [
          {
            startDate: "2023-07-23",
            endDate: "2023-07-23",
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
      // console.log(response);

      response.rows.forEach((row) => {
        console.log(row.dimensionValues[0].value, row.metricValues[0].value);
      });
    } catch (error) {}
  }
);

router.post(
  "/runReport",
  async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body as IRunReportRequestBody;

    const schema = Joi.object({
      dateRange: Joi.array().items(
        Joi.object({
          startDate: Joi.custom((time: string, helpers: CustomHelpers) => {
            dateValidator(time, helpers);
          }).required(),
          endDate: Joi.custom((time: string, helpers: CustomHelpers) => {
            dateValidator(time, helpers);
          }).required(),
          name: Joi.string().valid(...Object.values(NAME_METRICS)),
        })
      ),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: MESSAGE_ERROR.ERROR_VALIDATE,
        error: error,
      });
    }

    const now = moment(new Date()).format("YYYY-MM-DD");

    let dateRange = {
      startDate: now,
      endDate: now,
    };

    try {
      const [response] = await analyticsDataClient.runReport({
        property: `properties/${PROJECT_ID}`,
        dateRanges: body.dateRange.length !== 0 ? body.dateRange : [dateRange],
        dimensions: [{ name: "platform" }],
        metrics: [
          { name: "activeUsers" },
          { name: "active1DayUsers" },
          { name: "active7DayUsers" },
          { name: "active28DayUsers" },
          { name: "newUsers" },
          { name: "totalUsers" },
          { name: "crashAffectedUsers" },
          { name: "averageSessionDuration" },
        ],
      });

      let report = {
        activeUsers: {},
        active1DayUsers: {},
        active7DayUsers: {},
        active28DayUsers: {},
        newUsers: {},
        totalUsers: {},
        crashAffectedUsers: {},
        userEngagementDuration: {},
      };

      response.rows.forEach((row) => {
        report.activeUsers = numberWithCommas(row.metricValues[0].value);
        report.active1DayUsers = numberWithCommas(row.metricValues[1].value);
        report.active7DayUsers = numberWithCommas(row.metricValues[2].value);
        report.active28DayUsers = numberWithCommas(row.metricValues[3].value);
        report.newUsers = numberWithCommas(row.metricValues[4].value);
        report.totalUsers = numberWithCommas(row.metricValues[5].value);
        report.crashAffectedUsers = numberWithCommas(row.metricValues[6].value);

        let engagementDuration = parseFloat(row.metricValues[7].value);
        let dell = "";
        dell =
          engagementDuration >= 3600
            ? `${(engagementDuration / 3600).toFixed(2)} hrs`
            : engagementDuration < 3600
            ? `${(engagementDuration / 60).toFixed(2)} mins`
            : `${engagementDuration.toFixed(2)} secs`;

        report.userEngagementDuration = dell;
      });

      res.status(StatusCodes.OK).json({
        status: true,
        message: MESSAGE_SUCCESS.GET_RUN_REPORT,
        data: report,
      });
    } catch (error) {}
  }
);

export { router as routerUser };
