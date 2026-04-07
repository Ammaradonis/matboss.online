import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Footer from '../components/Footer';

export default function PrivacyPolicyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-dojo-black text-gray-300">
      <SEO
        title="Privacy Policy — MatBoss by Ammar Alkheder"
        description="Privacy Policy for MatBoss, the enrollment automation platform for San Diego martial arts schools. CCPA/CPRA compliant. By Ammar Alkheder."
        canonical="/privacy"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Privacy Policy', url: '/privacy' },
        ]}
      />
      <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        {/* Back link */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-12">
          &larr; Back to Home
        </Link>

        {/* Header */}
        <div className="mb-12 border-b border-white/10 pb-8">
          <h1 className="font-heading text-4xl md:text-5xl text-white tracking-wider mb-2">PRIVACY POLICY</h1>
          <p className="text-lg text-dojo-red font-heading tracking-wide">MATBOSS</p>
          <p className="text-sm text-gray-500 mt-1">by Ammar Alkheder</p>
          <p className="text-sm text-gray-500">Enrollment Automation for San Diego Martial Arts Schools</p>
          <div className="mt-4 text-sm text-gray-500 space-y-1">
            <p>Last Updated: April 1, 2026</p>
            <p>Effective Date: April 1, 2026</p>
          </div>
        </div>

        <div className="space-y-10 text-sm leading-relaxed [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:text-white [&_h2]:tracking-wider [&_h2]:mb-4 [&_h2]:pt-4 [&_h2]:border-t [&_h2]:border-white/5">
          {/* Intro */}
          <div>
            <p className="mb-3">
              This Privacy Policy ("Policy") describes how Ammar Alkheder, doing business as MatBoss ("Company," "we," "us," or "our"), collects, uses, discloses, and otherwise processes personal information in connection with our enrollment automation platform, website (www.matboss.online), mobile applications, and related services (collectively, the "Services"). This Policy applies to martial arts school owners, operators, staff members, prospective students, trial participants, and all other individuals whose information we process in connection with our Services.
            </p>
            <p className="mb-3">
              By accessing or using our Services, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy. If you do not agree with the practices described herein, you must discontinue use of the Services immediately.
            </p>
            <p>
              We are committed to protecting the privacy of the martial arts school community in San Diego and beyond. This Policy is designed to be transparent, precise, and structured — values we share with the martial arts professionals we serve.
            </p>
          </div>

          {/* Section 1 */}
          <div>
            <h2>1. DEFINITIONS AND INTERPRETATION</h2>
            <p className="mb-3">For the purposes of this Privacy Policy, the following definitions apply throughout this document and any supplemental privacy notices we may issue:</p>
            <p className="mb-3">"Personal Information" means any information that identifies, relates to, describes, is reasonably capable of being associated with, or could reasonably be linked, directly or indirectly, with a particular individual or household. This includes, but is not limited to, names, email addresses, phone numbers, IP addresses, device identifiers, and behavioral data.</p>
            <p className="mb-3">"Business Client" means a martial arts school owner, operator, or authorized representative who subscribes to or uses the MatBoss platform to manage enrollment workflows, trial bookings, reminders, no-show recovery, and enrollment follow-up processes.</p>
            <p className="mb-3">"End User" means any prospective student, parent, guardian, trial participant, or other individual whose information is processed through the MatBoss platform on behalf of a Business Client.</p>
            <p className="mb-3">"Processing" means any operation or set of operations performed on Personal Information, whether or not by automated means, including collection, recording, organization, structuring, storage, adaptation, retrieval, consultation, use, disclosure, dissemination, restriction, erasure, or destruction.</p>
            <p className="mb-3">"Service Data" means data generated through the use of the Services, including enrollment metrics, conversion rates, no-show percentages, trial-to-enrollment ratios, and other analytics derived from platform usage.</p>
            <p>"Subprocessor" means any third-party entity engaged by us to process Personal Information on behalf of a Business Client.</p>
          </div>

          {/* Section 2 */}
          <div>
            <h2>2. INFORMATION WE COLLECT</h2>
            <p className="mb-3">We collect information through various channels and interactions with our Services. The categories of information we collect depend on your relationship with us and how you interact with the MatBoss platform.</p>

            <h3 className="text-white font-semibold mt-4 mb-2">2.1 Information Provided Directly by Business Clients</h3>
            <p className="mb-3">When martial arts school owners or operators register for and use our Services, we collect: full legal name and business name; business address, phone number, and email address; billing and payment information (processed through our third-party payment processor); staff and instructor contact details; school enrollment capacity and membership pricing; details regarding existing booking and scheduling systems (e.g., Zen Planner, MindBody, Kicksite, or similar platforms); and social media account information used for lead generation.</p>

            <h3 className="text-white font-semibold mt-4 mb-2">2.2 End User Information Processed on Behalf of Business Clients</h3>
            <p className="mb-3">Through the enrollment automation workflows, we process information about prospective and current students on behalf of our Business Clients, including: name, email address, and phone number submitted through trial booking forms; age, belt rank, and martial arts discipline preferences; trial attendance records and no-show data; communication history (SMS reminders, email follow-ups, and automated messages); enrollment status and conversion history; and parent or guardian information for minor participants.</p>

            <h3 className="text-white font-semibold mt-4 mb-2">2.3 Information Collected Automatically</h3>
            <p className="mb-3">When you access our website or platform, we automatically collect: IP address and approximate geolocation; browser type, version, and operating system; device identifiers and mobile advertising IDs; pages visited, features used, and clickstream data; referring and exit URLs; date, time, and duration of access; and cookies and similar tracking technologies as described in Section 9.</p>

            <h3 className="text-white font-semibold mt-4 mb-2">2.4 Information from Third-Party Sources</h3>
            <p>We may receive information from third-party sources, including: social media platforms when leads interact with Business Client advertising; integration partners and booking software APIs; publicly available business listings and directories; and analytics and advertising partners.</p>
          </div>

          {/* Section 3 */}
          <div>
            <h2>3. HOW WE USE YOUR INFORMATION</h2>
            <p className="mb-3">We process Personal Information for the following purposes, each supported by a valid legal basis as described in Section 4:</p>
            <ul className="space-y-2 list-disc list-inside pl-2">
              <li>Providing and maintaining the MatBoss platform, including trial booking automation, reminder delivery, no-show recovery sequences, and enrollment follow-up workflows.</li>
              <li>Managing Business Client accounts, processing payments, and delivering customer support.</li>
              <li>Sending automated communications on behalf of Business Clients to End Users, including trial reminders, booking confirmations, post-trial follow-ups, and enrollment prompts.</li>
              <li>Generating analytics and reporting for Business Clients, including trial-to-show percentages, show-to-enrollment conversion rates, lifetime student value calculations, and revenue impact metrics.</li>
              <li>Improving, optimizing, and developing new features for the Services based on usage patterns and feedback.</li>
              <li>Detecting, preventing, and responding to fraud, security incidents, and technical issues.</li>
              <li>Complying with legal obligations, including responding to lawful requests from governmental authorities.</li>
              <li>Communicating with Business Clients regarding service updates, policy changes, and operational notices.</li>
              <li>Conducting research and analysis on enrollment trends across martial arts schools in San Diego and, in the future, other California markets.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div>
            <h2>4. LEGAL BASES FOR PROCESSING</h2>
            <p className="mb-3">We rely on the following legal bases for processing Personal Information:</p>
            <p className="mb-3"><strong className="text-white">Contractual Necessity.</strong> Processing is necessary for the performance of our contract with Business Clients, including delivery of enrollment automation services, analytics, and support.</p>
            <p className="mb-3"><strong className="text-white">Legitimate Interests.</strong> We process data where we have a legitimate business interest that is not overridden by the rights of the individual, such as improving our Services, ensuring security, and conducting business analytics.</p>
            <p className="mb-3"><strong className="text-white">Consent.</strong> Where required by applicable law, we obtain consent before processing Personal Information, particularly for marketing communications and certain cookie deployments.</p>
            <p><strong className="text-white">Legal Obligation.</strong> We process data as necessary to comply with applicable federal, state, and local laws, including the California Consumer Privacy Act (CCPA), as amended by the California Privacy Rights Act (CPRA).</p>
          </div>

          {/* Section 5 */}
          <div>
            <h2>5. DATA SHARING AND DISCLOSURE</h2>
            <p className="mb-4 font-semibold text-white">We do not sell Personal Information. We share information only in the following limited circumstances:</p>

            <h3 className="text-white font-semibold mt-4 mb-2">5.1 With Business Clients</h3>
            <p className="mb-3">End User data collected through the enrollment automation workflow is accessible to the Business Client on whose behalf the data was collected. Business Clients control how they use this data within their own school operations.</p>

            <h3 className="text-white font-semibold mt-4 mb-2">5.2 Service Providers and Subprocessors</h3>
            <p className="mb-3">We engage trusted third-party service providers to assist in delivering the Services, including cloud hosting and infrastructure providers; SMS and email delivery platforms; payment processors; analytics and monitoring tools; and customer support platforms. All Subprocessors are contractually bound to process data only as instructed and to maintain appropriate security measures.</p>

            <h3 className="text-white font-semibold mt-4 mb-2">5.3 Legal and Compliance Disclosures</h3>
            <p className="mb-3">We may disclose information when required by law, regulation, legal process, or governmental request; when necessary to protect the rights, safety, or property of our Company, Business Clients, or others; in connection with the investigation or prevention of fraud or other illegal activities; or as part of a merger, acquisition, reorganization, or sale of assets, in which case the successor entity will be bound by this Policy.</p>

            <h3 className="text-white font-semibold mt-4 mb-2">5.4 Aggregated and De-Identified Data</h3>
            <p>We may share aggregated or de-identified data that cannot reasonably be used to identify any individual. This may include industry benchmarks, enrollment trend analyses, and conversion rate studies for the San Diego martial arts school market.</p>
          </div>

          {/* Section 6 */}
          <div>
            <h2>6. DATA RETENTION</h2>
            <p className="mb-3">We retain Personal Information for as long as necessary to fulfill the purposes described in this Policy, unless a longer retention period is required or permitted by law.</p>
            <p className="mb-3"><strong className="text-white">Business Client Data.</strong> Account and billing information is retained for the duration of the subscription relationship and for a period of seven (7) years thereafter for tax, legal, and audit purposes.</p>
            <p className="mb-3"><strong className="text-white">End User Data.</strong> Information processed on behalf of Business Clients is retained in accordance with the Business Client's instructions and our data processing agreement. Upon termination of a Business Client's subscription, End User data is deleted or returned within sixty (60) days, unless retention is required by law.</p>
            <p className="mb-3"><strong className="text-white">Automated Logs.</strong> Server logs, access records, and system-generated data are retained for a maximum of twenty-four (24) months for security, debugging, and compliance purposes.</p>
            <p><strong className="text-white">Marketing Data.</strong> Contact information used for direct marketing is retained until the individual opts out or withdraws consent, plus a suppression period of thirty-six (36) months to ensure the opt-out is honored.</p>
          </div>

          {/* Section 7 */}
          <div>
            <h2>7. DATA SECURITY</h2>
            <p className="mb-3">We implement and maintain administrative, technical, and physical safeguards designed to protect Personal Information against unauthorized access, alteration, disclosure, or destruction. Our security program includes:</p>
            <ul className="space-y-2 list-disc list-inside pl-2 mb-3">
              <li>Encryption of data in transit using TLS 1.2 or higher, and encryption of data at rest using AES-256 or equivalent standards.</li>
              <li>Role-based access controls limiting data access to authorized personnel on a need-to-know basis.</li>
              <li>Regular vulnerability assessments, penetration testing, and code reviews.</li>
              <li>Incident response and breach notification procedures compliant with applicable California law.</li>
              <li>Employee security awareness training and confidentiality agreements.</li>
              <li>Secure software development lifecycle practices, including input validation, output encoding, and parameterized queries.</li>
              <li>Multi-factor authentication for administrative access to the platform.</li>
              <li>Regular backup procedures with encrypted off-site storage.</li>
            </ul>
            <p>
              While we strive to protect Personal Information, no method of electronic transmission or storage is entirely secure. We cannot guarantee absolute security but commit to promptly notifying affected parties and relevant authorities in the event of a confirmed data breach, consistent with California Civil Code Section 1798.82.
            </p>
          </div>

          {/* Section 8 */}
          <div>
            <h2>8. YOUR RIGHTS UNDER CALIFORNIA LAW (CCPA/CPRA)</h2>
            <p className="mb-3">If you are a California resident, you have specific rights regarding your Personal Information under the California Consumer Privacy Act, as amended by the California Privacy Rights Act. These rights include:</p>
            <p className="mb-3"><strong className="text-white">Right to Know.</strong> You may request that we disclose the categories and specific pieces of Personal Information we have collected about you, the categories of sources, the business purposes for collection, and the categories of third parties with whom we have shared your information.</p>
            <p className="mb-3"><strong className="text-white">Right to Delete.</strong> You may request the deletion of Personal Information we have collected, subject to certain exceptions permitted under law.</p>
            <p className="mb-3"><strong className="text-white">Right to Correct.</strong> You may request correction of inaccurate Personal Information that we maintain about you.</p>
            <p className="mb-3"><strong className="text-white">Right to Opt Out of Sale or Sharing.</strong> We do not sell or share Personal Information for cross-context behavioral advertising. Should this practice change, we will provide a clear opt-out mechanism.</p>
            <p className="mb-3"><strong className="text-white">Right to Limit Use of Sensitive Personal Information.</strong> To the extent we process sensitive Personal Information, you may direct us to limit its use to purposes necessary to perform the Services.</p>
            <p className="mb-3"><strong className="text-white">Right to Non-Discrimination.</strong> We will not discriminate against you for exercising any of your privacy rights.</p>
            <p>
              To submit a request, contact us at <a href="mailto:privacy@matboss.online" className="text-dojo-red hover:underline">privacy@matboss.online</a> or through the contact methods described in Section 23. We will verify your identity before processing any request and respond within forty-five (45) calendar days, with the possibility of a forty-five (45) day extension where reasonably necessary.
            </p>
          </div>

          {/* Section 9 */}
          <div>
            <h2>9. COOKIES AND TRACKING TECHNOLOGIES</h2>
            <p className="mb-3">We use cookies and similar technologies to operate, analyze, and improve the Services. The categories of cookies we deploy include:</p>
            <p className="mb-3"><strong className="text-white">Strictly Necessary Cookies.</strong> Required for the basic functioning of the platform, such as session management and authentication. These cookies cannot be disabled.</p>
            <p className="mb-3"><strong className="text-white">Performance and Analytics Cookies.</strong> Used to understand how visitors interact with our website and platform, including page views, navigation paths, and feature usage. We use tools such as Google Analytics and similar services.</p>
            <p className="mb-3"><strong className="text-white">Functional Cookies.</strong> Enable enhanced functionality and personalization, such as remembering user preferences and display settings.</p>
            <p className="mb-3"><strong className="text-white">Marketing and Advertising Cookies.</strong> Used to deliver relevant content and measure the effectiveness of campaigns. These are deployed only with your consent where required by law.</p>
            <p>You may manage your cookie preferences through your browser settings or, where available, through our cookie consent mechanism. Note that disabling certain cookies may impair the functionality of the Services.</p>
          </div>

          {/* Section 10 */}
          <div>
            <h2>10. AUTOMATED DECISION-MAKING AND PROFILING</h2>
            <p className="mb-3">The MatBoss platform uses automated processes to deliver its core enrollment automation functionality, including:</p>
            <ul className="space-y-2 list-disc list-inside pl-2 mb-3">
              <li>Scheduling and triggering reminder sequences based on trial booking data.</li>
              <li>Identifying no-show patterns and initiating recovery workflows.</li>
              <li>Calculating enrollment probability scores based on engagement metrics.</li>
              <li>Prioritizing follow-up sequences based on lead responsiveness.</li>
            </ul>
            <p>
              These automated processes are integral to the Services and are performed on behalf of Business Clients. End Users who have questions or concerns about automated decision-making should contact the relevant martial arts school directly. Business Clients may configure or override automated decisions through the platform's administrative dashboard.
            </p>
          </div>

          {/* Section 11 */}
          <div>
            <h2>11. CHILDREN'S PRIVACY</h2>
            <p className="mb-3">
              The MatBoss platform is a business-to-business service designed for martial arts school operators. We do not knowingly direct our marketing efforts toward, or solicit Personal Information directly from, children under the age of thirteen (13).
            </p>
            <p className="mb-3">
              However, we recognize that martial arts schools serve minors and that End User data processed through the platform may include information about children. In such cases, the Business Client is responsible for obtaining appropriate parental or guardian consent in compliance with the Children's Online Privacy Protection Act (COPPA) and California law.
            </p>
            <p>
              If we become aware that we have inadvertently collected Personal Information directly from a child under thirteen (13) without verified parental consent, we will take prompt steps to delete such information. If you believe a child's information has been improperly collected, please contact us at <a href="mailto:privacy@matboss.online" className="text-dojo-red hover:underline">privacy@matboss.online</a>.
            </p>
          </div>

          {/* Section 12 */}
          <div>
            <h2>12. INTERNATIONAL DATA TRANSFERS</h2>
            <p className="mb-3">
              Our Services are currently operated and hosted within the United States. If you access the Services from outside the United States, you understand and agree that your information may be transferred to, stored, and processed in the United States, where data protection laws may differ from those in your jurisdiction.
            </p>
            <p>
              We implement appropriate safeguards for any cross-border data transfers, including standard contractual clauses where applicable, and ensure that any Subprocessors receiving data outside the original jurisdiction maintain adequate levels of data protection.
            </p>
          </div>

          {/* Section 13 */}
          <div>
            <h2>13. THIRD-PARTY INTEGRATIONS AND LINKS</h2>
            <p className="mb-3">
              The Services may integrate with or contain links to third-party platforms, including but not limited to booking software (e.g., Zen Planner, MindBody, Kicksite), social media platforms, payment processors, and communication tools. This Privacy Policy does not apply to the practices of third parties that we do not own or control.
            </p>
            <p>
              We encourage you to review the privacy policies of any third-party service before providing your information. We are not responsible for the privacy practices or content of third-party websites, applications, or services.
            </p>
          </div>

          {/* Section 14 */}
          <div>
            <h2>14. DATA PROCESSING AGREEMENTS</h2>
            <p className="mb-3">
              Where we process Personal Information on behalf of Business Clients, we act as a "service provider" (as defined under the CCPA/CPRA) or "data processor" (as applicable under other frameworks). Our data processing agreements with Business Clients specify:
            </p>
            <ul className="space-y-2 list-disc list-inside pl-2 mb-3">
              <li>The subject matter, duration, nature, and purpose of processing.</li>
              <li>The types of Personal Information processed and categories of data subjects.</li>
              <li>The obligations and rights of the Business Client as data controller.</li>
              <li>Instructions for processing, including restrictions on further use.</li>
              <li>Requirements for subprocessor engagement and oversight.</li>
              <li>Data breach notification timelines and procedures.</li>
              <li>Data return and deletion obligations upon contract termination.</li>
              <li>Audit rights and compliance verification mechanisms.</li>
            </ul>
            <p>
              Business Clients may request a copy of our standard Data Processing Agreement by contacting <a href="mailto:privacy@matboss.online" className="text-dojo-red hover:underline">privacy@matboss.online</a>.
            </p>
          </div>

          {/* Section 15 */}
          <div>
            <h2>15. SMS AND EMAIL COMMUNICATIONS</h2>
            <p className="mb-3">The MatBoss platform sends automated SMS messages and emails on behalf of Business Clients as part of the enrollment automation workflow. These communications include:</p>
            <ul className="space-y-2 list-disc list-inside pl-2 mb-3">
              <li>Trial booking confirmations.</li>
              <li>Appointment reminder sequences (typically sent at 24-hour and 1-hour intervals prior to a scheduled trial).</li>
              <li>No-show recovery messages sent to individuals who miss scheduled trials.</li>
              <li>Post-trial follow-up sequences designed to facilitate enrollment conversion.</li>
              <li>Administrative communications related to scheduling changes or cancellations.</li>
            </ul>
            <p className="mb-3">
              All automated SMS communications comply with the Telephone Consumer Protection Act (TCPA) and applicable Federal Communications Commission (FCC) regulations. End Users may opt out of SMS communications at any time by replying "STOP" to any message. Opt-out requests are processed within a commercially reasonable timeframe, typically within twenty-four (24) hours.
            </p>
            <p>
              Business Clients are responsible for ensuring that appropriate consent has been obtained from End Users before initiating automated communication sequences through the platform.
            </p>
          </div>

          {/* Section 16 */}
          <div>
            <h2>16. DATA PORTABILITY AND INTEROPERABILITY</h2>
            <p className="mb-3">
              Business Clients may request export of their data, including enrollment records, communication logs, analytics reports, and End User information, in a structured, commonly used, and machine-readable format (e.g., CSV, JSON). Data export requests are fulfilled within thirty (30) calendar days.
            </p>
            <p>
              The MatBoss platform is designed to operate alongside existing booking and management software. We do not replace your current systems. We integrate with and augment them to increase conversion at each stage of the enrollment funnel.
            </p>
          </div>

          {/* Section 17 */}
          <div>
            <h2>17. INCIDENT RESPONSE AND BREACH NOTIFICATION</h2>
            <p className="mb-3">We maintain a documented incident response plan that includes identification, containment, eradication, recovery, and post-incident analysis procedures. In the event of a confirmed security breach involving Personal Information:</p>
            <ul className="space-y-2 list-disc list-inside pl-2">
              <li>We will notify affected Business Clients without unreasonable delay and in no event later than seventy-two (72) hours after becoming aware of the breach.</li>
              <li>We will provide a description of the nature of the breach, the categories and approximate number of affected records, the likely consequences, and the measures taken or proposed to mitigate harm.</li>
              <li>We will notify the California Attorney General if the breach affects more than five hundred (500) California residents, as required by California Civil Code Section 1798.82(f).</li>
              <li>We will cooperate with Business Clients in fulfilling their own notification obligations to End Users and regulatory authorities.</li>
            </ul>
          </div>

          {/* Section 18 */}
          <div>
            <h2>18. DO NOT TRACK SIGNALS</h2>
            <p className="mb-3">
              Some web browsers transmit "Do Not Track" (DNT) signals. As there is no universally accepted standard for how to respond to DNT signals, we do not currently alter our data collection practices upon receiving such signals. If a uniform standard is adopted, we will update this Policy to reflect our compliance approach.
            </p>
            <p>
              California residents may also use the Global Privacy Control (GPC) signal to opt out of the sale or sharing of Personal Information. We honor GPC signals as valid opt-out requests in compliance with the CCPA/CPRA.
            </p>
          </div>

          {/* Section 19 */}
          <div>
            <h2>19. UPDATES TO THIS PRIVACY POLICY</h2>
            <p className="mb-3">We may update this Privacy Policy from time to time to reflect changes in our practices, the Services, legal requirements, or industry standards. When we make material changes:</p>
            <ul className="space-y-2 list-disc list-inside pl-2 mb-3">
              <li>We will update the "Last Updated" date at the top of this Policy.</li>
              <li>We will provide prominent notice through the platform dashboard, email notification to Business Clients, or other appropriate channels.</li>
              <li>For changes that materially affect the processing of End User data, we will provide at least thirty (30) days' advance notice before the changes take effect.</li>
              <li>Continued use of the Services after the effective date of an updated Policy constitutes acceptance of the revised terms.</li>
            </ul>
            <p>We encourage you to review this Policy periodically to remain informed about our data practices.</p>
          </div>

          {/* Section 20 */}
          <div>
            <h2>20. GOVERNING LAW AND DISPUTE RESOLUTION</h2>
            <p className="mb-3">This Privacy Policy is governed by and construed in accordance with the laws of the State of California, without regard to its conflict of laws principles. Any dispute arising out of or relating to this Policy or our data practices shall be resolved as follows:</p>
            <ul className="space-y-2 list-disc list-inside pl-2">
              <li>The parties shall first attempt to resolve any dispute through good-faith negotiation for a period of thirty (30) days.</li>
              <li>If negotiation is unsuccessful, the dispute shall be submitted to binding arbitration administered by JAMS in San Diego County, California, under its Streamlined Arbitration Rules and Procedures.</li>
              <li>The arbitrator's decision shall be final and binding, and judgment may be entered in any court of competent jurisdiction.</li>
              <li>Each party shall bear its own costs and attorneys' fees, unless the arbitrator determines otherwise.</li>
              <li>Notwithstanding the foregoing, either party may seek injunctive or other equitable relief in a court of competent jurisdiction to prevent irreparable harm.</li>
            </ul>
          </div>

          {/* Section 21 */}
          <div>
            <h2>21. ACCESSIBILITY</h2>
            <p className="mb-3">
              We are committed to ensuring that this Privacy Policy is accessible to all individuals, including those with disabilities. This document is available in the following formats upon request: HTML format optimized for screen readers; plain text; large print; and alternative formats as reasonably accommodated.
            </p>
            <p>
              If you require this Policy in an alternative format or have difficulty accessing any portion of it, please contact us at <a href="mailto:privacy@matboss.online" className="text-dojo-red hover:underline">privacy@matboss.online</a> and we will work with you to provide the information in a usable format.
            </p>
          </div>

          {/* Section 22 */}
          <div>
            <h2>22. CALIFORNIA-SPECIFIC DISCLOSURES</h2>
            <p className="mb-3">In compliance with the CCPA/CPRA, we provide the following additional disclosures for California residents:</p>
            <p className="mb-3"><strong className="text-white">Categories of Personal Information Collected.</strong> Identifiers; commercial information; internet or other electronic network activity; geolocation data; professional or employment-related information; and inferences drawn from the above.</p>
            <p className="mb-3"><strong className="text-white">Business or Commercial Purpose for Collection.</strong> Providing the Services; analytics and reporting; improving the platform; security and fraud prevention; and legal compliance.</p>
            <p className="mb-3"><strong className="text-white">Categories of Third Parties to Whom Information Is Disclosed.</strong> Service providers (cloud hosting, communication platforms, payment processors); Business Clients (for End User data); and legal and regulatory authorities (when required).</p>
            <p className="mb-3"><strong className="text-white">Sale or Sharing of Personal Information.</strong> We have not sold or shared (for cross-context behavioral advertising) the Personal Information of any California resident in the preceding twelve (12) months.</p>
            <p className="mb-3"><strong className="text-white">Retention Periods.</strong> As described in Section 6 of this Policy.</p>
            <p className="mb-3"><strong className="text-white">Sensitive Personal Information.</strong> We do not process categories of sensitive Personal Information as defined under the CPRA for purposes other than those expressly permitted under applicable law.</p>
            <p>California residents may designate an authorized agent to submit privacy requests on their behalf. Authorized agents must provide a valid power of attorney or written authorization signed by the consumer. We may require verification of both the agent's and the consumer's identity.</p>
          </div>

          {/* Section 23 */}
          <div>
            <h2>23. CONTACT INFORMATION</h2>
            <p className="mb-3">If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us using the following methods:</p>
            <div className="p-4 rounded-lg bg-dojo-carbon/50 border border-white/5 text-gray-400 space-y-1 mb-4">
              <p>Email: <a href="mailto:privacy@matboss.online" className="text-dojo-red hover:underline">privacy@matboss.online</a></p>
              <p>Mailing Address: Ammar Alkheder, Attn: Privacy Officer, San Diego, CA 92101</p>
            </div>
            <p className="mb-3">
              <strong className="text-white">Response Times:</strong> We aim to respond to all privacy-related inquiries within ten (10) business days. Requests submitted under the CCPA/CPRA will be acknowledged within ten (10) business days and substantively responded to within forty-five (45) calendar days.
            </p>
            <p>
              For End Users whose information is processed through the platform on behalf of a Business Client, we recommend first contacting the relevant martial arts school directly, as they are the controller of your data. If your inquiry is not resolved, you may contact us at the address above.
            </p>
          </div>

          {/* End */}
          <div className="pt-8 border-t border-white/10 text-center text-xs text-gray-600">
            <p>End of Privacy Policy</p>
            <p className="mt-2">&copy; 2026 Ammar Alkheder. All rights reserved.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
