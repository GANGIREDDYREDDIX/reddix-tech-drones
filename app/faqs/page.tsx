"use client";

import Link from "next/link";
import BackButton from "@/components/BackButton";
import styles from "./faqs.module.css";
import Navigation from "@/components/Navigation";

const faqs = [
  {
    category: "General & Payment",
    items: [
      {
        q: "Can I pre-order an out-of-stock product?",
        a: "You can choose to pre-order from the product page with the Pre-Order button. If the Pre-Order button is not active raise a request from the 'PRODUCT REQUEST' option from the top bar. Also, you can sign up for restock notifications for specific products on our site, so you will be one of the first to know when the specific product you want is available again."
      },
      {
        q: "Which payment methods are accepted?",
        a: "We accept bank transfers (NEFT / RTGS / IMPS), UPI, Debit cards, Credit Cards, and Wallets. We use our partner processing gateway for all payments, although we do have other options such as direct UPI payment for easier checkout. You can also pay in cash for store pickups or WhatsApp us (+91 6303 636 151) for other ways of payments. We want you to have a hassle-free experience with the easiest checkout options!"
      },
      {
        q: "Do you offer Cash on Delivery (COD)?",
        a: "COD SERVICES ARE TEMPORARILY UNAVAILABLE.\nWe do offer COD options for most orders under a total purchase value of Rs. 10,000/- though this will depend on a case-to-case basis. Please contact our customer support to know whether your order qualifies for COD. You can choose store pickup so that users can pay on pickup.\nDo keep in mind we are one of the few stores that provide COD services and customers who misuse the service or reject the package during delivery will be penalized with the shipping costs on their behalf. We request customers to pre-pay your orders whenever possible."
      },
      {
        q: "Do you provide a warranty on products?",
        a: "We at Reddix Tech Enterprises take immense pride in being one of the sole stores in India to provide brand warranty for all products sold on our store. Any purchase made carries brand warranty and/or store warranty. The specific warranty duration for each type of product is mentioned on our Returns & Guidelines page. Please keep in mind returns & replacements will be on a case-to-case basis and Reddix reserves all rights to deny any fraudulent claims."
      },
      {
        q: "Are there any extra charges for different payment methods?",
        a: "Unlike other stores in India, we believe that the burden of payment gateway charges should not be on the customer but rather the store and hence, we do not charge extra for using our partner gateways and absorb the transaction charges."
      },
      {
        q: "Do you provide a GST bill?",
        a: "All our transactions are in accordance with GST filing. You can know more information regarding our GST certifications with the GSTIN number mentioned at the footer of the page."
      }
    ]
  },
  {
    category: "Orders & Shipping",
    items: [
      {
        q: "Do you provide free shipping?",
        a: "Yes, we provide free shipping for orders over ₹9,999/-"
      },
      {
        q: "Which delivery partner do you use for shipping?",
        a: "We ship the orders via DTDC as our primary delivery partner but we do provide other shipping options such as Delhivery, Bluedart, eKart as well as Speedpost."
      },
      {
        q: "How long does it take for me to receive my order?",
        a: "In most cases, you will receive your order within 7-10 working days across all major cities. However, if you are located in a rural area, this might take longer. Deliveries to the Eastern and North-eastern regions might also be longer."
      },
      {
        q: "How do I change my shipping address for an order?",
        a: "Unfortunately, once the order has been shipped, we can no longer modify the delivery address. However, if we are intimated by call or WhatsApp (+91 6303 636 151) while the order is being processed, we can try our best to accommodate the request, although this is not a guarantee."
      },
      {
        q: "How do I track the status of my order?",
        a: "All your orders and status will be updated in the orders tab in your profile. Moreover, you will receive an email and SMS when the order has been shipped."
      },
      {
        q: "Will all the products in my order come in a single package?",
        a: "Though our primary fulfillment center carries the bulk of our products in stock, some products might be shipped from our auxiliary shipping centers and will be shipped separately. You will not be charged extra for an order that has been split into two packages."
      },
      {
        q: "Do you ship to my country?",
        a: "As you might have guessed, Reddix Tech Enterprises is an Indian store and we ship pan India and not international. However, you are more than welcome to place your orders from anywhere on the globe 😉"
      },
      {
        q: "How do I create an account?",
        a: "Please go to the My Account page and click on Register to create your profile."
      }
    ]
  },
  {
    category: "Returns & Refunds",
    items: [
      {
        q: "What is your returns policy?",
        a: "You can find more details about this on our Return Policy & Guidelines page."
      },
      {
        q: "I received the wrong item",
        a: "We take great care in shipping out the correct product in order through multiple barcoding and stock-keeping methods. Despite all our efforts, if the product(s) you receive is different from the product(s) you ordered, we will ship out the correct item again after verifying.\n\nThe first thing you need to do is contact us, by phone/WhatsApp (+91 6303 636 151) or preferably by mail (reddix.lpu@gmail.com). Please send us as much information as possible including your order number, which product you ordered, and what you received instead. Include pictures of the product label(s), and the packing slip. After verifying, we will ship out the correct item free of cost or provide a refund. In either case, you will be required to send us back the incorrect item you received in an intact and unused condition. We will assist you with the return process and bear all shipping costs involved."
      },
      {
        q: "My order arrived damaged",
        a: "We take great pride in using excellent packing material so that your order arrives at your doorstep in pristine condition. If despite our best efforts to carefully prepare your order, it arrives damaged, we will replace the damaged parts or in case the item is out of stock, refund the same. Please accept our sincere apologies for the same. To assist you with this matter, please contact our Customer Service team (reddix.lpu@gmail.com).\n\nSince the online marketplace is prone to fraudulent activities, in order to protect our interest and safekeeping, you will be asked to send us an unboxing video or photos for verification."
      },
      {
        q: "Where should I submit my authorized return?",
        a: "You can contact our customer support to initiate a return request and we will assist you with the same."
      },
      {
        q: "How do I receive customer support?",
        a: "You can contact us through email (reddix.lpu@gmail.com), phone/WhatsApp (+91 6303 636 151), or through the website."
      },
      {
        q: "What would I do if I entered an incorrect shipping address?",
        a: "If you have accidentally entered an incorrect shipping address, please contact us immediately letting us know the need to update your address. Please include your full name, order number, and the correct shipping address.\n\nOrders are processed as quickly as possible and for this reason, we cannot guarantee any changes to your order once it has been shipped.\n\nWe will do our best to change the shipping address before it ships. If it does ship before we are able to fix the issue, please reply to our message when the tracking information states that it is being returned to the sender. As soon as we receive it, we will ship you out a new package."
      },
      {
        q: "Can I change or cancel an order?",
        a: "Once you've submitted your order, it's not possible to edit the items in your order or change your delivery address. You can always place a second order for any additional items you want and cancel the previous order, although this might get you to lose your discounts from the first order. Please contact our customer service for additional assistance.\n\n1. Pre-Order items are not eligible for cancellation."
      }
    ]
  }
];

