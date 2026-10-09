const daysAgo = (n: number) =>
  new Date(Date.now() - n * 1000 * 60 * 60 * 24).toISOString().split("T")[0];

const base = "is:issue is:open no:assignee archived:false";

export const SEARCH_QUERIES = [
  {
    query: `${base} label:"bug" updated:>${daysAgo(30)}`,
    limit: 100,
  },
  {
    query: `${base} label:"good first issue" updated:>${daysAgo(30)}`,
    limit: 50,
  },
  {
    query: `${base} label:"help wanted" updated:>${daysAgo(30)}`,
    limit: 50,
  },
  {
    query: `${base} label:"up-for-grabs" updated:>${daysAgo(60)}`,
    limit: 20,
  },
  {
    query: `${base} label:"good first issue" label:"bug" updated:>${daysAgo(60)}`,
    limit: 20,
  },
  {
    query: `${base} label:"good first issue" created:>${daysAgo(7)}`,
    limit: 20,
  },
  {
    query: `${base} label:"help wanted" created:>${daysAgo(14)}`,
    limit: 20,
  },
];
