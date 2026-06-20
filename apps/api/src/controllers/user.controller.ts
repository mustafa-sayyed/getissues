import { asyncHandler } from "../utils/asyncRequest.js";
import { auth } from "../utils/auth.js";
import { httpStatusCodes } from "../utils/httpStatusCodes.js";
import { getOctokit } from "../utils/octokit.js";

const getGithubUserData = asyncHandler(async (req, res) => {
  const userId = req.params.userId as string;

  const { accessToken } = await auth.api.getAccessToken({
    body: {
      providerId: "github",
      userId: userId,
    },
  });

  const octokit = getOctokit(accessToken ?? process.env.GITHUB_ACCESS_TOKEN!);

  const data = await octokit.rest.users.getAuthenticated();
  const pulls = await octokit.rest.search.issuesAndPullRequests({
    q: `author:${data.data.login}`,
  })


  res.status(httpStatusCodes.OK).json({...data.data, pullRequests: pulls.data});
});

export { getGithubUserData };
