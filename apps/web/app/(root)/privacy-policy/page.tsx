import type { Metadata } from "next";

import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy - getissues",
  description:
    "How getissues collects, uses, and protects your information, including the data we access from GitHub and the AI services we rely on.",
};

const lastUpdated = "October 17, 2026";

const sections: LegalSection[] = [
  {
    id: "overview",
    heading: "Overview",
    content: (
      <>
        <p>
          This Privacy Policy explains how the operator of getissues.tech
          (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses,
          shares, and protects information when you use getissues (the
          &quot;Service&quot;). We aim to collect only the information needed to
          operate the Service.
        </p>
        <p>
          By using the Service you acknowledge the practices described here. If
          you do not agree, please do not use the Service.
        </p>
      </>
    ),
  },
  {
    id: "collect",
    heading: "Information we collect",
    content: (
      <>
        <p>
          <strong>Information from GitHub.</strong> You sign in using GitHub
          OAuth. When you sign in, we receive your name, email address, avatar,
          and GitHub user ID, along with an OAuth access token and the scopes
          you grant. During onboarding we may scan data associated with your
          GitHub account to detect your skills, such as your public profile,
          recently pushed repositories, repository languages and topics,
          dependency manifests and common configuration or tool files, your
          starred repositories, and pull request activity. We never receive your
          GitHub password.
        </p>
        <p>
          <strong>Information you provide.</strong> This includes the skill
          profile you set up (languages and free-text interests), feedback you
          give on recommendations (such as dismiss reasons, bookmarks, and
          helpful/not-helpful ratings), your agent preferences, and the messages
          you send to the AI assistant.
        </p>
        <p>
          <strong>Information collected automatically.</strong> When you use the
          Service we collect technical and usage information, including your IP
          address, browser user agent, session details, pages viewed, and
          interaction events.
        </p>
        <p>
          <strong>Information derived from your data.</strong> We generate
          numeric embeddings (vectors) of your skills and interests and of issue
          content to power semantic matching, along with match scores and an
          evolving &quot;contributor memory&quot; of your recommendation
          decisions used to personalize future results.
        </p>
      </>
    ),
  },
  {
    id: "use",
    heading: "How we use your information",
    content: (
      <>
        <p>We use your information to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>create and secure your account and sign you in;</li>
          <li>
            scan your GitHub activity to build your skill profile and find
            relevant issues;
          </li>
          <li>
            generate recommendations and assistant responses, including
            embeddings and match scores;
          </li>
          <li>
            personalize results over time based on your feedback and decisions;
          </li>
          <li>
            enforce usage limits, prevent abuse, and keep the Service secure;
          </li>
          <li>measure usage and improve the Service; and</li>
          <li>comply with legal obligations.</li>
        </ul>
      </>
    ),
  },
  {
    id: "ai-processors",
    heading: "AI processing and service providers",
    content: (
      <>
        <p>
          To operate the Service, we share limited information with
          third-party service providers that process it on our behalf. These
          providers fall into the following categories:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>AI model and embedding providers</strong> that generate
            embeddings, recommendations, and assistant responses from limited
            data such as your skills, interests, feedback, and the relevant
            issue content;
          </li>
          <li>
            <strong>Behavioral memory providers</strong> that store your
            recommendation decisions to personalize future results;
          </li>
          <li>
            <strong>Cloud hosting, storage, and database providers</strong> that
            run and store the Service and its data;
          </li>
          <li>
            <strong>Workflow orchestration providers</strong> that schedule and
            run our background jobs;
          </li>
          <li>
            <strong>Product analytics providers</strong> that help us
            understand usage; and
          </li>
          <li>
            <strong>Monitoring and telemetry providers</strong> that help us
            keep the Service secure and reliable.
          </li>
        </ul>
        <p>
          The platform you connect with — GitHub — is used for authentication
          and to retrieve public issue and repository data. All of these
          providers process information under their own terms and privacy
          policies, and we may change providers from time to time.{" "}
          <strong>We do not sell your personal data.</strong>
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    heading: "Cookies and analytics",
    content: (
      <>
        <p>
          We use a session cookie (prefixed <code>getissues</code>) to keep you
          signed in, a cookie that remembers your dashboard sidebar state, and
          local browser storage for your theme preference. Sign-in cookies are
          essential to the Service.
        </p>
        <p>
          We use PostHog for analytics, including page views and autocaptured
          interaction events, served through a first-party domain. You can limit
          or block cookies and analytics through your browser settings, and you
          can contact us to opt out of analytics. Blocking essential cookies may
          prevent you from signing in.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    heading: "How we share information",
    content: (
      <>
        <p>We share information only as needed to run the Service, including:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            with the service providers listed above that process data on our
            behalf;
          </li>
          <li>
            with GitHub, as necessary to retrieve data about your account and
            public repositories;
          </li>
          <li>
            where required by law, regulation, or valid legal process, or to
            protect the rights, safety, and security of users or the public;
          </li>
          <li>
            in connection with a merger, acquisition, or sale of assets, in
            which case we will take reasonable steps to protect your
            information; and
          </li>
          <li>with your consent or at your direction.</li>
        </ul>
        <p>We do not sell your personal data.</p>
      </>
    ),
  },
  {
    id: "retention",
    heading: "Data retention",
    content: (
      <>
        <p>
          We retain your account and profile information while your account is
          active. Issue and repository details we surface are derived from
          public GitHub content.
        </p>
        <p>
          When you delete your account, we delete your account record and
          associated data, including your skill profile, sessions, linked
          account tokens, recommendations, agent runs and configurations, chat
          messages, and evaluation history. Some information may remain in
          backups for a limited period, and derived data held by third-party
          providers (such as contributor memory) may persist for a limited time.
          You can request deletion of such data by emailing{" "}
          <a href="mailto:support@getissues.tech">support@getissues.tech</a>.
          Logs and telemetry are retained according to our providers&apos;
          policies.
        </p>
      </>
    ),
  },
  {
    id: "security",
    heading: "Security",
    content: (
      <p>
        We use reasonable technical and organizational measures to protect your
        information, including encryption in transit and access controls, and we
        store access tokens on our servers rather than in your browser. No method
        of transmission or storage is completely secure, so we cannot guarantee
        absolute security.
      </p>
    ),
  },
  {
    id: "rights",
    heading: "Your rights and choices",
    content: (
      <>
        <p>Depending on where you live, you may have the right to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>access the personal data we hold about you;</li>
          <li>correct inaccurate information;</li>
          <li>delete your account and data;</li>
          <li>withdraw consent or revoke getissues&apos; GitHub access;</li>
          <li>object to or opt out of analytics; and</li>
          <li>request a portable copy of your data.</li>
        </ul>
        <p>
          You can delete your account from the dashboard settings at any time.
          To exercise any other right, contact us at{" "}
          <a href="mailto:support@getissues.tech">support@getissues.tech</a>. We
          will respond within the timeframe required by applicable law.
        </p>
      </>
    ),
  },
  {
    id: "transfers",
    heading: "International data transfers",
    content: (
      <p>
        We and our service providers may process and store information in
        countries other than yours, including the United States, the European
        Union, India, and Singapore. Where required, we rely on appropriate
        safeguards for these transfers.
      </p>
    ),
  },
  {
    id: "children",
    heading: "Children's privacy",
    content: (
      <p>
        The Service is not intended for children under 13 (or the minimum age of
        digital consent in your jurisdiction). We do not knowingly collect
        personal data from children. If you believe a child has provided us with
        personal data, contact us and we will delete it.
      </p>
    ),
  },
  {
    id: "third-party-links",
    heading: "Third-party links and content",
    content: (
      <p>
        The Service links to GitHub and other third-party sites and shows
        content owned by others. We are not responsible for the privacy
        practices of those sites. We encourage you to review their privacy
        policies.
      </p>
    ),
  },
  {
    id: "changes",
    heading: "Changes to this Policy",
    content: (
      <p>
        We may update this Privacy Policy from time to time. When we do, we will
        revise the &quot;Last updated&quot; date above and, for material
        changes, take reasonable steps to notify you. Your continued use of the
        Service after changes take effect constitutes acceptance of the updated
        Policy.
      </p>
    ),
  },
  {
    id: "contact",
    heading: "Contact us",
    content: (
      <p>
        For privacy questions or requests, email{" "}
        <a href="mailto:support@getissues.tech">support@getissues.tech</a>.
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="This Policy explains what information getissues collects, how we use it, the AI and infrastructure providers we rely on, and the choices you have."
      lastUpdated={lastUpdated}
      sections={sections}
    />
  );
}
