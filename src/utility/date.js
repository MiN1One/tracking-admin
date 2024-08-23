const US_TIMEZONE_DIFFERENCE = 5;

export const timeAgo = (pastTime) => {
  const past = new Date(pastTime);
  if (pastTime.includes('T')) {
    past.setHours(past.getHours() + US_TIMEZONE_DIFFERENCE);
  }
  const now = new Date();
  const diffInSeconds = Math.max(Math.floor((now - past) / 1000), 0);

  if (!diffInSeconds) return 'just now';

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minutes ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hours ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} days ago`;
  }
};

export const hasMinutesPassed = (date, minutes) => {
  const now = new Date().getTime();
  const givenDate = new Date(date).getTime();
  const differenceInMilliseconds = now - givenDate;
  const differenceInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));
  return differenceInMinutes >= minutes;
}