import axios from "axios";
import { OnboardingWizard } from "@/components/onboarding/wizard";
import type { OnboardingProfile } from "@/types/onboarding";

type ProfileLoaderProps = {
  cookie: string;
  userName: string;
  userImage: string;
};

/**
 * Slow fragment: aggregates the GitHub profile (repos list + PR search).
 * Streams in behind `<Suspense>` so the page shell paints instantly.
 */
export async function ProfileLoader({
  cookie,
  userName,
  userImage,
}: ProfileLoaderProps) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  let initialProfile: OnboardingProfile | null = null;

  if (apiUrl) {
    try {
      const { data } = await axios.get<OnboardingProfile>(
        `${apiUrl}/users/onboarding-profile`,
        { headers: { cookie } },
      );
      initialProfile = data;
    } catch {
      initialProfile = null;
    }
  }

  return (
    <OnboardingWizard
      initialProfile={initialProfile}
      userName={userName}
      userImage={userImage}
    />
  );
}
