import { DateTime } from 'luxon';

export const timeAgo = (pastTime) => {
  const pastTimeDate = new DateTime(pastTime);
  const now = DateTime.now();
  const diff = now.diff(pastTimeDate, ['years', 'months', 'days', 'hours', 'minutes', 'seconds']);

  const units = ['years', 'months', 'days', 'hours', 'minutes', 'seconds'];
  const unit = units.find((unit) => diff.get(unit) !== 0) || units.slice(-1)[0];

  const value = Math.floor(diff.get(unit));

  if (!value && unit === 'seconds') {
    return 'fresh';
  }
  
  return `${value} ${unit} ago`;
};
