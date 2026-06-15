import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms and Conditions | Reddix Tech Drones",
  description: "Terms, conditions, and policies for Reddix Tech Drones e-commerce platform.",
};

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-black text-gray-200 py-16 px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-[#00f0ff] hover:text-[#00c3ff] transition-colors mb-10 text-sm font-semibold tracking-wider uppercase"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>
        
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 md:p-12 shadow-2xl backdrop-blur-sm">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Terms and Conditions
          </h1>
          <p className="text-gray-400 text-lg mb-12">
            Reddix Notices, Terms, and Conditions. Reddix is an e-commerce platform owned and operated by Reddix Tech Enterprises.
          </p>

          <div className="space-y-12 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-[#00f0ff]">1.0</span> FPV Rules and Regulations
              </h2>
              <p>
                The use and operation of FPV radio equipment (such as UHF long-range systems or video transmission equipment) in India and many other countries may require a license and some countries may forbid its use entirely. In India, you will need a "HAM" amateur radio license as well as an approval type from WPC. It is your responsibility to ensure that the use of products you purchase from Reddix meet the requirements imposed by your government's rules and regulations for RF devices. Do not purchase products from Reddix if you are unsure of the government requirements or are not able to comply with them. Reddix nor its affiliates cannot be held responsible for your actions under any circumstance, including but not limited to if you use products purchased from Reddix in violation of your government's regulations. We sell our products with no claims for suitability or legality of operation whatsoever.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-[#00f0ff]">2.0</span> Warning Notice
              </h2>
              <p>
                You acknowledge that you fully understand the inherent danger involved when operating multi-rotor and other model aircraft or vehicles. Spinning propellers can cause severe injury. Never work on your models with mounted propellers. Lithium Polymer (LiPo) batteries can be unstable if not used or charged correctly and this can include combustion or spontaneously catching fire. Our power systems including motors, batteries, and electronic speed control (ESC) units can draw significant current, in some cases over 30 amps which can be dangerous. Prevent electrical shock by always working with powered electronic systems safely de-energized. Never short the electrical leads, reverse the leads or place the leads on your body at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-[#00f0ff]">3.0</span> No Warranty/Liability
              </h2>
              <p className="mb-4">
                Reddix provides no warranty of any kind for any of the equipment it sells or otherwise distributes. You assume all risks for any products purchased or received from Reddix. Reddix and its employees are not liable for any instance of injury to you or others, or damage or destruction of property. Additionally, Reddix is not liable for any damages consequential or inconsequential resulting from the use or application of any Reddix provided products. We sell our equipment expressly without warranty or performance for any use or situation. It is up to the user to ensure that the products safely meet the user's intended purpose.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.1 Faulty Items</h3>
              <p className="mb-4">
                If an item you received from Reddix is deemed to be inoperable or faulty ("Faulty Item") due to a manufacturing defect, Reddix may replace or repair that item at its sole discretion, if it is deemed by Reddix that the fault is indeed due to a manufacturing defect and not user misuse including construction error. Reddix will not be liable for equipment that might have been lost and/or damaged as a result of the Faulty Item. As an example, if a video transmitter you received from Reddix is faulty and becomes inoperable during flight causing you to lose your airframe, Reddix may replace the faulty video transmitter, but not any other equipment such as the airframe that might have been lost and/or damaged due to the faulty video transmitter.
              </p>
              <p className="mb-4">
                For DOA/Non-working products, customers will need to create a ticket with the respective manufacturer for any replacement procedure. Please get in touch with our customer care for instructions. Replacements will only be given after receiving the approval from the manufacturer. In case of batteries, warranty will only be applicable if the user shows an unboxing video followed by a cell voltage check in the same video. All batteries that we ship are individually checked for any damage/dead cells before dispatch, and hence, we will not be responsible if the customer does not provide the above-mentioned proof upon receipt of products immediately. In any case, an <strong className="text-white">unboxing video will be of paramount importance</strong> and will be verified in case of products being delivered damaged and or missing items. We assume no responsibility if this condition is not met.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.2 Incorrectly Published Product Details</h3>
              <p className="mb-4">
                At Reddix, we do our best to keep our website's product information accurate. However, the FPV (First Person View) world changes rapidly, so some details might occasionally be out of date.
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-2 text-gray-400">
                <li><strong className="text-white">Specifications, prices, and availability</strong> can change without notice and might not always be immediately updated on the product page. For the most current information, please contact Reddix customer service directly.</li>
                <li>If you receive a product with <strong className="text-white">specifications different from what was listed on our site</strong>, please tell us <strong className="text-white">before</strong> you install or mount it. We cannot be held responsible for any damages if you proceed with installation, nor can we offer support in such cases.</li>
                <li><strong className="text-white">Product images</strong> may sometimes be outdated. Manufacturers often change designs or features without informing us, and we may not always have the latest image. We will not accept returns based solely on an image being different unless the product description is also incorrect. <strong className="text-white">Product descriptions take precedence over images.</strong> For example, if an image shows a blue radio but you selected pink, you will receive the pink one.</li>
              </ul>
              <p>
                We source images from manufacturers and other websites and cannot guarantee they are always current. Please contact our customer care service if you have any doubts/queries!
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-[#00f0ff]">4.0</span> Returns
              </h2>
              <p>
                We pride in giving our customers the option to pay Cash-on-Delivery but due to the large number of people abusing this service by denying the packages during delivery, we incur losses in shipping and revenue. We have been thus forced to flag and cancel any COD order that seems suspicious or if the customer has a previous history of rejecting packages. In such cases, please contact our customer care to confirm your order and we will try to assist you on your order.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-[#00f0ff]">5.0</span> Shipping Terms and Conditions
              </h2>
              
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.1 Commercial Carriers</h3>
              <p className="mb-4">
                You accept Delhivery, DTDC, FedEx, Bluedart, DHL, Speedpost and all other commercial carriers Reddix offers or chooses to fulfill your order ("Mail Carrier(s)") as reliable mail carriers and Reddix's carriers of choice.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.2 Shipping Address</h3>
              <p className="mb-4">
                We need a complete and valid street address to ship your products. We do not allow orders to be shipped to the following:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-2 text-gray-400">
                <li>Hotel and Convention Center Addresses – We have had a problem with packages getting lost at hotels and convention centers. We require a permanent, verified, residential, or established business address.</li>
                <li>PO Boxes, including APO addresses – Shipments to PO Boxes and APO addresses are reviewed on a case by case basis and may be declined. To avoid your order being held for review, use your regular residential or business address.</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.3 Tracking and Lost Shipments</h3>
              <p className="mb-4">
                If you select "Free Shipping", Reddix will send your packages with Delhivery (mostly surface). Depending on the type of Delhivery service chosen by Reddix, the package may show receipt by Delhivery, but may not show any tracking information after it was received by Delhivery. Even if Reddix ships the items in a timely fashion to the Delhivery pick-up center, it might not be updated in the tracking immediately and will not be considered as a liability of our same-day shipping policy. Reddix has no influence or control over the internal processes of Mail Carriers or the local postal system. Reddix cannot be held liable for any mistakes made by a Mail Carrier.
              </p>
              <p className="mb-4">
                If a package has been shipped under the free shipping offer and has been lost in transit, the liability of Reddix will be limited to Rs. 5,000/-.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.4 Shipping insurance</h3>
              <p className="mb-4">
                When Reddix sends your order with any Mail Carrier, the delivery is not insured. Additional and optional "shipping insurance" may be offered for an additional charge at Reddix's sole discretion.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.5 Signature requirements</h3>
              <p className="mb-4">
                Most of the mail services offered by Reddix require a signature on delivery of your package. Only in certain cases and in the sole discretion of Reddix will a signature not be required.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.6 Backordered items</h3>
              <p className="mb-4">
                If your order contains items that are 'back-ordered', your entire order will be held until the back-ordered item(s) come(s) into stock. All orders ship complete. Partial shipments are only available under certain conditions and at the sole discretion of Reddix. Items of your order that are not on backorder will be held in reserve for you so that no previously purchased item runs out of stock while we wait on the back-ordered item(s). Cancellations of backordered products will NOT be entertained.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.7 Canceled Order Refunds</h3>
              <p className="mb-4">
                All orders that are declined by us due to a) violation of any of our shipping rules; or b) suspected fraud, are automatically voided with your method of payment and canceled. In most cases, you will be notified of any order cancellations. If the customer wishes to cancel an order, there may be cancellation charges applicable depending on the product, payment gateway, status of the order etc; you are requested to contact our customer care WhatsApp to get more details for the same. If paid through RazorPay, there will be a 3% payment gateway charge on deduction.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.8 Shipment Times and Delays</h3>
              <p className="mb-4">
                Orders having all items in stock and placed before 3 PM IST Monday-Saturday typically ship the same day. Exceptions may occur due to holidays, payment review delays, or other unforeseen issues. Orders placed after 3 PM IST will typically leave our warehouse the same business day from the time your order is placed but may not be forwarded by the courier partner till the next business day. Transit times for "Next-Day" and other expedited forms of shipping are calculated from the point in time that the Mail Carrier picks up an order from our warehouse after processing. In rare cases and depending on your ship-to address, it can take longer than indicated for a package to reach you. This delay is independent of the mail service you chose during check-out. The delivery time frames provided are averages for most mail pieces. Reddix is not responsible if a Mail Carrier delays the arrival of your package due to circumstances beyond our control and or other issues. Reddix does not provide refunds in case your package is delayed.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.9 Free Shipping</h3>
              <p className="mb-4">
                Reddix now offers Free Shipping on a majority of orders. *Qualifying orders over Rs. 9,999 will be eligible for free Surface shipping except when the weight (volumetric or gross) exceeds 2KG.
              </p>
              <p className="mb-4">
                Some exceptions apply such as specialty items as noted on individual product pages. Batteries can only be shipped via the surface shipping method. While free shipping is still available for orders containing batteries, 2-3 day shipping cannot be guaranteed due to the required ground shipping method.
              </p>
              <p className="mb-4">
                * Specific items within the store are excluded from free shipping due to their large size and/or weight. Items that are excluded from free shipping are clearly marked as such at the bottom of each product page description. If an order contains one of these items, the entire order will not be eligible for free shipping.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.10 Fraudulent Activity</h3>
              <p className="mb-4">
                In cases where there is foul play/fraudulence at play, Reddix reserves the right to do a thorough investigation into the matter by bringing in all stakeholders (courier company, aggregator, customer and if required, law enforcement). Only if the customer provides the relevant proof of unboxing, with proper close up of the shipping label, condition of the package as well as any seal/taping, (We will not be responsible if the customer accepts a tampered package from the courier personnel!) of missing/damaged/wrong products, will we take it into consideration. We will not be responsible for any neglection in this condition from the customer side. In cases where we find the customer has tried to misinform/deceive the store by providing fake videos of unboxing/delivery, it will be dealt with legally.
              </p>
              <p className="mb-4 text-white font-semibold">
                In any case, Reddix reserves the right to take the final decision after checking with the stakeholders. Please do not order with us if you are not comfortable with this condition!
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-[#00f0ff]">6.0</span> B2B GST Credit Invoice
              </h2>
              <p>
                We provide B2B GST Invoices for customers with a valid GST number. Since our systems are automated, you will need to add your GST number during checkout in the relevant fields where asked. Unfortunately, if the customer forgets to add this/inputs incorrect GST number, <strong className="text-white">we will not be able to amend it in any case</strong> and the invoice will be considered as a B2C invoice without GST credit.
              </p>
            </section>
          </div>
          
          <div className="mt-16 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Reddix Tech Enterprises. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
