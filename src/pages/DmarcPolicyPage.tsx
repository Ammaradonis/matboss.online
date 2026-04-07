import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Footer from '../components/Footer';

export default function DmarcPolicyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-dojo-black text-gray-300">
      <SEO
        title="DMARC Policy — MatBoss by Ammar Alkheder"
        description="DMARC email authentication policy for MatBoss, the enrollment automation platform for San Diego martial arts schools. By Ammar Alkheder."
        canonical="/dmarc"
        noindex
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'DMARC Policy', url: '/dmarc' },
        ]}
      />
      <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        {/* Back link */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-12">
          &larr; Back to Home
        </Link>

        {/* Header */}
        <div className="mb-12 border-b border-white/10 pb-8">
          <h1 className="font-heading text-4xl md:text-5xl text-white tracking-wider mb-2">DMARC POLICY</h1>
          <p className="text-lg text-dojo-red font-heading tracking-wide">MATBOSS</p>
          <p className="text-sm text-gray-500 mt-1">by Ammar Alkheder</p>
          <p className="text-sm text-gray-500">Enrollment Automation for San Diego Martial Arts Schools</p>
          <div className="mt-4 text-sm text-gray-500 space-y-1">
            <p>Last Updated: April 3, 2026</p>
            <p>Effective Date: April 3, 2026</p>
          </div>
        </div>

        <div className="space-y-10 text-sm leading-relaxed [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:text-white [&_h2]:tracking-wider [&_h2]:mb-4 [&_h2]:pt-4 [&_h2]:border-t [&_h2]:border-white/5">
          {/* Intro */}
          <div>
            <p className="mb-3">
              This DMARC Policy describes how Ammar Alkheder, doing business as MatBoss ("Company," "we," "us," or "our"), implements Domain-based Message Authentication, Reporting, and Conformance (DMARC) along with supporting email authentication protocols to protect our domain, our Business Clients, and End Users from email fraud, phishing, and spoofing attacks.
            </p>
            <p>
              Email authentication is a critical component of our security posture. As an enrollment automation platform that sends automated communications on behalf of martial arts schools in San Diego, we take the integrity and authenticity of every message seriously.
            </p>
          </div>

          {/* Section 1 */}
          <div>
            <h2>1. WHAT IS DMARC</h2>
            <p className="mb-3">
              DMARC (Domain-based Message Authentication, Reporting, and Conformance) is an email authentication protocol that builds upon two existing mechanisms — SPF (Sender Policy Framework) and DKIM (DomainKeys Identified Mail) — to provide domain-level protection against email spoofing and phishing.
            </p>
            <p className="mb-3">
              DMARC allows domain owners to publish policies in their DNS records that instruct receiving mail servers on how to handle messages that fail authentication checks. It also provides a reporting mechanism that enables domain owners to monitor and improve their email authentication posture over time.
            </p>
            <p>
              Together, SPF, DKIM, and DMARC form a layered defense that ensures only authorized senders can deliver email on behalf of the matboss.online domain.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h2>2. OUR EMAIL AUTHENTICATION FRAMEWORK</h2>
            <p className="mb-3">We implement the following email authentication protocols across all email sent from or on behalf of the matboss.online domain:</p>

            <h3 className="text-white font-semibold mt-4 mb-2">2.1 Sender Policy Framework (SPF)</h3>
            <p className="mb-3">
              SPF allows us to specify which mail servers and IP addresses are authorized to send email on behalf of our domain. Our SPF record is published in our DNS configuration and is maintained to reflect all legitimate sending sources, including our primary mail infrastructure, transactional email service providers, and marketing communication platforms.
            </p>

            <h3 className="text-white font-semibold mt-4 mb-2">2.2 DomainKeys Identified Mail (DKIM)</h3>
            <p className="mb-3">
              DKIM adds a digital signature to the headers of outgoing email messages. This cryptographic signature is verified by the receiving mail server against a public key published in our DNS records. DKIM ensures that the content of the message has not been altered in transit and confirms that the message was authorized by the domain owner.
            </p>

            <h3 className="text-white font-semibold mt-4 mb-2">2.3 DMARC</h3>
            <p>
              Our DMARC policy is published as a DNS TXT record and instructs receiving mail servers on how to handle messages that fail SPF and/or DKIM authentication. Our DMARC configuration includes a policy directive for unauthenticated messages, aggregate reporting to monitor authentication results across all sending sources, and forensic reporting for detailed analysis of authentication failures.
            </p>
          </div>

          {/* Section 3 */}
          <div>
            <h2>3. DMARC POLICY ENFORCEMENT</h2>
            <p className="mb-3">Our DMARC policy is configured to protect the matboss.online domain according to the following principles:</p>
            <ul className="space-y-2 list-disc list-inside pl-2 mb-3">
              <li>All outgoing email from the matboss.online domain must pass both SPF and DKIM alignment checks.</li>
              <li>Messages that fail DMARC authentication are subject to the policy action specified in our DMARC DNS record (none, quarantine, or reject), which we adjust based on monitoring data and operational readiness.</li>
              <li>We regularly review DMARC aggregate and forensic reports to identify unauthorized use of our domain, misconfigured sending sources, and potential phishing or spoofing campaigns.</li>
              <li>We progressively strengthen our DMARC policy enforcement as we confirm that all legitimate email sources are properly authenticated.</li>
            </ul>
            <p>
              The specific enforcement level (p=none, p=quarantine, or p=reject) of our DMARC policy may change over time as we optimize our email authentication posture. Our goal is to maintain the strictest enforcement level that ensures reliable delivery of legitimate communications while maximizing protection against unauthorized email.
            </p>
          </div>

          {/* Section 4 */}
          <div>
            <h2>4. SCOPE OF PROTECTED COMMUNICATIONS</h2>
            <p className="mb-3">Our DMARC policy applies to all email communications sent from or on behalf of the matboss.online domain, including but not limited to:</p>
            <ul className="space-y-2 list-disc list-inside pl-2">
              <li>Automated trial booking confirmations and reminder sequences sent to End Users on behalf of our Business Clients.</li>
              <li>No-show recovery messages and post-trial enrollment follow-up communications.</li>
              <li>Administrative and operational notifications to Business Clients, including account alerts, billing communications, and service updates.</li>
              <li>Marketing and promotional communications, where consent has been obtained.</li>
              <li>Transactional emails including password resets, account verifications, and security notifications.</li>
              <li>Internal business communications sent from matboss.online email addresses.</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div>
            <h2>5. THIRD-PARTY SENDING SERVICES</h2>
            <p className="mb-3">
              The MatBoss platform relies on trusted third-party email service providers to deliver automated communications at scale. All third-party sending services used by MatBoss are required to:
            </p>
            <ul className="space-y-2 list-disc list-inside pl-2 mb-3">
              <li>Be explicitly authorized in our SPF record.</li>
              <li>Sign all outgoing messages with a valid DKIM signature aligned to the matboss.online domain.</li>
              <li>Comply with our DMARC policy and support DMARC alignment requirements.</li>
              <li>Maintain industry-standard security practices, including encryption of data in transit and at rest.</li>
            </ul>
            <p>
              We regularly audit our third-party sending sources to ensure compliance with our authentication requirements. Unauthorized third-party use of the matboss.online domain for email delivery is strictly prohibited.
            </p>
          </div>

          {/* Section 6 */}
          <div>
            <h2>6. MONITORING AND REPORTING</h2>
            <p className="mb-3">We maintain an active DMARC monitoring program that includes:</p>
            <ul className="space-y-2 list-disc list-inside pl-2 mb-3">
              <li><strong className="text-white">Aggregate Reports (RUA).</strong> We receive daily aggregate reports from receiving mail servers that summarize authentication results for all messages claiming to originate from the matboss.online domain. These reports are analyzed to identify trends, detect unauthorized sending sources, and verify that legitimate email is passing authentication checks.</li>
              <li><strong className="text-white">Forensic Reports (RUF).</strong> Where supported by receiving mail servers, we receive forensic reports containing detailed information about individual messages that fail DMARC authentication. These reports are used for incident investigation and to rapidly identify and respond to spoofing attempts.</li>
              <li><strong className="text-white">Regular Audits.</strong> We conduct periodic reviews of our SPF, DKIM, and DMARC configurations to ensure accuracy, completeness, and alignment with current sending practices.</li>
            </ul>
            <p>
              All DMARC reports are processed and stored in accordance with our data retention policies and applicable privacy laws.
            </p>
          </div>

          {/* Section 7 */}
          <div>
            <h2>7. PROTECTION AGAINST PHISHING AND SPOOFING</h2>
            <p className="mb-3">
              DMARC is a critical line of defense against phishing attacks that attempt to impersonate MatBoss or our Business Clients. By enforcing DMARC, we help ensure that:
            </p>
            <ul className="space-y-2 list-disc list-inside pl-2 mb-3">
              <li>End Users receiving automated messages from the MatBoss platform can trust that the messages are authentic and have not been tampered with.</li>
              <li>Business Clients are protected from reputational harm caused by fraudulent emails sent using the matboss.online domain.</li>
              <li>Prospective students and their families can interact with trial booking confirmations, reminders, and follow-ups with confidence in their legitimacy.</li>
              <li>Our domain reputation is preserved, supporting high deliverability rates for legitimate communications.</li>
            </ul>
            <p>
              If you receive a suspicious email that appears to originate from matboss.online or any MatBoss-related address, please report it immediately to <a href="mailto:security@matboss.online" className="text-dojo-red hover:underline">security@matboss.online</a>.
            </p>
          </div>

          {/* Section 8 */}
          <div>
            <h2>8. BUSINESS CLIENT RESPONSIBILITIES</h2>
            <p className="mb-3">
              Business Clients who use custom domains or branded email addresses in conjunction with the MatBoss platform are encouraged to implement their own DMARC, SPF, and DKIM configurations. We recommend the following best practices for Business Clients:
            </p>
            <ul className="space-y-2 list-disc list-inside pl-2">
              <li>Publish an SPF record that authorizes all legitimate email sources for your domain.</li>
              <li>Configure DKIM signing for all outbound email from your domain.</li>
              <li>Implement a DMARC policy starting with "p=none" for monitoring, then progressing to "p=quarantine" and ultimately "p=reject" as you confirm full alignment.</li>
              <li>Monitor DMARC aggregate reports to ensure all legitimate email passes authentication.</li>
              <li>Report any suspected phishing or spoofing attacks targeting your domain to your email provider and to MatBoss at <a href="mailto:security@matboss.online" className="text-dojo-red hover:underline">security@matboss.online</a>.</li>
            </ul>
          </div>

          {/* Section 9 */}
          <div>
            <h2>9. COMPLIANCE AND STANDARDS</h2>
            <p className="mb-3">Our DMARC implementation aligns with the following industry standards and best practices:</p>
            <ul className="space-y-2 list-disc list-inside pl-2">
              <li>RFC 7489 — Domain-based Message Authentication, Reporting, and Conformance (DMARC).</li>
              <li>RFC 7208 — Sender Policy Framework (SPF) for Authorizing Use of Domains in Email.</li>
              <li>RFC 6376 — DomainKeys Identified Mail (DKIM) Signatures.</li>
              <li>NIST Special Publication 800-177 — Trustworthy Email.</li>
              <li>Federal Trade Commission (FTC) guidance on email authentication for businesses.</li>
              <li>Anti-Phishing Working Group (APWG) recommendations for domain protection.</li>
            </ul>
          </div>

          {/* Section 10 */}
          <div>
            <h2>10. UPDATES TO THIS DMARC POLICY</h2>
            <p className="mb-3">
              We may update this DMARC Policy from time to time to reflect changes in our email authentication practices, infrastructure, or applicable standards. When we make material changes, we will update the "Last Updated" date at the top of this page.
            </p>
            <p>
              We encourage Business Clients and other interested parties to review this policy periodically to stay informed about our email authentication practices.
            </p>
          </div>

          {/* Section 11 */}
          <div>
            <h2>11. CONTACT INFORMATION</h2>
            <p className="mb-3">
              If you have questions about this DMARC Policy, wish to report a suspicious email, or need assistance with email authentication for your martial arts school's domain, please contact us:
            </p>
            <div className="p-4 rounded-lg bg-dojo-carbon/50 border border-white/5 text-gray-400 space-y-1 mb-4">
              <p>Security Inquiries: <a href="mailto:security@matboss.online" className="text-dojo-red hover:underline">security@matboss.online</a></p>
              <p>General Inquiries: <a href="mailto:info@matboss.online" className="text-dojo-red hover:underline">info@matboss.online</a></p>
              <p>Mailing Address: Ammar Alkheder, Attn: Security, San Diego, CA 92101</p>
            </div>
            <p>
              For urgent security concerns, including active phishing campaigns targeting the matboss.online domain, please email <a href="mailto:security@matboss.online" className="text-dojo-red hover:underline">security@matboss.online</a> with the subject line "URGENT: Phishing Report" and include any relevant message headers or screenshots.
            </p>
          </div>

          {/* End */}
          <div className="pt-8 border-t border-white/10 text-center text-xs text-gray-600">
            <p>End of DMARC Policy</p>
            <p className="mt-2">&copy; 2026 Ammar Alkheder. All rights reserved.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
