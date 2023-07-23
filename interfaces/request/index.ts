export interface IRunReportRequestBody {
  dateRange: IDateRange[];
}

export interface IDateRange {
  startDate: string;
  endDate: string;
  name?: string;
}
