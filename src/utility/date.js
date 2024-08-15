import { DateTime } from 'luxon';

export const timeAgo = (pastTime) => {
  const pastTimeDate = new DateTime(pastTime);
  const now = DateTime.now();
  const diff = now.diff(pastTimeDate, ['years', 'months', 'days', 'hours', 'minutes', 'seconds']);

  const units = ['years', 'months', 'days', 'hours', 'minutes', 'seconds'];
  const unit = units.find((unit) => diff.get(unit) !== 0) || units.slice(-1)[0];

  const value = Math.floor(diff.get(unit));
  return `${value} ${unit} ago`;
};

export const hasMinutesPassed = (date, minutes) => {
  const now = new Date().getTime();
  const givenDate = new Date(date).getTime();
  const differenceInMilliseconds = now - givenDate;
  const differenceInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));
  return differenceInMinutes >= minutes;
}