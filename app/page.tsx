"use client";

import { motion, Variants } from "framer-motion";
import Navigation from "@/components/Navigation";
import ScrollSequenceCanvas from "@/components/ScrollSequenceCanvas";
import styles from "./page.module.css";
import clsx from "clsx";
import Link from "next/link";

export default function Home() {
  const fadeUpVariant: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  const fadeRightVariant: Variants = {
    hidden: { opacity: 0, x: -40 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  const fadeLeftVariant: Variants = {
    hidden: { opacity: 0, x: 40 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  return (
    <main className={styles.main}>
      <Navigation />

      <div className={styles.scrollContainer}>
        <div className={styles.stickyCanvasContainer}>
          <ScrollSequenceCanvas />
        </div>

        <div className={styles.storytellingOverlays}>
          {/* Section 1: Hero */}
          <motion.section 
            id="overview"
            className={clsx(styles.section, styles.heroSection)}
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.4, margin: "-100px 0px" }}
            variants={fadeUpVariant}
          >
            <h1 className={styles.headline}><span className="gradient-text">Reddix Tech Enterprises</span></h1>
            <p className={styles.subheadline}>
              Transforming businesses through enterprise-grade technology solutions.
            </p>
            <div className={styles.ctaButtonGroup}>
              <Link href="/shop" className={styles.primaryCTA}>Our Services</Link>
              <a href="#3d-printing" className={styles.secondaryCTA}>Learn More</a>
            </div>
            <p className={styles.microcopy}>Custom Drones • Aerial Systems • 3D Printing • Enterprise Solutions</p>
          </motion.section>

          {/* Section 2: Drones */}
          <motion.section 
            id="drones"
            className={clsx(styles.section, styles.flightSection)}
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.4, margin: "-100px 0px" }}
            variants={fadeRightVariant}
          >
            <h2 className={styles.headline}>Custom <br /><span className="gradient-text">Aerial Systems.</span></h2>
            <p className={styles.subheadline}>Enterprise-Grade Drone Solutions</p>
            <p className={styles.bodyCopy}>
              We engineer bespoke aerial platforms designed for industrial inspection, professional cinematography, and advanced telemetry gathering.
            </p>
            <p className={styles.bodyCopy}>
              Our hardware features high-tensile composite chassis, omnidirectional obstacle sensing, and intelligent flight autonomy for unmatched precision.
            </p>
          </motion.section>
          {/* Section 3: 3D Printing */}
          <motion.section 
            id="3d-printing"
            className={clsx(styles.section, styles.safetySection)}
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.4, margin: "-100px 0px" }}
            variants={fadeLeftVariant}
          >
            <h2 className={styles.headline}>Precision <br /><span className="gradient-text">Engineering.</span></h2>
            <p className={styles.subheadline}>Advanced 3D Printing & Prototyping</p>
            <ul className={styles.featureList}>
              <li>Rapid Prototype Iteration</li>
              <li>High-Tensile Material Options</li>
              <li>Complex Structural Modeling</li>
              <li>Sub-Millimeter Tolerance</li>
            </ul>
          </motion.section>


          {/* Section 5: CTA */}
          <motion.section 
            className={clsx(styles.section, styles.ctaSection)}
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.4, margin: "-100px 0px" }}
            variants={fadeUpVariant}
          >
            <h2 className={styles.headline}>Start Your <br />Transformation.</h2>
            <p className={styles.subheadline}>Partner with Reddix Tech today.</p>
            
            <div className={styles.ctaButtonGroup}>
              <Link href="/shop" className={styles.primaryCTA}>View All Services</Link>
            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}
