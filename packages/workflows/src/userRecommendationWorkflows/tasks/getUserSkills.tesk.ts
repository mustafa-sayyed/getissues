import { task } from "@renderinc/sdk/workflows";
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

    const skills = `User want to work on: ${userSkills.skillDetails}, \n\n user Skills: ${userSkills.skills}`;

    console.log(`Retrieved skills for user ${userId}: ${userSkills.skills}.`);
    return {
      embedding: userSkills.embedding,
      skills: skills,
    };
  },
);
