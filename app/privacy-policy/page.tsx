import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BackButton from "@/components/BackButton";
import styles from "../terms-and-conditions/terms.module.css";
import Navigation from "@/components/Navigation";

export const metadata = {
  title: "Privacy Policy | Reddix Tech Drones",
  description: "Privacy policy and data handling guidelines for Reddix Tech Drones.",
};

export default function PrivacyPolicy() {
  return (
    <div className={styles.container}>
      <Navigation />
      
      <div className={styles.inner}>
        <BackButton />
        
        <div className={styles.contentCard}>
          <h1 className={styles.title}>
            Privacy Policy
          </h1>
          <p className={styles.subtitle}>
            What do we do with your information? How we collect, use, and protect your data at Reddix Tech Enterprises.
          </p>

          <div className={styles.sections}>
            <section className={styles.section}>
              <h2>
                <span className={styles.sectionNumber}>1.0</span> Information Collection
              </h2>
              <p>
                When you purchase something from our store, as part of the buying and selling process, we collect the personal information you give us such as your name, address, and email address.
              </p>
              <p>
                When you browse our store, we also automatically receive your computer's internet protocol (IP) address in order to provide us with information that helps us learn about your browser and operating system.
              </p>
              <p>
                <strong>Email marketing (if applicable):</strong> With your permission, we may send you emails about our store, new products, and other updates.
              </p>
            </section>

            <section className={styles.section}>
              <h2>
                <span className={styles.sectionNumber}>2.0</span> Disclosure
              </h2>
              <p>
                We may disclose your personal information if we are required by law to do so or if you violate our Terms & Conditions.
              </p>
            </section>

            <section className={styles.section}>
              <h2>
                <span className={styles.sectionNumber}>3.0</span> Payment
              </h2>
              <p>
                We do not store any kind of payment details like CREDIT CARD/DEBIT CARD/BANK ACCOUNT details as this is totally handled by the payment gateway (e.g., RAZORPAY). Security features include:
              </p>
              <ul className={styles.sectionList}>
                <li><strong>PCI DSS and ISO:27001 compliant:</strong> The PCI Council is a global body that sets compliance rules for managing cardholder data for all online payment systems. ISO is an organization with a membership of 164 national standards bodies.</li>
                <li><strong>Secure & encrypted communication:</strong> We use the highest assurance SSL/TLS certificate, which makes sure that no unauthorized person can access your sensitive payment data over the internet.</li>
                <li><strong>Tokenization to prevent data exposure:</strong> We replace your 16-digit card number with a token, which replaces the original card number. Tokens are assigned randomly, making it extremely difficult to reverse-engineer the actual card number.</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>
                <span className={styles.sectionNumber}>4.0</span> Third-party services
              </h2>
              <p>
                In general, the third-party providers used by us will only collect, use and disclose your information to the extent necessary to allow them to perform the services they provide to us.
              </p>
              <p>
                However, certain third-party service providers, such as payment gateways and other payment transaction processors, have their own privacy policies in respect to the information we are required to provide to them for your purchase-related transactions. For these providers, we recommend that you read their privacy policies so you can understand the manner in which your personal information will be handled by these providers.
              </p>
              <p>
                In particular, remember that certain providers may be located in or have facilities that are located in a different jurisdiction than either you or us. So if you elect to proceed with a transaction that involves the services of a third-party service provider, then your information may become subject to the laws of the jurisdiction(s) in which that service provider or its facilities are located.
              </p>
              <p>
                Once you leave our store's website or are redirected to a third-party website or application, you are no longer governed by this Privacy Policy or our website's Terms of Service.
              </p>
            </section>

            <section className={styles.section}>
              <h2>
                <span className={styles.sectionNumber}>5.0</span> Security
              </h2>
              <p>
                To protect your personal information, we take reasonable precautions and follow industry best practices to make sure it is not inappropriately lost, misused, accessed, disclosed, altered, or destroyed.
              </p>
            </section>

            <section className={styles.section}>
              <h2>
                <span className={styles.sectionNumber}>6.0</span> Cookies
              </h2>
              <p>
                Here is a list of cookies that we use. We've listed them here so that you can choose if you want to opt out of cookies or not.
              </p>
              <ul className={styles.sectionList}>
                <li><strong>cart_hash</strong></li>
                <li><strong>items_in_cart</strong></li>
                <li><strong>session</strong></li>
              </ul>
              <p>
                The first two cookies contain information about the cart as a whole and help our system know when the cart data changes. The final cookie contains a unique code for each customer so that it knows where to find the cart data in the database for each customer. No personal information is stored within these cookies.
              </p>
            </section>

            <section className={styles.section}>
              <h2>
                <span className={styles.sectionNumber}>7.0</span> Age of consent
              </h2>
              <p>
                By using this site, you represent that you are at least the age of majority in your state or province of residence, or that you are the age of majority in your state or province of residence and you have given us your consent to allow any of your minor dependents to use this site.
              </p>
            </section>

            <section className={styles.section}>
              <h2>
                <span className={styles.sectionNumber}>8.0</span> Changes to this privacy policy
              </h2>
              <p>
                We reserve the right to modify this privacy policy at any time, so please review it frequently. Changes and clarifications will take effect immediately upon their posting on the website. If we make material changes to this policy, we will notify you here that it has been updated, so that you are aware of what information we collect, how we use it, and under what circumstances, if any, we use and/or disclose it.
              </p>
              <p>
                If our store is acquired or merged with another company, your information may be transferred to the new owners so that we may continue to sell products to you.
              </p>
            </section>

            <section className={styles.section}>
              <h2>
                <span className={styles.sectionNumber}>9.0</span> Questions and contact information
              </h2>
              <p>
                If you would like to: access, correct, amend or delete any personal information we have about you, register a complaint, or simply want more information contact us at: <a href="mailto:reddix.lpu@gmail.com" className="text-[#00f0ff] hover:underline">reddix.lpu@gmail.com</a>
              </p>
            </section>
          </div>
          
          <div className={styles.footerNote}>
            &copy; {new Date().getFullYear()} Reddix Tech Enterprises. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