export default function FAQPage() {
  return (
    <>
      <Navigation />
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.backWrapper}>
            <BackButton />
          </div>

          <header className={styles.header}>
            <h1 className={styles.title}>
              Frequently Asked Questions
            </h1>
            <p className={styles.subtitle}>
              Find answers to common questions about our products, shipping, returns, and more.
            </p>
          </header>

          <main>
            {faqs.map((category, index) => (
              <section key={index} className={styles.categorySection}>
                <h2 className={styles.categoryTitle}>
                  <span className={styles.categoryNumber}>
                    {index + 1}
                  </span>
                  {category.category}
                </h2>
                <div className={styles.faqList}>
                  {category.items.map((item, itemIndex) => (
                    <details key={itemIndex} className={styles.faqItem}>
                      <summary className={styles.faqSummary}>
                        <span>{item.q}</span>
                        <span className={styles.arrow}>▼</span>
                      </summary>
                      <div className={styles.faqAnswer}>
                        {item.a}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </main>

          <footer className={styles.footer}>
            <p className={styles.footerText}>
              Still have questions? We're here to help.
            </p>
            <div className={styles.contactLinks}>
              <a href="mailto:reddix.lpu@gmail.com" className={styles.contactLink}>
                reddix.lpu@gmail.com
              </a>
              <a href="tel:+916303636151" className={styles.contactLink}>
                +91 6303 636 151
              </a>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
