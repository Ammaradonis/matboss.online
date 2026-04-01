import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

export default function TermsOfServicePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-dojo-black text-gray-300">
      <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        {/* Back link */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-12">
          &larr; Back to Home
        </Link>

        {/* Header */}
        <div className="mb-12 border-b border-white/10 pb-8">
          <h1 className="font-heading text-4xl md:text-5xl text-white tracking-wider mb-2">TERMS OF SERVICE</h1>
          <p className="text-lg text-dojo-red font-heading tracking-wide">MATBOSS</p>
          <p className="text-sm text-gray-500 mt-1">Enrollment Automation for San Diego Martial Arts Schools</p>
          <div className="mt-4 text-sm text-gray-500 space-y-1">
            <p>Ammar Alkheder</p>
            <p>Effective Date: April 1, 2026</p>
            <p>Last Updated: April 1, 2026</p>
            <p>www.matboss.online</p>
          </div>
        </div>

        <p className="text-sm font-semibold text-white mb-8 p-4 border border-dojo-red/30 rounded-lg bg-dojo-red/5">
          PLEASE READ THESE TERMS CAREFULLY BEFORE USING THE SERVICE. BY ACCESSING OR USING THE MATBOSS PLATFORM, YOU AGREE TO BE BOUND BY THESE TERMS.
        </p>

        {/* Table of Contents */}
        <div className="mb-12 p-6 rounded-xl bg-dojo-carbon/50 border border-white/5">
          <h2 className="font-heading text-xl text-white tracking-wider mb-4">TABLE OF CONTENTS</h2>
          <ol className="space-y-1 text-sm text-gray-400 list-decimal list-inside">
            <li>Definitions and Interpretation</li>
            <li>Acceptance of Terms</li>
            <li>Description of the Service</li>
            <li>Eligibility and Account Registration</li>
            <li>Subscription Plans and Fees</li>
            <li>Payment Terms and Billing</li>
            <li>Free Trial and Pilot Period</li>
            <li>Permitted Use and Restrictions</li>
            <li>Customer Data and Data Ownership</li>
            <li>Privacy and Data Protection</li>
            <li>Intellectual Property Rights</li>
            <li>Third-Party Integrations</li>
            <li>Service Level Commitment</li>
            <li>Warranties and Disclaimers</li>
            <li>Limitation of Liability</li>
            <li>Indemnification</li>
            <li>Term, Renewal, and Termination</li>
            <li>Effect of Termination</li>
            <li>Modifications to Terms and Service</li>
            <li>Confidentiality</li>
            <li>Dispute Resolution and Arbitration</li>
            <li>General Provisions</li>
            <li>Contact Information</li>
          </ol>
        </div>

        <div className="space-y-10 text-sm leading-relaxed [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:text-white [&_h2]:tracking-wider [&_h2]:mb-4 [&_h2]:pt-4 [&_h2]:border-t [&_h2]:border-white/5">
          {/* Preamble */}
          <div>
            <h2>PREAMBLE</h2>
            <p className="mb-3">
              These Terms of Service (these "Terms") constitute a legally binding agreement between you ("Customer," "you," or "your") and Ammar Alkheder, doing business as MatBoss ("Company," "we," "us," or "our"), governing your access to and use of the MatBoss platform, including all related software, automation workflows, APIs, documentation, and support services (collectively, the "Service").
            </p>
            <p>
              The Service is designed exclusively for martial arts schools, academies, and dojos operating within the San Diego, California metropolitan area. By subscribing to, accessing, or using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you are entering into these Terms on behalf of a business entity, you represent and warrant that you have the authority to bind that entity to these Terms.
            </p>
          </div>

          {/* Section 1 */}
          <div>
            <h2>1. DEFINITIONS AND INTERPRETATION</h2>
            <p className="mb-3">In these Terms, the following capitalized terms shall have the meanings set forth below unless the context requires otherwise:</p>
            <p className="mb-3">"Authorized Users" means the Customer's employees, contractors, or agents who are authorized by Customer to access and use the Service under Customer's account.</p>
            <p className="mb-3">"Customer Data" means all data, content, records, and information submitted, uploaded, transmitted, or otherwise made available to the Service by or on behalf of Customer, including but not limited to student contact information, trial booking records, enrollment status data, follow-up communication logs, and payment records.</p>
            <p className="mb-3">"MatBoss" means the proprietary automation platform operated by the Company that automates trial booking reminders, no-show recovery sequences, and enrollment follow-up workflows for martial arts schools.</p>
            <p className="mb-3">"Service Period" means the duration of Customer's active subscription, commencing on the Effective Date and continuing through the applicable renewal or termination date.</p>
            <p className="mb-3">"Third-Party Booking Software" means any third-party scheduling, booking, or member management platform used by Customer (including but not limited to Zen Planner, Mindbody, Kicksite, PushPress, or Spark Membership) with which the Service may integrate.</p>
            <p className="mb-3">"Workflow" means any automated sequence of communications, reminders, or follow-up actions configured within the Service, including trial booking confirmations, pre-trial reminders, no-show recovery messages, and post-trial enrollment follow-ups.</p>
            <p>Words importing the singular include the plural and vice versa. References to "including" mean "including without limitation." Headings are for convenience only and shall not affect the interpretation of these Terms.</p>
          </div>

          {/* Section 2 */}
          <div>
            <h2>2. ACCEPTANCE OF TERMS</h2>
            <p className="mb-3">
              By creating an account, subscribing to a plan, or otherwise accessing the Service, you expressly agree to be bound by these Terms and our Privacy Policy, which is incorporated herein by reference. If you do not agree to all of these Terms, you must not access or use the Service.
            </p>
            <p>
              We may require you to accept updated Terms from time to time as a condition of continued use. Your continued use of the Service after any such update constitutes acceptance of the revised Terms. If you object to any update, your sole remedy is to terminate your subscription as provided in Section 17.
            </p>
          </div>

          {/* Section 3 */}
          <div>
            <h2>3. DESCRIPTION OF THE SERVICE</h2>
            <p className="mb-3">
              MatBoss is an enrollment automation platform designed to increase paid enrollments for martial arts schools by automating the trial-to-enrollment conversion pipeline. The Service operates as an overlay system that integrates with your existing booking and member management software. Specifically, the Service provides:
            </p>
            <ul className="list-[lower-alpha] list-inside space-y-2 mb-3 pl-2">
              <li>Automated trial booking confirmation and reminder sequences delivered via SMS, email, and messaging integrations;</li>
              <li>No-show recovery workflows that automatically re-engage prospective students who fail to attend a scheduled trial class;</li>
              <li>Post-trial enrollment follow-up sequences designed to convert trial attendees into paying members;</li>
              <li>Analytics and reporting dashboards tracking trial-to-show rates, show-to-enrollment rates, no-show recovery rates, and estimated revenue impact;</li>
              <li>Integration layers connecting to Customer's existing Third-Party Booking Software.</li>
            </ul>
            <p>
              The Service does not replace Customer's existing booking software. Rather, it sits atop Customer's existing systems to enhance conversion at each stage of the enrollment funnel. The Company does not guarantee any specific enrollment outcomes, as results depend on factors outside the Company's control, including but not limited to the quality of Customer's trial classes, pricing structure, and local market conditions.
            </p>
          </div>

          {/* Section 4 */}
          <div>
            <h2>4. ELIGIBILITY AND ACCOUNT REGISTRATION</h2>
            <p className="mb-3">
              The Service is available exclusively to martial arts schools, academies, gyms, and dojos that: (a) maintain a physical training facility within the San Diego, California metropolitan area; (b) offer trial classes or introductory sessions to prospective students; and (c) are operated by individuals or entities that are at least 18 years of age or the age of majority in their jurisdiction.
            </p>
            <p className="mb-3">
              To register for the Service, you must provide accurate, current, and complete information as prompted by the registration form, including your school name, physical address, primary contact information, and details regarding your current booking and enrollment processes. You agree to maintain and promptly update this information to keep it accurate.
            </p>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify the Company immediately of any unauthorized use of your account or any other breach of security.
            </p>
          </div>

          {/* Section 5 */}
          <div>
            <h2>5. SUBSCRIPTION PLANS AND FEES</h2>
            <p className="mb-3">
              The Service is offered under one or more subscription plans as described on our website or as otherwise agreed in a written Order Form. Subscription fees are based on the features, automation workflows, and support level selected by Customer.
            </p>
            <p className="mb-3">
              All fees are quoted in United States dollars and are exclusive of applicable taxes. Customer is responsible for all federal, state, and local taxes, duties, or levies arising from the subscription, excluding taxes based on the Company's net income.
            </p>
            <p>
              The Company reserves the right to modify subscription fees upon thirty (30) days' prior written notice before the start of any renewal period. If Customer does not agree to a fee increase, Customer may terminate the subscription effective at the end of the then-current Service Period by providing written notice before the renewal date.
            </p>
          </div>

          {/* Section 6 */}
          <div>
            <h2>6. PAYMENT TERMS AND BILLING</h2>
            <p className="mb-3">
              Subscription fees are billed in advance on a monthly or annual basis, as selected by Customer at the time of subscription. Payment is due upon invoice. The Company accepts payment by credit card, ACH transfer, or such other methods as may be made available from time to time.
            </p>
            <p className="mb-3">
              If any payment is not received within ten (10) days of the due date, the Company may: (a) charge a late fee of 1.5% per month (or the maximum amount permitted by law, whichever is less) on the outstanding balance; (b) suspend Customer's access to the Service until payment is received in full; or (c) terminate the subscription in accordance with Section 17.
            </p>
            <p>
              All fees paid are non-refundable except as expressly provided in these Terms or as required by applicable law. Customer agrees that the Company shall not be required to provide refunds or credits for any partial subscription period or for periods during which Customer did not use the Service.
            </p>
          </div>

          {/* Section 7 */}
          <div>
            <h2>7. FREE TRIAL AND PILOT PERIOD</h2>
            <p className="mb-3">
              The Company may, at its sole discretion, offer a free trial or pilot period for the Service. During the trial period, Customer may access the Service with limited or full functionality as determined by the Company.
            </p>
            <p className="mb-3">
              At the end of the free trial period, Customer's access to the Service will terminate automatically unless Customer subscribes to a paid plan. Any Customer Data entered during the trial period may be retained for a period of thirty (30) days following trial expiration, after which it may be permanently deleted.
            </p>
            <p>
              Free trials are limited to one per martial arts school and may not be extended, transferred, or combined with other promotional offers. The Company reserves the right to modify or discontinue the free trial offer at any time without prior notice.
            </p>
          </div>

          {/* Section 8 */}
          <div>
            <h2>8. PERMITTED USE AND RESTRICTIONS</h2>
            <p className="mb-3">
              Subject to these Terms, the Company grants Customer a limited, non-exclusive, non-transferable, revocable right to access and use the Service solely for Customer's internal business operations related to enrollment management at Customer's martial arts school(s) within the San Diego metropolitan area.
            </p>
            <p>
              Customer shall not, and shall not permit any third party to: (a) sublicense, sell, resell, lease, or otherwise make the Service available to any third party; (b) modify, adapt, translate, reverse engineer, decompile, or disassemble any portion of the Service; (c) use the Service to build a competing product or service; (d) use the Service to transmit unsolicited or unauthorized advertising, spam, or any form of duplicative or unsolicited messages in violation of applicable laws; (e) use the Service to store or transmit material that infringes upon the intellectual property rights of any third party; (f) attempt to gain unauthorized access to the Service, its servers, or any related systems or networks; (g) use the Service for any unlawful purpose or in violation of any applicable federal, state, or local law, rule, or regulation; or (h) use any automated means, including bots, scrapers, or spiders, to access the Service for any purpose without the Company's express written permission.
            </p>
          </div>

          {/* Section 9 */}
          <div>
            <h2>9. CUSTOMER DATA AND DATA OWNERSHIP</h2>
            <p className="mb-3">
              As between the parties, Customer retains all right, title, and interest in and to Customer Data. Customer grants the Company a limited, non-exclusive license to access, use, process, and display Customer Data solely to the extent necessary to provide and improve the Service.
            </p>
            <p className="mb-3">
              The Company shall not sell, share, or otherwise disclose Customer Data to third parties except: (a) as necessary to provide the Service (including transmitting data to Third-Party Booking Software integrations configured by Customer); (b) in anonymized or aggregated form that does not identify any individual or Customer; (c) as required by law, regulation, subpoena, or court order; or (d) with Customer's prior written consent.
            </p>
            <p className="mb-3">
              Customer represents and warrants that it has obtained all necessary consents, permissions, and authorizations required under applicable law to collect, store, and process the personal data of its students, prospective students, and their parents or guardians, and to provide such data to the Company for processing through the Service.
            </p>
            <p>
              Customer is solely responsible for the accuracy, quality, integrity, and legality of Customer Data and the means by which Customer acquired Customer Data.
            </p>
          </div>

          {/* Section 10 */}
          <div>
            <h2>10. PRIVACY AND DATA PROTECTION</h2>
            <p className="mb-3">
              The Company's collection, use, and disclosure of personal information in connection with the Service is governed by our Privacy Policy, available at www.matboss.online/privacy. The Company processes personal data as a data processor on behalf of the Customer (the data controller) in accordance with the California Consumer Privacy Act (CCPA), as amended by the California Privacy Rights Act (CPRA), and other applicable data protection laws.
            </p>
            <p className="mb-3">
              The Company maintains commercially reasonable administrative, technical, and physical safeguards designed to protect Customer Data against unauthorized access, disclosure, alteration, or destruction. These safeguards include encryption of data in transit and at rest, role-based access controls, regular security audits, and employee training on data handling practices.
            </p>
            <p>
              In the event of a security breach affecting Customer Data, the Company will notify Customer without unreasonable delay and in accordance with applicable law, and will cooperate with Customer in investigating and remediating the breach.
            </p>
          </div>

          {/* Section 11 */}
          <div>
            <h2>11. INTELLECTUAL PROPERTY RIGHTS</h2>
            <p className="mb-3">
              The Service, including all software, code, algorithms, automation workflows, user interfaces, designs, documentation, trademarks, trade names, and other intellectual property embodied in or associated with the Service, is and shall remain the exclusive property of the Company and its licensors. Nothing in these Terms grants Customer any right, title, or interest in the Service except for the limited use rights expressly granted herein.
            </p>
            <p className="mb-3">
              Customer acknowledges that MatBoss's automation workflows, sequencing logic, conversion optimization algorithms, and associated methodologies constitute proprietary trade secrets of the Company. Customer shall not disclose, reproduce, or use such trade secrets except as expressly authorized by these Terms.
            </p>
            <p>
              Customer may provide feedback, suggestions, or recommendations regarding the Service ("Feedback"). Customer hereby grants the Company a perpetual, irrevocable, worldwide, royalty-free license to use, modify, and incorporate such Feedback into the Service without restriction or obligation to Customer.
            </p>
          </div>

          {/* Section 12 */}
          <div>
            <h2>12. THIRD-PARTY INTEGRATIONS</h2>
            <p className="mb-3">
              The Service may integrate with Third-Party Booking Software and other third-party platforms to facilitate data exchange and workflow automation. Customer acknowledges and agrees that:
            </p>
            <ul className="list-[lower-alpha] list-inside space-y-2 pl-2">
              <li>The Company does not own, control, or operate any Third-Party Booking Software, and the availability, functionality, and performance of such integrations are subject to the third party's terms, policies, and operational status;</li>
              <li>The Company shall not be liable for any loss, damage, or disruption caused by changes to, outages of, or discontinuation of any Third-Party Booking Software;</li>
              <li>Customer is responsible for maintaining active subscriptions and API access to any Third-Party Booking Software required for integration with the Service;</li>
              <li>Customer's use of Third-Party Booking Software is governed by the applicable third party's terms of service, and the Company makes no representations or warranties regarding such software.</li>
            </ul>
          </div>

          {/* Section 13 */}
          <div>
            <h2>13. SERVICE LEVEL COMMITMENT</h2>
            <p className="mb-3">
              The Company shall use commercially reasonable efforts to maintain Service availability of 99.5% uptime on a monthly basis, measured exclusive of scheduled maintenance windows and force majeure events. Scheduled maintenance will be conducted during off-peak hours (between 12:00 AM and 5:00 AM Pacific Time) whenever practicable, and the Company will provide at least 24 hours' advance notice for planned maintenance.
            </p>
            <p className="mb-3">
              In the event that the Service fails to meet the 99.5% uptime commitment in any calendar month, Customer's sole and exclusive remedy shall be a service credit equal to 5% of the monthly subscription fee for each full 1% of downtime below the commitment, up to a maximum credit of 30% of the monthly fee. Service credits must be requested in writing within fifteen (15) days of the end of the affected month and will be applied to Customer's next billing cycle.
            </p>
            <p>
              The uptime commitment does not apply to: (a) outages caused by Customer's equipment, software, or network connections; (b) outages caused by Third-Party Booking Software failures; (c) force majeure events as defined in Section 22; or (d) Customer's misuse of the Service in violation of these Terms.
            </p>
          </div>

          {/* Section 14 */}
          <div>
            <h2>14. WARRANTIES AND DISCLAIMERS</h2>
            <p className="mb-3">
              The Company warrants that: (a) the Service will perform materially in accordance with the applicable documentation during the Service Period; (b) the Company will provide the Service in a professional and workmanlike manner consistent with generally accepted industry standards; and (c) to the Company's knowledge, the Service does not infringe any third party's intellectual property rights.
            </p>
            <p className="mb-3 uppercase font-semibold text-gray-400">
              EXCEPT AS EXPRESSLY SET FORTH IN THIS SECTION, THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE." THE COMPANY HEREBY DISCLAIMS ALL OTHER WARRANTIES, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. THE COMPANY DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE, OR THAT ALL ERRORS WILL BE CORRECTED.
            </p>
            <p className="uppercase font-semibold text-gray-400">
              THE COMPANY SPECIFICALLY DISCLAIMS ANY WARRANTY OR REPRESENTATION THAT USE OF THE SERVICE WILL RESULT IN ANY SPECIFIC NUMBER OF ENROLLMENTS, REVENUE INCREASE, OR BUSINESS OUTCOME. WHILE THE SERVICE IS DESIGNED TO IMPROVE TRIAL-TO-ENROLLMENT CONVERSION, ACTUAL RESULTS DEPEND ON NUMEROUS FACTORS OUTSIDE THE COMPANY'S CONTROL.
            </p>
          </div>

          {/* Section 15 */}
          <div>
            <h2>15. LIMITATION OF LIABILITY</h2>
            <p className="mb-3 uppercase font-semibold text-gray-400">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL THE COMPANY, ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOSS OF PROFITS, REVENUE, GOODWILL, DATA, OR USE, ARISING OUT OF OR IN CONNECTION WITH THESE TERMS OR THE SERVICE, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY, OR ANY OTHER LEGAL THEORY, EVEN IF THE COMPANY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
            <p className="mb-3 uppercase font-semibold text-gray-400">
              THE COMPANY'S TOTAL AGGREGATE LIABILITY UNDER THESE TERMS SHALL NOT EXCEED THE TOTAL FEES ACTUALLY PAID BY CUSTOMER TO THE COMPANY DURING THE TWELVE (12) MONTH PERIOD IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM.
            </p>
            <p>
              The limitations in this Section shall apply regardless of the failure of essential purpose of any limited remedy. Some jurisdictions do not allow the exclusion or limitation of certain damages, so the above limitations may not apply to you to the extent prohibited by applicable law.
            </p>
          </div>

          {/* Section 16 */}
          <div>
            <h2>16. INDEMNIFICATION</h2>
            <p className="mb-3">
              Customer agrees to indemnify, defend, and hold harmless the Company, its affiliates, and their respective officers, directors, employees, and agents from and against any and all claims, demands, losses, damages, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of or related to: (a) Customer's use of the Service in violation of these Terms; (b) Customer's breach of any representation or warranty in these Terms; (c) Customer's violation of applicable law, including data protection and anti-spam laws; (d) any claim by a third party arising from Customer Data or Customer's collection, use, or disclosure of personal data through the Service; or (e) any dispute between Customer and its students, prospective students, or their parents or guardians.
            </p>
            <p>
              The Company agrees to indemnify, defend, and hold harmless Customer from and against any third-party claim that the Service, as provided by the Company, infringes such third party's intellectual property rights, provided that: (a) Customer promptly notifies the Company in writing of such claim; (b) Customer grants the Company sole control of the defense and settlement of such claim; and (c) Customer provides reasonable cooperation at the Company's expense.
            </p>
          </div>

          {/* Section 17 */}
          <div>
            <h2>17. TERM, RENEWAL, AND TERMINATION</h2>
            <p className="mb-3">
              These Terms are effective as of the date Customer first accesses or uses the Service (the "Effective Date") and shall continue for the initial Service Period specified in the applicable subscription or Order Form.
            </p>
            <p className="mb-3">
              Unless either party provides written notice of non-renewal at least thirty (30) days prior to the expiration of the then-current Service Period, the subscription shall automatically renew for successive periods of equal duration at the then-current subscription rate.
            </p>
            <p className="mb-3">
              Either party may terminate these Terms: (a) for convenience, upon thirty (30) days' prior written notice, effective at the end of the then-current Service Period; (b) for cause, if the other party materially breaches these Terms and fails to cure such breach within fifteen (15) days of receiving written notice thereof; or (c) immediately, if the other party becomes insolvent, files for bankruptcy, or ceases to operate in the ordinary course of business.
            </p>
            <p>
              The Company may suspend Customer's access to the Service immediately and without prior notice if the Company reasonably determines that Customer's use of the Service poses a security risk, may adversely affect the Service or other customers, or violates applicable law.
            </p>
          </div>

          {/* Section 18 */}
          <div>
            <h2>18. EFFECT OF TERMINATION</h2>
            <p className="mb-3">
              Upon termination or expiration of these Terms: (a) Customer's right to access and use the Service shall immediately cease; (b) the Company shall, upon Customer's written request made within thirty (30) days of termination, make Customer Data available for export in a standard machine-readable format; and (c) after the thirty (30) day post-termination period, the Company may permanently delete all Customer Data in its possession or control.
            </p>
            <p>
              Termination shall not release either party from any obligation that accrued prior to the effective date of termination, including any obligation to pay fees incurred before termination. The following Sections shall survive termination or expiration of these Terms: Sections 1, 9, 10, 11, 14, 15, 16, 18, 20, 21, and 22.
            </p>
          </div>

          {/* Section 19 */}
          <div>
            <h2>19. MODIFICATIONS TO TERMS AND SERVICE</h2>
            <p className="mb-3">
              The Company reserves the right to modify these Terms at any time. Material changes will be communicated to Customer via email or through a prominent notice within the Service at least thirty (30) days before the changes take effect. Non-material changes (such as corrections of typographical errors or minor clarifications) may be made without prior notice.
            </p>
            <p>
              The Company may update, modify, or discontinue features or functionality of the Service at any time. If the Company discontinues a material feature that Customer relies upon, Customer may terminate the subscription without penalty by providing written notice within thirty (30) days of the change taking effect.
            </p>
          </div>

          {/* Section 20 */}
          <div>
            <h2>20. CONFIDENTIALITY</h2>
            <p className="mb-3">
              Each party (the "Receiving Party") agrees to keep confidential all non-public information disclosed by the other party (the "Disclosing Party") that is designated as confidential or that the Receiving Party should reasonably understand to be confidential given the nature of the information and the circumstances of disclosure ("Confidential Information").
            </p>
            <p className="mb-3">
              Confidential Information shall not include information that: (a) is or becomes publicly available through no fault of the Receiving Party; (b) was known to the Receiving Party prior to disclosure; (c) is independently developed by the Receiving Party without reference to the Disclosing Party's Confidential Information; or (d) is rightfully received from a third party without restriction on disclosure.
            </p>
            <p>
              The Receiving Party shall: (a) use Confidential Information solely for the purposes of these Terms; (b) restrict disclosure to those employees, contractors, and agents who need to know such information and who are bound by confidentiality obligations at least as protective as those herein; and (c) protect Confidential Information using the same degree of care it uses to protect its own confidential information, but in no event less than reasonable care.
            </p>
          </div>

          {/* Section 21 */}
          <div>
            <h2>21. DISPUTE RESOLUTION AND ARBITRATION</h2>
            <p className="mb-3">
              Any dispute, controversy, or claim arising out of or relating to these Terms, including the breach, termination, or validity thereof, shall first be subject to good-faith negotiation between the parties for a period of thirty (30) days following written notice of the dispute.
            </p>
            <p className="mb-3">
              If the dispute is not resolved through negotiation, it shall be resolved by binding arbitration administered by the American Arbitration Association ("AAA") under its Commercial Arbitration Rules then in effect. The arbitration shall be conducted by a single arbitrator in San Diego, California. The arbitrator's decision shall be final and binding, and judgment on the award rendered may be entered in any court of competent jurisdiction.
            </p>
            <p className="mb-3">
              Each party shall bear its own costs of arbitration, and the parties shall share equally the fees and expenses of the arbitrator and the AAA. Notwithstanding the foregoing, either party may seek injunctive or other equitable relief in any court of competent jurisdiction to prevent the actual or threatened infringement, misappropriation, or violation of intellectual property rights or Confidential Information.
            </p>
            <p className="uppercase font-semibold text-gray-400">
              EACH PARTY HEREBY WAIVES ANY RIGHT TO A JURY TRIAL IN CONNECTION WITH ANY DISPUTE ARISING UNDER THESE TERMS. EACH PARTY FURTHER AGREES THAT ANY ARBITRATION SHALL BE CONDUCTED IN ITS INDIVIDUAL CAPACITY ONLY AND NOT AS A CLASS ACTION OR OTHER REPRESENTATIVE PROCEEDING.
            </p>
          </div>

          {/* Section 22 */}
          <div>
            <h2>22. GENERAL PROVISIONS</h2>
            <p className="mb-3">
              <strong className="text-white">Governing Law.</strong> These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of laws principles.
            </p>
            <p className="mb-3">
              <strong className="text-white">Force Majeure.</strong> Neither party shall be liable for any delay or failure to perform its obligations under these Terms (other than payment obligations) if such delay or failure results from circumstances beyond the party's reasonable control, including but not limited to acts of God, natural disasters, pandemics, government actions, labor disputes, utility failures, cyberattacks, or disruptions to internet infrastructure.
            </p>
            <p className="mb-3">
              <strong className="text-white">Assignment.</strong> Customer may not assign or transfer these Terms or any rights hereunder without the Company's prior written consent. The Company may assign these Terms in connection with a merger, acquisition, reorganization, or sale of all or substantially all of its assets.
            </p>
            <p className="mb-3">
              <strong className="text-white">Entire Agreement.</strong> These Terms, together with any Order Form, the Privacy Policy, and any other policies or agreements referenced herein, constitute the entire agreement between the parties concerning the subject matter hereof and supersede all prior and contemporaneous agreements, understandings, negotiations, and discussions, whether written or oral.
            </p>
            <p className="mb-3">
              <strong className="text-white">Severability.</strong> If any provision of these Terms is held to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable while preserving the parties' original intent.
            </p>
            <p className="mb-3">
              <strong className="text-white">Waiver.</strong> The failure of either party to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision. A waiver of any right or provision shall be effective only if made in writing and signed by the waiving party.
            </p>
            <p className="mb-3">
              <strong className="text-white">Notices.</strong> All notices required or permitted under these Terms shall be in writing and shall be deemed given when: (a) delivered personally; (b) sent by confirmed email; or (c) sent by nationally recognized overnight courier, in each case to the addresses provided at registration or as subsequently updated.
            </p>
            <p className="mb-3">
              <strong className="text-white">Independent Contractors.</strong> The relationship between the parties is that of independent contractors. Nothing in these Terms shall be construed to create a partnership, joint venture, employment, or agency relationship.
            </p>
            <p>
              <strong className="text-white">Export Compliance.</strong> Customer shall comply with all applicable export and import control laws and regulations in connection with its use of the Service.
            </p>
          </div>

          {/* Section 23 */}
          <div>
            <h2>23. CONTACT INFORMATION</h2>
            <p className="mb-3">
              For questions about these Terms, the Service, or to submit any notice required hereunder, please contact us at:
            </p>
            <div className="p-4 rounded-lg bg-dojo-carbon/50 border border-white/5 text-gray-400 space-y-1">
              <p className="text-white font-semibold">Ammar Alkheder</p>
              <p>d/b/a MatBoss</p>
              <p>San Diego, California</p>
              <p>Email: <a href="mailto:legal@matboss.online" className="text-dojo-red hover:underline">legal@matboss.online</a></p>
              <p>Web: <a href="https://www.matboss.online" className="text-dojo-red hover:underline">www.matboss.online</a></p>
            </div>
          </div>

          {/* End */}
          <div className="pt-8 border-t border-white/10 text-center text-xs text-gray-600">
            <p>END OF TERMS OF SERVICE</p>
            <p className="mt-2">&copy; 2026 Ammar Alkheder. All rights reserved.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
