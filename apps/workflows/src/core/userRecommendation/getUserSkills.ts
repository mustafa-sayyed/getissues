import { WorkflowLogger as logger } from "@packages/logging";
import { db, eq, schema } from "../../lib/db.js";

export const getUserSkillsTask = async (
  userId: string,
): Promise<{
  embedding: number[];
  skills: string;
} | null> => {
  try {
    const [userSkills] = await db
      .select()
      .from(schema.skills)
      .where(eq(schema.skills.userId, userId))
      .limit(1);

    if (!userSkills) {
      logger.info(`No skills found for user ${userId}.`);
      return null;
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
  } catch (error) {
    logger.error(
      { userId, error },
      `Error retrieving skills for user ${userId}: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    return null;
  }
};
