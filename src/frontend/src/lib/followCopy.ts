export const followCopy = {
  action: {
    follow: 'Follow',
    following: 'Following',
    unfollow: 'Unfollow',
  },
  navigation: {
    label: 'Following',
  },
  page: {
    title: 'Following',
    emptyState: 'No channels followed yet',
    emptyStateDescription: 'Follow channels to see their latest videos here',
  },
  channel: {
    followersCount: (count: number) => `${count} ${count === 1 ? 'follower' : 'followers'}`,
  },
};
