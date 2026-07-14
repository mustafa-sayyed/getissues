import { task } from "@renderinc/sdk/workflows";
import { WorkflowLogger as logger } from "@packages/logging";
import { db, eq, schema } from "../../lib/db.js";

export const getUserSkillsTask = task(
  { name: "getUserSkillsTask", plan: "starter" },
  async (
    userId: string,
  ): Promise<{
    embedding: number[];
    skills: string;
  }> => {
    const [userSkills] = await db
      .select()
      .from(schema.skills)
      .where(eq(schema.skills.userId, userId))
      .limit(1);

    if (!userSkills) {
      throw new Error(`No skills found for user ${userId}.`);
    }

    const skills = `Known Programming to User: ${userSkills.languages.join(", ")}, \n\n User interested in Working: ${userSkills.interests}`;

    logger.info(
      { userId, interests: userSkills.interests },
      `Retrieved skills for user ${userId}: ${userSkills.interests}.`,
    );
    return {
      embedding: userSkills.embedding,
      skills: skills,
    };
  },
);
