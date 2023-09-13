import React from 'react';
import styles from './footer.module.css'; // Import your CSS module for styling

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <img src="/base_icon.png" alt="Icon" className={styles.icon} />
        <span>Built on Base Georli</span>
      </div>
    </footer>
  );
}

export default Footer;
