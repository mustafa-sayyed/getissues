const since7days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const since14days = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

export const SEARCH_QUERIES = [
  {
    query: 'is:issue is:open label:"good first issue" no:assignee',
    limit: 50,
  },
  {
    query: 'is:issue is:open label:"help wanted" no:assignee',
    limit: 50,
  },
  {
    query: 'is:issue is:open label:"up-for-grabs" no:assignee',
    limit: 20,
  },
  {
    query: 'is:issue is:open label:"good first issue" label:"bug" no:assignee',
    limit: 20,
  },
  {
    query: `is:issue is:open label:"good first issue" no:assignee created:>${since7days}`,
    limit: 30,
  },
  {
    query: `is:issue is:open label:"help wanted" no:assignee stars:>200 created:>${since14days}`,
    limit: 25,
  },
];
