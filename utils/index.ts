import moment from "moment";
import { MESSAGE_ERROR } from "../constants/message";
import Joi, { CustomHelpers } from "joi";

export const numberWithCommas = (x: string) => {
  try {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
  } catch (err) {
    throw err;
  }
};

export const dateValidator = function (time: string, helpers: CustomHelpers) {
  const isValidFormat = moment(time, "YYYY-MM-DD", true);

  if (!isValidFormat.isValid()) {
    return helpers.error(MESSAGE_ERROR.DATE_INVALID_FORMAT);
  }

  const now = moment(moment().add(1, "days")).format("YYYY-MM-DD");

  if (!isValidFormat.isBefore(now)) {
    return helpers.error(MESSAGE_ERROR.DATE_INVALID);
  }

  return {
    valid: true,
  };
};
