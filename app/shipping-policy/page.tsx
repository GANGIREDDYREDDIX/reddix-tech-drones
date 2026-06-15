import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BackButton from "@/components/BackButton";
import styles from "../terms-and-conditions/terms.module.css";
import Navigation from "@/components/Navigation";

export const metadata = {
  title: "Shipping Policy | Reddix Tech Drones",
  description: "Shipping rules, times, and policies for Reddix Tech Drones.",
};

export default function ShippingPolicy() {
  return (
    <div className={styles.container}>
      <Navigation />
      
      <div className={styles.inner}>
        <BackButton />
        
        <div className={styles.contentCard}>
          <h1 className={styles.title}>
            Shipping Policy
          </h1>
          <p className={styles.subtitle}>
            Shipping Rules, Transit Times, and Delivery Procedures for Reddix Tech Enterprises.
          </p>

          <div className={styles.sections}>
            <section className={styles.section}>
              <h2>
                <span className={styles.sectionNumber}>1.0</span> Shipping Rules
              </h2>
              <h3>No Freight Forwarding Addresses:</h3>
              <p>We do not allow orders to be shipped to freight forwarding addresses.</p>
              
              <h3>No Hotel Addresses:</h3>
              <p>We do not allow orders to be shipped to hotels. Please provide a permanent street address.</p>
              
              <h3>PO Boxes:</h3>
              <p>Shipments to PO Boxes are reviewed on a case-by-case basis and may be declined.</p>
              
              <h3>Refunds:</h3>
              <p>All orders that are declined by us due to any of these rules are voided with your method of payment and the order is canceled.</p>
            </section>

            <section className={styles.section}>
              <h2>
                <span className={styles.sectionNumber}>2.0</span> Free Shipping
              </h2>
              <p>
                Reddix offers Free Shipping on a majority of orders. Qualifying orders over Rs. 9,999/- will be eligible for free Surface shipping.
              </p>
              <p>
                * Specific items within the store are excluded from free shipping due to their large size and/or weight. Items that are excluded from free shipping will be noted. If an order contains one of these items, the entire order will not be eligible for free shipping.
              </p>
            </section>

            <section className={styles.section}>
              <h2>
                <span className={styles.sectionNumber}>3.0</span> Where is my shipment?
              </h2>
              <p>
                If you want to get an idea of the status of your order (like "Has my order shipped yet?"), log in to your Reddix account and look at your order history. Each order will show if it was shipped and provide a tracking link, if available, given your selected shipping methods. Please wait for at least 24hrs for the tracking information to be updated once it is shipped. If your order status shows shipped but you do not see tracking that means your order is packaged and will be shipped shortly.
              </p>
              <p>
                If your status is processing it means that we have received your order and will be shipping as soon as possible.
              </p>
            </section>

            <section className={styles.section}>
              <h2>
                <span className={styles.sectionNumber}>4.0</span> How long until my order ships?
              </h2>
              <p>
                You should plan for at least 1 business day from the time your order is placed until it is shipped. While we do our best to get all in-stock orders that are placed before 3 (IST) shipped out on the same day, we cannot always guarantee such a short processing time. Please also keep in mind that the number of days refers to "business" days, which is Monday through Saturday.
              </p>
              <p>
                If you have any special requests for shipping/packaging or regarding a shipping agency, please feel free to contact us.
              </p>
              <p>
                We will start to process your order as soon as we receive it. So it may not be possible to cancel the order. If you still opt to cancel the order, then please get in touch with us on Mobile or WhatsApp as soon as possible. We will cancel the order at your request if it is not shipped or completed processing. We will ONLY refund 98% of the order value for canceled orders.
              </p>
              <p>
                Orders can be shipped from different locations/warehouses depending on the products, quantity and the delivery location. Orders may also be split into one or more packages from different warehouses depending on availability. Please get in touch with us in case you would like to know which location your order will be shipped from.
              </p>
              <p>
                For store-pickup, please contact our customer care before placing the order to get a prior appointment for collection. Appointment is compulsory.
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
