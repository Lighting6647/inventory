import React from 'react';
import styles from './Topbar.module.css';

const Topbar = () => {
  return (
    <header className={styles.topbar}>
      <div className={styles.searchContainer}>
        <input type="text" placeholder="Search..." className={styles.searchInput} />
      </div>
      <div className={styles.actions}>
        <div className={styles.avatar}>
          <span>A</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
