import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BackButton from "@/components/BackButton";
import styles from "../terms-and-conditions/terms.module.css";
import Navigation from "@/components/Navigation";

export const metadata = {
  title: "Return Policy and Guidelines | Reddix Tech Drones",
  description: "Return policy, warranty information, and return guidelines for Reddix Tech Drones.",
};

export default function ReturnPolicy() {
  return (
    <div className={styles.container}>
      <Navigation />
      
      <div className={styles.inner}>
        <BackButton />
        
        <div className={styles.contentCard}>
          <h1 className={styles.title}>
            Return Policy and Guidelines
          </h1>
          <p className={styles.subtitle}>
            Information regarding returns, warranties, and exchanges for Reddix Tech Enterprises.
          </p>

          <div className={styles.sections}>
            <section className={styles.section}>
              <h2>
                <span className={styles.sectionNumber}>1.0</span> New and Unused Product
              </h2>
              <p>
                Reddix offers a (7) day return policy on <strong>most</strong> new unopened equipment, starting from the date the product(s) was delivered to the customer. Anything beyond (7) days of delivery will not be eligible for return. If the product(s) received have been opened, used, or damaged, no return options will be offered. The shipping cost for any unwanted product will not be refunded by Reddix. Replacements or exchange to other products may be provided without additional cost by the discretion of Reddix but on the other hand, returns by the customer due to a valid reason (if the customer doesn't require the product anymore), there will be a 15% restocking fee and return shipping cost is borne by the customer and will not be refunded.
              </p>
              <p><strong>Any such refunds will only be in store credit.</strong></p>
              <p>
                For DOA/Non-working/damaged products, customers will need to create a ticket with the respective manufacturer for any replacement procedure. Please get in touch with our customer care for instructions. Replacements will only be given after receiving the approval from the manufacturer.
              </p>
              <p>
                For returns on New and Unused Product, we require that items are brand new with no signs of use. Packaging needs to be undamaged and fully intact and contains included accessories, cables, batteries, manuals, etc. We require proof of new condition with high-quality photos or a high-quality video showing that item(s) is in new condition with all included accessories. <strong>Warranty seal(s) need to be intact on the packaging.</strong>
              </p>
              <p>
                In the case that the item(s) is returned and the condition is not in New and Unused or included accessories are missing, the return will not be completed and the item(s) will be returned back to the customer at additional shipping cost borne by the customer.
              </p>
              <p>
                Reddix will only accept or consider any missing products/accessories claims if you inform the same over mail/WhatsApp/telephone within (24) hours after products arrival. Any missing claims of products/accessories made after (24) hours on product delivery will not be entertained.
              </p>
              <p>
                Warranty will not be entertained in cases where there is a user error in installation or assembling or any such scenarios including but not limited to mismatch of products or not following manufacturer recommendation or procedure guidelines.
              </p>
              <p>
                In any and all cases, Reddix reserves all rights to the said conditions and each case will be taken individually and the final call will be by Reddix. If you are uncomfortable with our policy, we request not to complete the purchase and get in touch with our customer care for more clarity on the same.
              </p>
            </section>

            <section className={styles.section}>
              <h2>
                <span className={styles.sectionNumber}>2.0</span> Warranty by Product Category
              </h2>
              <p>
                The below warranty outline is generic and would differ according to respective brand policies and is not a concrete warranty window for any product sold.
              </p>

              <h3>General Accessories</h3>
              <p>
                Products not specifically listed, such as; antennas, monitors, hardware, and general accessories are covered by a <strong>(30) day</strong> manufacture defect warranty. If a problem occurs from a defect in the product, exchange, store credit, a refund will be issued. Reddix holds the right to refuse any products which have been deemed to be damaged by the customer and not related to a manufacturer issue.
              </p>

              <h3>FPV Cameras</h3>
              <p>
                FPV cameras are covered by a <strong>(30) day</strong> manufacturer defect warranty. The warranty does not cover damage from external forces, electrical fire, power surges, water damage, or tampering. Once approved, an exchange, store credit, a refund will be provided.
              </p>

              <h3>FPV Goggles</h3>
              <p>
                FPV goggles carry a <strong>(30) day</strong> warranty in the event of a manufacturer defect. The manufacturer's warranty does not cover any damage caused by drops, wear, and tear, water damage, electrical damage, or damage caused by user alterations. Returns due to "bad fitment" are subject to <strong>(5%)</strong> restocking fee.
              </p>

              <h3>Flight Controllers / ESC / VTX</h3>
              <p>
                All flight controllers (FC), electronic speed controllers (ESC), video transmitters (VTX), power distribution boards (PDB), and similar electronic components are covered under a <strong>(15) day</strong> Reddix warranty. These items are covered in the event of a manufacturer defect.
              </p>
              <p>
                <strong>This policy does not cover any of the following:</strong> user error, damage to the components upon installation/dismantle, modifications, power surges, electrical fire, or water damage. (Reddix recommends testing all components for shorts before supplying power).
              </p>

              <h3>Motors / Servos</h3>
              <p>
                Motors and servos sold by Reddix are covered by a <strong>(30) day</strong> warranty for manufacturer defects. If an issue occurs within (30) days; Reddix will exchange the defective product. If the product is unavailable or has been discontinued, store credit or a refund may be issued. Motors with physical damage, modifications, or general abuse will not be eligible to receive a credit and will be disposed of.
              </p>
              <p><strong>NOTE:</strong> ** Please check all motor screws for proper length before spinning up.</p>

              <h3>Ready-to-Fly</h3>
              <p>
                Ready-to-Fly drones built and sold by Reddix carry a <strong>(15) day</strong> return policy. In the occurrence of a malfunction, Reddix will repair or replace it with an original or similar model. If a replacement model is not available a store credit may be issued instead or a refund. Reddix holds the right to refuse any return which shows signs of; modification, fire/water damage, electrical short, or general misuse. Reddix recommends inspecting all RTFs thoroughly before supplying battery power.
              </p>

              <h3>DJI Product</h3>
              <p>
                All DJI products are covered under a <strong>(7) day</strong> return policy for unopened and unregistered items. If the unwanted products have been used or opened Reddix will not be able to accept the return. ** DJI requests that all warranty/defective claims be handled directly between the DJI and the Consumer.
              </p>

              <h3>Batteries</h3>
              <p>
                Batteries sold by Reddix carry a <strong>(15) day</strong> warranty covering dead on arrival (DOA) and manufacture defects. Excludes all batteries that show signs of misuse, overcharging, impact damage or water damage. All battery returns must be approved by Reddix via an emailed image of the defective battery to <a href="mailto:reddix.lpu@gmail.com" className="text-[#00f0ff] hover:underline">reddix.lpu@gmail.com</a>. Upon approval please dispose of the damaged battery in a safe manner and the exchange or credit will be issued.
              </p>
            </section>

            <section className={styles.section}>
              <h2>
                <span className={styles.sectionNumber}>3.0</span> Exclusions & Return Process
              </h2>
              <h3>Exclusions</h3>
              <p>
                Reddix does not offer a refund on Premium Technical Support services purchased. However, the value remains in Premium Technical Support can be used as a payment method.
              </p>

              <h3>Return process</h3>
              <p>
                Request a Return/Exchange online or over the phone with a Reddix representative. Returns will be accepted only in case-to-case basis.
              </p>
              <p>
                Once accepted we will send you a return label if the returned product is defective. If the product is new and unwanted, you will need to arrange for return shipping to us. Tracking is mandatory for returns.
              </p>
              <p>
                Please allow 3-5 business days for processing once your order arrives at our facility. Items requiring extensive testing could take up to 7-14 business days.
              </p>
              <p>
                An exchange or credit will be issued to the customer once approved by a Reddix representative and a nominal restocking and convenience fee will be charged in all cases (Usually 10% of the return order value).
              </p>
              <p>
                *All returns and exchanges are at the discretion of Reddix. Reimbursement for the return shipping cost only applies to actual shipping cost or postage, this does not include shipping or packing materials. It will be capped at 100INR.
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
