import { formatDistanceToNow } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

export function formatRelativeDate(timestamp: Timestamp | null | undefined): string {
  if (!timestamp) return '';

  const date = timestamp.toDate();
  return `${formatDistanceToNow(date)} ago`;
}
