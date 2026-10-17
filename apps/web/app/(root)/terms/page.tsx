import type { Metadata } from "next";

import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service - getissues",
  description:
    "The terms that govern your use of getissues, an AI-powered service that recommends open source issues based on your skills and interests.",
};

const lastUpdated = "October 17, 2026";

const sections: LegalSection[] = [
  {
    id: "acceptance",
    heading: "Acceptance of these Terms",
    content: (
      <>
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your access to and
          use of getissues, available at{" "}
          <a href="https://getissues.tech">getissues.tech</a> (the
          &quot;Service&quot;). The Service is operated by the independent
          operator of getissues.tech (&quot;we&quot;, &quot;us&quot;, or
          &quot;our&quot;).
        </p>
        <p>
          By signing in, accessing, or using the Service, you agree to be bound
          by these Terms. If you do not agree, do not use the Service. If you use
          the Service on behalf of an organization, you represent that you have
          authority to bind that organization to these Terms.
        </p>
      </>
    ),
  },
  {
    id: "eligibility",
    heading: "Eligibility",
    content: (
      <>
        <p>To use the Service you must:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            be at least 13 years old, or the minimum age of digital consent in
            your jurisdiction (GitHub requires users to be at least 13);
          </li>
          <li>hold a valid GitHub account; and</li>
          <li>
            not be barred from using the Service under the laws that apply to
            you.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "the-service",
    heading: "What getissues is",
    content: (
      <>
        <p>
          getissues is a free, AI-powered service that connects to your GitHub
          account, ingests publicly available open source issues, and uses
          automated agents and third-party AI models to recommend issues that
          may match the skills and interests you provide. The Service also
          includes an AI assistant you can chat with and a feedback system that
          helps personalize future recommendations.
        </p>
        <p>
          Recommendations and assistant responses are{" "}
          <strong>suggestions only</strong>. You decide what to work on, and any
          contribution you make is made directly on third-party platforms (such
          as GitHub) under their terms.
        </p>
      </>
    ),
  },
  {
    id: "github",
    heading: "Your GitHub account and authorization",
    content: (
      <>
        <p>
          You sign in to getissues through GitHub OAuth. By doing so, you
          authorize us to access certain GitHub data according to the
          permissions (scopes) you grant at sign-in.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            You are responsible for your GitHub account, for keeping it secure,
            and for complying with GitHub&apos;s terms and policies.
          </li>
          <li>
            You can revoke getissues&apos; access at any time from your GitHub
            account settings. Revoking access may prevent the Service from
            functioning.
          </li>
          <li>
            getissues is an independent project and is{" "}
            <strong>
              not affiliated with, endorsed by, or sponsored by GitHub
            </strong>
            .
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "acceptable-use",
    heading: "Acceptable use",
    content: (
      <>
        <p>You agree not to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            use the Service to spam, harass, or send unsolicited automated
            comments, pull requests, or messages to repositories or maintainers;
          </li>
          <li>
            violate GitHub&apos;s terms, any open source license, or the rules of
            any repository you contribute to;
          </li>
          <li>
            attempt to access data belonging to other users, or to probe,
            scan, or breach the Service or its infrastructure;
          </li>
          <li>
            scrape, resell, or redistribute the Service or its data, or evade
            usage limits and quotas;
          </li>
          <li>
            upload or inject unlawful, malicious, or deceptive content,
            including attempts to manipulate the AI systems; or
          </li>
          <li>use the Service for any unlawful purpose.</li>
        </ul>
        <p>
          We may suspend or terminate access that we reasonably believe violates
          these rules.
        </p>
      </>
    ),
  },
  {
    id: "ai",
    heading: "AI-generated recommendations; no guarantees",
    content: (
      <>
        <p>
          Recommendations, match scores, repo summaries, and assistant messages
          are produced by automated systems and third-party AI models. They may
          be inaccurate, incomplete, outdated, or unsuitable.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            We do not guarantee that any recommended issue is still open,
            unassigned, accurate, or appropriate for you.
          </li>
          <li>
            We do not guarantee that a maintainer will respond to you, or that
            any pull request or contribution will be accepted or merged.
          </li>
          <li>
            You are solely responsible for reviewing an issue and repository
            before contributing, and for the contributions you make.
          </li>
          <li>
            The Service is not professional, legal, or financial advice.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "ip",
    heading: "Intellectual property and license",
    content: (
      <>
        <p>
          The Service, including its name, branding, user interface, and
          original code, is owned by us or our licensors and is protected by
          applicable laws. The source code for getissues is open source and
          released under the MIT License; that license governs the source code
          itself, not the hosted Service.
        </p>
        <p>
          Issue, repository, and other third-party content surfaced through the
          Service belongs to its respective owners and is subject to their
          licenses. You must respect those licenses when contributing.
        </p>
        <p>
          Subject to these Terms, we grant you a limited, non-exclusive,
          non-transferable, revocable license to use the Service for its
          intended purpose. You retain ownership of the content you submit
          (such as your skills, interests, feedback, dismiss reasons, and chat
          messages), and you grant us a license to host, process, and use that
          content to operate, secure, and improve the Service.
        </p>
      </>
    ),
  },
  {
    id: "fees",
    heading: "Free service and changes to features",
    content: (
      <p>
        The Service is currently offered free of charge. We may, at any time,
        introduce paid features, usage limits, or a paywall for advanced
        functionality, and we may modify, suspend, or discontinue any part of
        the Service. We will not retroactively charge you for features you used
        for free before a paid plan is introduced.
      </p>
    ),
  },
  {
    id: "third-parties",
    heading: "Third-party services",
    content: (
      <p>
        The Service relies on third-party providers for authentication and
        source data (GitHub), AI models and embeddings, database and hosting,
        workflow orchestration, analytics, and monitoring. Your use of the
        Service is also subject to those providers&apos; terms where applicable.
        We are not responsible for third-party services, and we may change
        providers over time. Our handling of your information is described in
        our <a href="/privacy-policy">Privacy Policy</a>.
      </p>
    ),
  },
  {
    id: "disclaimers",
    heading: "Disclaimers",
    content: (
      <p>
        The Service is provided &quot;as is&quot; and &quot;as available&quot;,
        without warranties of any kind, whether express or implied, including
        warranties of merchantability, fitness for a particular purpose, and
        non-infringement. We do not warrant that the Service will be
        uninterrupted, timely, secure, or error-free, or that background agent
        runs will occur at any particular time or frequency.
      </p>
    ),
  },
  {
    id: "liability",
    heading: "Limitation of liability",
    content: (
      <p>
        To the maximum extent permitted by law, we will not be liable for any
        indirect, incidental, special, consequential, or punitive damages, or
        for any loss of data, profits, or goodwill, arising from or related to
        your use of the Service. Our total aggregate liability for any claim
        relating to the Service will not exceed the greater of (a) the amount
        you paid us for the Service in the twelve months before the claim, or
        (b) INR 1,000.
      </p>
    ),
  },
  {
    id: "indemnification",
    heading: "Indemnification",
    content: (
      <p>
        You agree to indemnify and hold harmless the operator of getissues from
        any claims, damages, liabilities, and expenses (including reasonable
        legal fees) arising out of or related to your use of the Service, the
        content you submit, your contributions to third-party projects, or your
        breach of these Terms.
      </p>
    ),
  },
  {
    id: "termination",
    heading: "Suspension, termination, and account deletion",
    content: (
      <>
        <p>
          You may stop using the Service at any time and may delete your account
          from the dashboard settings, which removes your account and associated
          data as described in our{" "}
          <a href="/privacy-policy">Privacy Policy</a>.
        </p>
        <p>
          We may suspend or terminate your access if you violate these Terms or
          if we reasonably believe your use poses a risk to the Service, other
          users, or third parties. Provisions that by their nature should
          survive termination (including intellectual property, disclaimers,
          liability, and indemnification) will survive.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    heading: "Changes to these Terms",
    content: (
      <p>
        We may update these Terms from time to time. When we do, we will revise
        the &quot;Last updated&quot; date above. Material changes will be
        communicated where reasonably possible. Your continued use of the
        Service after changes take effect constitutes acceptance of the updated
        Terms.
      </p>
    ),
  },
  {
    id: "governing-law",
    heading: "Governing law and disputes",
    content: (
      <p>
        These Terms are governed by the laws of India, without regard to
        conflict-of-law principles. Any dispute arising out of or relating to
        these Terms or the Service will be subject to the exclusive jurisdiction
        of the courts located in India. Before bringing a formal claim, you
        agree to try to resolve the dispute informally by contacting us at{" "}
        <a href="mailto:support@getissues.tech">support@getissues.tech</a>.
      </p>
    ),
  },
  {
    id: "contact",
    heading: "Contact",
    content: (
      <p>
        Questions about these Terms? Email us at{" "}
        <a href="mailto:support@getissues.tech">support@getissues.tech</a>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      description="These Terms explain the rules for using getissues, an AI-powered service that recommends open source issues based on your skills and interests."
      lastUpdated={lastUpdated}
      sections={sections}
    />
  );
}
