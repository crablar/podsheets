import { autobind } from "core-decorators";
import { inject, observer } from "mobx-react";
import * as React from "react";
import { Container, Grid, Header, Image } from "semantic-ui-react";
import { colors, globalStyles } from "../../../lib/styles";
import { RootState } from "../../../state/RootState";
import Footer from "../generic/Footer";

@inject("rootState")
@observer
export default class TermsOfUseScreen extends React.Component {

    render() {

        const wide = this.props.wide;

        return (
            <div>
                <Grid doubling centered style={style.content}>
                    <Grid.Row columns={1}>
                        <Grid.Column mobile={16} width={wide ? 16 : 12} textAlign="center">
                            <Header style={style.mainTitle} as="h1">
                                Podsheets Terms of Use
                        </Header>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row columns={1}>
                        <Grid.Column mobile={14} width={wide ? 16 : 8} computer={wide ? 16 : 6} textAlign="left">
                            <p>
                              Date of Last Revision: July 9, 2017 <br/>
                            Podsheets is a website for publishing a podcast.<br/>
                            Podsheets’s products and services are provided by Podsheets
                               Inc. (“Podsheets”, “us”, “we” or “our”). Please carefully read these Terms of Service,
                                our Privacy Policy and our DMCA Copyright Policy
                                 (collectively, the “Terms of Service”). The Terms of Service govern your access
                                  to and use of Podsheets’s services, including Podsheets’s
                                   websites, SMS, APIs, email notifications,
                                    applications, buttons, widgets, ads and other services
                                     (collectively, the “Services”).
                          </p>
                          <Header style={style.teamText} as="h2">
                                1. Online Purchases
                        </Header>
                        <p>
                            By agreeing to these Terms of Service, you represent that you are at least
                             the age of majority in your state or province of residence,
                              or that you are the age of majority in your state or province of residence
                               and you have given us your consent to allow any of your minor
                                dependents to use this site.
                        </p>
                        <p>
                            You may not use our products for any illegal or unauthorized purpose nor
                             may you, in the use of the Service, violate any laws in your jurisdiction
                              (including but not limited to copyright laws).
                        </p>
                        <p>
                            You must not transmit any worms or viruses or any code of a destructive nature.

                            A breach or violation of any of the Terms will result in an immediate
                             termination of your Services.
                        </p>
                       <p>
                           We reserve the right to refuse service to anyone for any reason at any time.
                       </p>
                       <p>
                           You understand that your content (not including credit card information), may be
                            transferred unencrypted and involve (a) transmissions over various networks;
                             and (b) changes to conform and adapt to technical requirements of connecting
                              networks or devices. Credit card information is always encrypted
                               during transfer over networks.
                       </p>
                       <p>
                           You agree not to reproduce, duplicate, copy, sell, resell or exploit
                            any portion of the Service, use of the Service, or access to the Service
                             or any contact on the website through which the service is provided,
                              without express written permission by us.
                       </p>
                       <p>
                           The headings used in this agreement are included for convenience only and will
                            not limit or otherwise affect these Terms.
                       </p>
                       <p>
                           We are not responsible if information made available on this site is not
                            accurate, complete or current. The material on this site is provided for
                             general information only and should not be relied upon or used as the
                              sole basis for making decisions without consulting primary, more accurate,
                               more complete or more timely sources of information. Any reliance on
                                the material on this site is at your own risk.
                       </p>
                       <p>
                           This site may contain certain historical information. Historical information,
                            necessarily, is not current and is provided for your reference only.
                             We reserve the right to modify the contents of this site at any time,
                              but we have no obligation to update any information on our site.
                               You agree that it is your responsibility to monitor changes to our site.
                       </p>
                       <p>
                           Prices for our products are subject to change without notice.
                       </p>
                       <p>
                           We reserve the right at any time to modify or discontinue the Service (or any part
                            or content thereof) without notice at any time.
                       </p>
                       <p>
                           We shall not be liable to you or to any third-party for any modification, price change,
                            suspension or discontinuance of the Service.
                       </p>
                       <p>
                           Certain products or services may be available exclusively online through the website.
                            These products or services may have limited quantities and are subject to
                             return or exchange only according to our Return Policy.
                       </p>
                       <p>
                           We have made every effort to display as accurately as possible the colors and
                            images of our products that appear at the store. We cannot guarantee that
                             your computer monitor's display of any color will be accurate.
                       </p>
                        <p>
                            We reserve the right, but are not obligated, to limit the sales of
                             our products or Services to any person, geographic region or jurisdiction.
                              We may exercise this right on a case-by-case basis. We
                               reserve the right to limit the quantities of any products
                                or services that we offer. All descriptions of products
                                 or product pricing are subject to change at anytime without notice,
                                  at the sole discretion of us. We reserve the right to
                                   discontinue any product at any time. Any offer for any product or
                                    service made on this site is void where prohibited.
                       </p>
                       <p>
                           We do not warrant that the quality of any products, services, information,
                            or other material purchased or obtained by you will meet your expectations,
                             or that any errors in the Service will be corrected.
                       </p>
                       <Header style={style.teamText} as="h2">
                                2. Acceptance of Terms of Service
                        </Header>
                       <p>
                           By accessing or using the Services in any manner, you agree to abide by these
                            Terms of Service and all other operating rules, policies and procedures
                             that may be published from time to time to the Services by us, each
                              of which is incorporated by reference and each of which may be updated
                               from time to time without notice to you.
                                *Certain of the Services may be subject to additional terms and conditions specified
                                 by us from time to time to the Services ; your use of such Services
                                  is subject to those additional terms and conditions, which are incorporated
                                   into these Terms of Service by this reference.
                       </p>
                       <p>
                           We reserve the right, in our sole discretion, to modify or
                            replace any of these Terms of Service, or change, suspend, or discontinue the Services
                            (including without limitation, the availability of any feature, database, or content) at any
                             time by posting a notice through the Services, via e-mail or by another appropriate
                              means of electronic communication. We may also impose limits on certain features and
                               services or restrict your access to parts or all of Services without notice or
                                liability. While we will timely provide notice of modifications, it is
                                 also your responsibility to check these Terms of Service periodically for changes.
                                  Your continued use of the Services following notification of any changes
                                   to these Terms of Service constitutes acceptance of those changes, which will
                                    apply to your continued use of the Services going forward. Your use of the Services
                                     is subject to the Terms of Service in effect at the time of such use.
                       </p>
                       <p>
                           We also reserve the right to modify or discontinue, temporarily or permanently,
                            the Services (or any part thereof) with or without notice. You agree that we will
                             not be liable to you or to any third party for any modification, suspension or
                              discontinuance of Services.
                               *ARBITRATION NOTICE AND CLASS ACTION WAIVER: EXCEPT FOR CERTAIN TYPES OF DISPUTES
                                DESCRIBED IN THE ARBITRATION SECTION BELOW, YOU AGREE THAT DISPUTES BETWEEN YOU
                                 AND US WILL BE RESOLVED BY BINDING, INDIVIDUAL ARBITRATION AND YOU WAIVE
                                  YOUR RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT OR CLASS-WIDE ARBITRATION.
                       </p>
                          <Header style={style.teamText} as="h2">
                            3. Eligibility
                        </Header>
                         <p>
                             You represent and warrant that you are at least 13 years of age. If you are under
                              age 13, you may not use the Services. Further, you may not access or use the Services
                               if your access or use of the Services is prohibited or conflicts with any applicable
                                local, state, national or international laws and regulations. You must notify us
                                 immediately of any change in your eligibility to use the Services.  We may, in our
                                  sole discretion, refuse to offer the Services to any person or entity and change
                                   these eligibility criteria at any time.
                       </p>
                       <Header style={style.teamText} as="h2">
                       4. Registration
                       </Header>
                         <p>
                             To use some aspects of the Services, you must register for an account (an "Account"). Registration data and certain other information about you and your Account are governed by our Privacy Policy. You must provide accurate and complete information and keep your Account information updated. You shall not: (i) select or use as a username a name of another person with the intent to impersonate that person, (ii) use as a username a name subject to any rights of a person (including, without limitation, copyrights or trademarks) other than you without appropriate authorization or (iii) use, as a username, a name that is otherwise offensive, vulgar or obscene.  You are solely responsible for the activity that occurs on your Account and for keeping your Account password secure. You may never use another person’s user account or registration information for the Services without permission. You must notify us immediately of any breach of security or unauthorized use of your Account. You should never publish, distribute or post login information for your Account. We will not be liable for any loss or damage arising from your failure to comply with this Section. You shall have the ability to delete your Account, either by following the instructions on the Services or by sending a request to support@Podsheets.
                       </p>
                       <Header style={style.teamText} as="h2">
                       5. Content
                       </Header>
                       <Header style={style.teamText} as="h3">
                      Definition
                       </Header>
                         <p>
                             For purposes of these Terms of Service, the term “Content” includes, any information, audio, text, graphics, photos or other materials uploaded, downloaded or appearing on the Services. For avoidance of doubt, “Content” also includes all User Content (as defined below).
                       </p>
                       <Header style={style.teamText} as="h3">
                      User Content
                       </Header>
                       <p>
                           All Content added, created, uploaded, submitted, distributed, or posted to the Services by users (collectively “User Content”), whether publicly posted or privately transmitted, is the sole responsibility of the person who originated such User Content.  You represent that all User Content provided by you is in compliance with all applicable laws, rules and regulations, including, but not limited to, copyright laws.  You acknowledge that all Content, including User Content, accessed by you using the Services is at your own risk and you will be solely responsible for any damage or loss to you or any other party resulting therefrom. We do not pre-screen content and do not guarantee that any Content you access on or through the Services is or will continue to be accurate.
                       </p>
                       <Header style={style.teamText} as="h3">
                     Notices and Restrictions
                       </Header>
                       <p>
                           The Services may contain Content specifically provided by us, our partners or our users. Such Content is protected by copyrights, trademarks, service marks, patents, trade secrets or other proprietary rights and laws. Except as expressly authorized by us, you agree not to modify, copy, frame, scrape, rent, lease, loan, sell, distribute or create derivative works based on such Content, in whole or in part, except that the foregoing does not apply to your own User Content that you legally upload to the Services. You shall abide by and maintain all copyright notices, information, and restrictions contained in any Content accessed through the Services.
                       </p>
                        <Header style={style.teamText} as="h3">
                        Use License
                       </Header>
                       <p>
                           Subject to these Terms of Service, we grant you a worldwide, non-exclusive, non-sublicensable and non-transferable license to use (i.e., to download and display locally), copy, distribute and display Content solely for purposes of using the Services. You shall not sell, license, rent, or otherwise use or exploit any Content for commercial use or in any way that violates any third party right.
                       </p>
                       <Header style={style.teamText} as="h3">
                        License Grant
                       </Header>
                       <p>By submitting User Content through the Services, you hereby do and shall grant us a worldwide, non-exclusive, perpetual, irrevocable, royalty-free, fully paid, sublicensable and transferable license to use, edit, modify (including the right to create derivative works of), aggregate, reproduce, distribute, prepare derivative works of, display, perform, and otherwise fully exploit the User Content in connection with the operation of the the Services, the promotion, advertising or marketing of the Services, or any other purposes. You agree that this license includes the right for Podsheets to provide, promote, and improve the Services and to make User Content submitted to or through the Services available to other companies, organizations or individuals who partner with Podsheets for the syndication, broadcast, distribution or publication of such User Content on other media and services, subject to our terms and conditions for such User Content use. Such additional uses by Podsheets, or other companies, organizations or individuals who partner with Podsheets, may be made with no compensation paid to you with respect to the User Content that you submit, post, transmit or otherwise make available through the Services. Such license shall survive the termination of your Account or the Services. For the avoidance of doubt, such license includes any and all rights in or to the User Content, including, without limitation, copyright, rights of privacy or rights of publicity.   You also hereby do and shall grant each user of the Services a non-exclusive, perpetual license to access your User Content through the Services, and to use, edit, modify (including the right to create derivative works of), reproduce, distribute, prepare derivative works of, display and perform such User Content in connection with any use of the Services by any user of the Services. Such license shall survive the termination of your Account or the Services.  You acknowledge and agree that any questions, comments, suggestions, ideas, feedback or other information about the Services (“Submissions”), provided by you to us are non-confidential and we will be entitled to the unrestricted use and dissemination of these Submissions for any purpose, commercial or otherwise, without acknowledgment or compensation to you.
For clarity, the foregoing license grants to us and our users does not affect your other ownership or license rights in your User Content, including the right to grant additional licenses to your User Content, unless otherwise agreed in writing. You represent and warrant that you have all rights to grant such licenses to us without infringement or violation of any third party rights, including without limitation, any privacy rights, publicity rights, copyrights, trademarks, contract rights, or any other intellectual property or proprietary rights.
                       </p>
                       <Header style={style.teamText} as="h3">
                        Availability of Content
                       </Header>
                        <p>
                            We do not guarantee that any Content will be made available through the Services. You acknowledge that we may establish general practices and limits concerning use of the Services, including without limitation the maximum period of time that Content will be retained by the Services and the maximum storage space that will be allotted on our servers on your behalf. You agree that we have no responsibility or liability for the deletion or failure to store any Content maintained or uploaded by the Services. We reserve the right to, but do not have any obligation to, (i) remove, edit or modify any Content in our sole discretion, at any time, without notice to you and for any reason (including, but not limited to, upon receipt of claims or allegations from third parties or authorities relating to such Content or if we are concerned that you may have violated these Terms of Service), or for no reason at all and (ii) to remove or block any Content from the Services.
                       </p>
                       <Header style={style.teamText} as="h3">
                        Rules of Conduct
                       </Header>
                        <p>
                            As a condition of use, you promise not to use the Services for any purpose that is prohibited by these Terms of Service. You are responsible for all of your activity in connection with the Services.
                       </p>
                       <p>
                           You shall use the Services only for your personal use, and not for any commercial use or for the benefit of any third party.
                       </p>
                       <p>
                           You shall comply with all laws, rules and regulations (for example, federal, state and local) applicable to your use of the Services and your User Content, including but not limited to, copyright laws, and shall not further or promote any criminal activity or enterprise or provide instructional information about illegal activities.  You shall not (and shall not permit any third party to) either (a) take any action or (b) upload, post, submit or otherwise distribute or facilitate distribution of any Content through the Services, including without limitation any User Content, that:
                       </p>
                       <p>
                           infringes any patent, trademark, trade secret, copyright, right of publicity or other right of any other person or entity or violates any law or contractual duty (see our DMCA Copyright Policy);
you know is false, misleading, untruthful or inaccurate;
is unlawful, threatening, abusive, harassing, defamatory, libelous, slanderous, deceptive, fraudulent, invasive of another's privacy, tortious, obscene, vulgar, pornographic, offensive, profane, contains or depicts nudity, contains or depicts sexual activity, or is otherwise inappropriate as determined by us in our sole discretion;
constitutes unauthorized or unsolicited advertising, junk or bulk e-mail (“spamming”);
contains software viruses or any other computer codes, files, or programs that are designed or intended to disrupt, damage, limit or interfere with the proper function of any software, hardware, or telecommunications equipment or to damage or obtain unauthorized access to any system, data, password or other information of ours or of any third party;
impersonates any person or entity, including any of our employees or representatives;
includes anyone’s identification documents or sensitive financial information;
poses or creates a privacy or security risk to any person; or
in our sole judgment, is objectionable or which restricts or inhibits any other person from using or enjoying the Services, or which may expose us or our users to any harm or liability of any type.

                           </p>
                       <p>
                           You shall not: (i) take any action that imposes or may impose (as determined by us in our sole discretion) an unreasonable or disproportionately large load on our (or our third party providers’) infrastructure; (ii) interfere or attempt to interfere with the proper working of the Services or any activities conducted on the Services; (iii) bypass, circumvent or attempt to bypass or circumvent any measures we may use to prevent or restrict access to the Services (or other accounts, computer systems or networks connected to the Services); (iv) run any form of auto-responder or “spam” on the Services; (v) use manual or automated software, devices, or other processes to “crawl” or “spider” any page of Podsheets’s websites; (vi) harvest or scrape any Content or contact information from the Services; (vii) solicit personal information from anyone under the age of 18; or (viii) otherwise take any action in violation of our guidelines and policies.
                       </p>
                       <p>
                           You shall not (directly or indirectly): (i) decipher, decompile, disassemble, reverse engineer or otherwise attempt to derive any source code or underlying ideas or algorithms of any part of the Services (including without limitation any application), except to the limited extent applicable laws specifically prohibit such restriction, (ii) modify, translate, or otherwise create derivative works of any part of the Services, (iii) engage in or use any data mining, robots, scraping, or similar data gathering or extraction methods, or (iv) copy, rent, lease, distribute, or otherwise transfer any of the rights that you receive hereunder.
                       </p>
                       <p>
                           We reserve the right to take appropriate legal action against anyone who, in our sole discretion, violate this Section, including without limitation, removing the offending content from the Services, suspending or terminating the account of such violators and reporting you to the law enforcement authorities.
                       </p>
                       <p>
                           We also reserve the right to access, read, preserve, and disclose any information as we reasonably believe is necessary to (i) satisfy any applicable law, regulation, legal process or governmental request, (ii) enforce these Terms of Service, including investigation of potential violations hereof, (iii) detect, prevent, or otherwise address fraud, security or technical issues, (iv) respond to user support requests, or (v) protect the rights, property or safety of us, our users and the public.
                       </p>
                       <Header style={style.teamText} as="h2">
                        6. Trademarks
                       </Header>
                       <p>
The Podsheets name and logos are trademarks and service or brand identifier’s marks of Podsheets (collectively the “Podsheets Trademarks”). Other company, product, and service names and logos used and displayed via the Services may be trademarks or service marks of their respective owners who may or may not endorse or be affiliated with or connected to us. Nothing in this Terms of Service or the Services should be construed as granting, by implication, estoppel, or otherwise, any license or right to use any of Podsheets Trademarks displayed on the Services, without our prior written permission in each instance. All goodwill generated from the use of Podsheets Trademarks will inure to our exclusive benefit.
                       </p>
                       <Header style={style.teamText} as="h2">
                        7. Third Party Services
                       </Header>
                        <p>
                           The Services may permit you to link to other websites, services or resources on the Internet, and other websites, services or resources may contain links to the Services. When you access third party resources on the Internet, you do so at your own risk. These other resources are not under our control, and you acknowledge that we are not responsible or liable for the content, functions, accuracy, legality, appropriateness or any other aspect of such websites or resources. The inclusion of any such link does not imply our endorsement or any association between us and their operators. You further acknowledge and agree that we shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods or services available on or through any such website or resource.
                       </p>
                       <Header style={style.teamText} as="h2">
                        8. Mobile Services
                       </Header>
                        <p>
                           The Services include certain services that are available via a mobile device, including (i) the ability to upload Content via a mobile device, (ii) the ability to browse the Services from a mobile device and (iii) the ability to access certain features through an application downloaded and installed on a mobile device (collectively, the “Mobile Services”). By using the Mobile Services, you agree that we may communicate with you regarding Company and other entities by SMS, MMS, text message or other electronic means to your mobile device and that certain information about your usage of the Mobile Services may be communicated to us. Podsheets does not charge a fee to use the Services, but any text messages sent and/or received using the Services are subject to standard text messaging rates. Additionally, text messages sent and/or received count towards a monthly quota as any other messages do. You acknowledge that, whether you are sending or receiving text messages using the Services, standard text messaging rates may apply. In the event you change or deactivate your mobile telephone number, you agree to promptly update your Company account information to ensure that your messages are not sent to the person that acquires your old number.
                       </p>
                       <Header style={style.teamText} as="h2">
                        9. Apple Devices and Application Terms
                       </Header>
                        <p>
                           If you are accessing the Services via an Podsheets mobile application (an “Application”) on a device provided by Apple, Inc. ("Apple") or an Application obtained through the Apple App Store, the following shall apply:
                       </p>
                         <p>
                           Both you and Podsheets acknowledge that these Terms of Service are concluded between you and Podsheets only, and not with Apple, and that Apple is not responsible for the Application or the Content;
                       </p>
                         <p>
                           The Application is licensed to you on a limited, non-exclusive, non-transferrable, non-sublicensable basis, solely to be used in connection with the Services for your private, personal, non-commercial use, subject to all the terms and conditions of these Terms of Service as they are applicable to the Services;  You will only use the Application in connection with an Apple device that you own or control;
                       </p>
                       <p>
                           You acknowledge and agree that Apple has no obligation whatsoever to furnish any maintenance and support services with respect to the Application;  Apple is not responsible for any product warranties, whether express or implied by law. In the event of any failure of the Application to conform to any applicable warranty, including those implied by law, you may notify Apple of such failure; upon notification, Apple's sole warranty obligation to you will be to refund to you the purchase price, if any, of the Application; and, to the maximum extent permitted by applicable law, Apple will have no other warranty obligation whatsoever with respect to the Application, or any other claims, losses, liabilities, damages, costs or expenses attributable to any failure to conform to any warranty, which will be our sole responsibility, to the extent it cannot be disclaimed under applicable law;  You acknowledge and agree that Podsheets, and not Apple, is responsible for addressing any claims you or any third party may have in relation to the Application, including, but not limited to: (i) product liability claims; (ii) any claim that the Application fails to conform to any applicable legal or regulatory requirement; and (iii) claims arising under consumer protection or similar legislation;  You acknowledge and agree that, in the event of any third party claim that the Application or your possession and use of the Application infringes that third party's intellectual property rights, Podsheets, and not Apple, will be responsible for the investigation, defense, settlement and discharge of any such infringement claim;  You represent and warrant that you are not located in a country subject to a U.S. Government embargo, or that has been designated by the U.S. Government as a "terrorist supporting" country, and that you are not listed on any U.S. Government list of prohibited or restricted parties;  Both you and Podsheets acknowledge and agree that, in your use of the Application, you will comply with any applicable third party terms of agreement which may affect or be affected by such use; and  Both you and Podsheets acknowledge and agree that Apple and Apple's subsidiaries are third party beneficiaries of these Terms of Service, and that upon your acceptance of these Terms of Service, Apple will have the right (and will be deemed to have accepted the right) to enforce these Terms of Service against you as the third party beneficiary hereof.
                       </p>
                        <Header style={style.teamText} as="h2">
                        10. Social Networking Services
                       </Header>
                       <p>
                           You may enable or log in to the Services via various online third party services, such as social media and social networking services like Facebook or Twitter (“Social Networking Services”). By logging in or directly integrating these Social Networking Services into the Service, we make your online experiences richer and more personalized. To take advantage of this feature and capabilities, we may ask you to authenticate, register for or log into Social Networking Services on the websites of their respective providers. As part of such integration, the Social Networking Services will provide us with access to certain information that you have provided to such Social Networking Services, and we will use, store and disclose such information in accordance with our Privacy Policy. For more information about the implications of activating these Social Networking Services and our use, storage and disclosure of information related to you and your use of such services within Podsheets (including your friend lists and the like), please see our Privacy Policy. However, please remember that the manner in which Social Networking Services use, store and disclose your information is governed solely by the policies of such third parties, and we shall have no liability or responsibility for the privacy practices or other actions of any third party site or service that may be enabled on the Services.
                       </p>
                       <p>
                           In addition, we are not responsible for the accuracy, availability or reliability of any information, content, goods, data, opinions, advice or statements made available in connection with Social Networking Services. As such, we are not liable for any damage or loss caused or alleged to be caused by or in connection with use of or reliance on any such Social Networking Services. We enable these features merely as a convenience and the integration or inclusion of such features does not imply an endorsement or recommendation.
                       </p>
                       <Header style={style.teamText} as="h2">
                        11. Termination
                       </Header>
                       <p>
                           We may terminate your access to all or any part of the Services at any time, with or without cause, with or without notice, which may result in the forfeiture and destruction of all information associated with your membership. You agree that we will not be liable to you or any third party for any termination of your access to the Services.
                       </p>
                        <p>
                           If you wish to terminate your Account, you may do so by following the instructions on the Podsheets website or the Podsheets mobile application.
                       </p>
                        <p>
                           All provisions of these Terms of Service which by their nature should survive termination shall survive termination, including, without limitation, licenses of User Content, ownership provisions, warranty disclaimers, indemnity and limitations of liability.
                       </p>
                         <Header style={style.teamText} as="h2">
                        12. Warranty Disclaimer
                       </Header>
                       <p>
We have no special relationship with or fiduciary duty to you. You acknowledge that we have no duty to take any action regarding: which users gain access to the Services; what Content you access via the Services; or how you may interpret or use the Content.
                       </p>
                         <p>
                         You release us from all liability for you having acquired or not acquired Content through the Services. We make no representations concerning any Content contained in or accessed through the Services, and we will not be responsible or liable for the accuracy, copyright compliance, or legality of material or Content contained in or accessed through the Services.  
                       </p>
                         <p>
                           THE SERVICES AND CONTENT ARE PROVIDED “AS IS”, “AS AVAILABLE” AND WITHOUT WARRANTY OF ANY KIND, EXPRESS, STATUTORY OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE, AND ANY WARRANTIES IMPLIED BY ANY COURSE OF PERFORMANCE OR USAGE OF TRADE, ALL OF WHICH ARE EXPRESSLY DISCLAIMED. WE, AND OUR DIRECTORS, EMPLOYEES, AGENTS, SUPPLIERS, PARTNERS AND CONTENT PROVIDERS DO NOT WARRANT THAT: (I) THE SERVICES WILL BE SECURE OR AVAILABLE AT ANY PARTICULAR TIME OR LOCATION; (II) ANY DEFECTS OR ERRORS WILL BE CORRECTED; (III) ANY CONTENT OR SOFTWARE AVAILABLE THROUGH THE SERVICES IS FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS; OR (IV) THE RESULTS OF USING THE SERVICES WILL MEET YOUR REQUIREMENTS. YOUR USE OF THE SERVICES IS SOLELY AT YOUR OWN RISK.
                       </p>
                       <Header style={style.teamText} as="h2">
                        13. Indemnification
                       </Header>
                         <p>
                           You shall defend, indemnify, and hold harmless us, our affiliates and each of our and their respective employees, contractors, directors, suppliers and representatives from all liabilities, claims, and expenses, including reasonable attorneys’ fees, that arise from or relate to your use or misuse of, or access to, the Services, Content, or otherwise from your User Content, violation of these Terms of Service, or infringement by you, or any third party using your Account or identity in the Services, of any intellectual property or other right of any person or entity. We reserve the right to assume the exclusive defense and control of any matter otherwise subject to indemnification by you, in which event you will assist and cooperate with us in asserting any available defenses.
                       </p>
                       <Header style={style.teamText} as="h2">
                        14. Limitation of Liability
                       </Header>
                        <p>
                          IN NO EVENT SHALL WE, NOR OUR DIRECTORS, EMPLOYEES, AGENTS, PARTNERS, SUPPLIERS OR CONTENT PROVIDERS, BE LIABLE UNDER CONTRACT, TORT, STRICT LIABILITY, NEGLIGENCE OR ANY OTHER LEGAL OR EQUITABLE THEORY WITH RESPECT TO THE SERVICES (I) FOR ANY LOST PROFITS, DATA LOSS, USE OR INABILITY TO USE THE SERVICES, COST OF PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, UNAUTHORIZED ACCESS TO OR ALTERATION OF YOUR TRANSMISSIONS OR DATA, STATEMENTS OR CODUCT OF ANY THIRD PARTY ON THE SERVICES, OR SPECIAL, INDIRECT, INCIDENTAL, PUNITIVE, COMPENSATORY OR CONSEQUENTIAL DAMAGES OF ANY KIND WHATSOEVER (HOWEVER ARISING), EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES, (II) FOR ANY BUGS, VIRUSES, TROJAN HORSES, OR THE LIKE (REGARDLESS OF THE SOURCE OF ORIGINATION), OR (III) FOR ANY DIRECT DAMAGES IN EXCESS OF (IN THE AGGREGATE) OF the greater of (A) fees paid to us for the particular Services during the immediately previous three (3) month period or (B) $500.00. 
                       </p> 
                        <p>
                           SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF CERTAIN WARRANTIES OR THE LIMITATION OR EXCLUSION OF LIABILITY FOR INCIDENTAL OR CONSEQUENTIAL DAMAGES. ACCORDINGLY, SOME OF THE ABOVE LIMITATIONS SET FORTH ABOVE MAY NOT APPLY TO YOU. IF YOU ARE DISSATISFIED WITH ANY PORTION OF THE SERVICES OR WITH THESE TERMS OF SERVICE, YOUR SOLE AND EXCLUSIVE REMEDY IS TO DISCONTINUE USE OF THE SERVICES.
                       </p> 
                       <Header style={style.teamText} as="h2">
                        15. Arbitration
                       </Header>
                        <p>
                           ARBITRATION CLAUSE and CLASS ACTION WAIVER – IMPORTANT – PLEASE REVIEW AS THIS AFFECTS YOUR LEGAL RIGHTS
                       </p>
                        <Header style={style.teamText} as="h3">
                        Arbitration
                       </Header>
                        <p>
                           YOU AGREE THAT ALL DISPUTES BETWEEN YOU AND US (WHETHER OR NOT SUCH DISPUTE INVOLVES A THIRD PARTY) WITH REGARD TO YOUR RELATIONSHIP WITH US, INCLUDING WITHOUT LIMITATION DISPUTES RELATED TO THESE TERMS OF SERVICE, YOUR USE OF THE SERVICES, AND/OR RIGHTS OF PRIVACY AND/OR PUBLICITY, WILL BE RESOLVED BY BINDING ARBITRATION UNDER THE AMERICAN ARBITRATION ASSOCIATION'S RULES FOR ARBITRATION OF CONSUMER-RELATED DISPUTES AND YOU AND WE HEREBY EXPRESSLY WAIVE TRIAL BY JURY and judgment on the award rendered by the arbitrator may be entered in any court having jurisdiction thereof. The arbitration proceedings shall be conducted before one (1) neutral arbitrator selected by the American Arbitration Association. The place of arbitration shall be New York, New York. Either party may apply to the arbitrator seeking injunctive relief until the arbitration award is rendered or the controversy is otherwise resolved. Either party also may, without waiving any remedy under these Terms of service, seek from any court having jurisdiction any interim or provisional relief that is necessary to protect the rights or property of that party, pending the establishment of the ARBITRATOR (or pending the ARBITRATOR’S determination of the merits of the controversy). As an alternative, you may bring your claim in your local “small claims” court, if permitted by that small claims court's rules and if within such court’s jurisdiction, unless such action is transferred, removed or appealed to a different court. You may bring claims only on your own behalf. Neither you nor we will participate in a class action or class-wide arbitration for any claims covered by this agreement to arbitrate. YOU ARE GIVING UP YOUR RIGHT TO PARTICIPATE AS A CLASS REPRESENTATIVE OR CLASS MEMBER ON ANY CLASS CLAIM YOU MAY HAVE AGAINST US INCLUDING ANY RIGHT TO CLASS ARBITRATION OR ANY CONSOLIDATION OF INDIVIDUAL ARBITRATIONS. You also agree not to participate in claims brought in a private attorney general or representative capacity, or consolidated claims involving another person's account, if we are a party to the proceeding. This dispute resolution provision will be governed by the Federal Arbitration Act and not by any state law concerning arbitration. In the event the American Arbitration Association is unwilling or unable to set a hearing date within one hundred and sixty (160) days of filing the case, then either we or you can elect to have the arbitration administered instead by the Judicial Arbitration and Mediation Services. Judgment on the award rendered by the arbitrator may be entered in any court having competent jurisdiction. Any provision of applicable law notwithstanding, the arbitrator will not have authority to award damages, remedies or awards that conflict with these Terms of Service. You agree that regardless of any statute or law to the contrary, any claim or cause of action arising out of, related to or connected with the use of the Services or these Terms of Service must be filed within one (1) year after such claim of action arose or be forever banned.
                       </p>
                        <Header style={style.teamText} as="h3">
                        Severability
                       </Header>
                       <p>
                         If the prohibition against class actions and other claims brought on behalf of third parties contained above is found to be unenforceable, then all of the preceding language in this Arbitration section will be null and void. This arbitration agreement will survive the termination of your relationship with us.  
                       </p>
                       <Header style={style.teamText} as="h2">
                        16. Governing Law and Jurisdiction
                       </Header>
                       <p>
                           These Terms of Service shall be governed by and construed in accordance with the laws of the State of New York, including its conflicts of law rules, and the United States of America. You agree that any dispute arising from or relating to the subject matter of these Terms of Service or otherwise not subject to arbitration shall be governed by the exclusive jurisdiction and venue of the state and Federal courts of New York County, New York.
                       </p>
                       <Header style={style.teamText} as="h2">
                        17. Miscellaneous
                       </Header>
                       <Header style={style.teamText} as="h3">
                        Entire Agreement and Severability
                       </Header>
                        <p>
                           These Terms of Service are the entire agreement between you and us with respect to the Services and supersede all prior or contemporaneous communications and proposals (whether oral, written or electronic) between you and us with respect to the Services. If any provision of these Terms of Service is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that these Terms of Service will otherwise remain in full force and effect and enforceable. The failure of either party to exercise in any respect any right provided for herein shall not be deemed a waiver of any further rights hereunder
                       </p>
                       <Header style={style.teamText} as="h3">
                        Force Majeure
                       </Header>                    
                        <p>
                           We shall not be liable for any failure to perform our obligations hereunder where such failure results from any cause beyond our reasonable control, including, without limitation, mechanical, electronic or communications failure or degradation.
                       </p>
                       <Header style={style.teamText} as="h3">
                        Assignment
                       </Header>    
                       <p>
                           These Terms of Service are personal to you, and are not assignable, transferable or sublicensable by you except with our prior written consent. We may assign, transfer or delegate any of our rights and obligations hereunder without consent.
                       </p>
                        <Header style={style.teamText} as="h3">
                        Agency
                       </Header>   
                       <p>
                         No agency, partnership, joint venture, or employment relationship is created as a result of these Terms of Service and neither party has any authority of any kind to bind the other in any respect.  
                       </p>
                        <Header style={style.teamText} as="h3">
                        Notices
                       </Header>  
                       <p>
                        Unless otherwise specified in these Term of Service, all notices under these Terms of Service will be in writing and will be deemed to have been duly given when received, if personally delivered or sent by certified or registered mail, return receipt requested; when receipt is electronically confirmed, if transmitted by facsimile or e-mail; or the day after it is sent, if sent for next day delivery by recognized overnight delivery service. Electronic notices should be sent to jeff@Podsheets.com .
                       </p>
                        <Header style={style.teamText} as="h3">
                        No Waiver
                       </Header>  
                       <p>
Our failure to enforce any part of these Terms of Service shall not constitute a waiver of our right to later enforce that or any other part of these Terms of Service. Waiver of compliance in any particular instance does not mean that we will waive compliance in the future. In order for any waiver of compliance with these Terms of Service to be binding, we must provide you with written notice of such waiver through one of our authorized representatives.
                       </p>
                         <Header style={style.teamText} as="h3">
                        Headings
                       </Header> 
                       <p>
The section and paragraph headings in these Terms of Service are for convenience only and shall not affect their interpretation.
                       </p>
                        <Header style={style.teamText} as="h3">
                        Contact
                       </Header> 
                       <p>
You may contact us at the email address jeff@Podsheets.com or at the following address:
<br/>
Podsheets Inc<br/>
1333 Gough St<br/>
San Francisco, CA 94109<br/>

                       </p>
                        </Grid.Column>
                    </Grid.Row> 
                </Grid>
                {this.props.disableFooter ?
                null
                :
                <Footer />
                }
            </div>
        );
    }

}

const style = {
    content: {
        padding: "6vh",
        textAlign: "justify",
    },
    mainTitle: {
        color: colors.mainLVibrant,
        fontSize: "220%",
    },
    subTitle: {
        color: colors.mainVibrant,
    },
    teamText: {
        color: colors.mainVibrant,
    },
    founderName: {
        color: colors.mainLVibrant,
    },
    founderPosition: {
        color: colors.mainVibrant,
        marginTop: 10,
    },
    textParagraph: {
        color: colors.mainVibrant,
        textAlign: "justify",
        fontSize: "120%",
        marginTop: "5vh",
    },
};