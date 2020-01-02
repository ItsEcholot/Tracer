import React, { ReactNode } from 'react';
import { FiEdit3 } from 'react-icons/fi';

import styles from './styles.module.css';
import IconButton from '../IconButton';

class Toolbar extends React.PureComponent<{}, {}> {
  public render(): ReactNode {
    return (
      <div className={styles.Container}>
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" className={styles.FilterDef}>
          <filter id="white-background-filter" x="0" y="0" width="100%" height="100%">
            <feFlood floodColor="#ffffff" floodOpacity="0.5" result="flood" />
            <feComposite in="SourceGraphic" in2="flood" result="composite" />
          </filter>
        </svg>
        <div className={`${styles.ToolbarContainer} ${styles.Brightener}`} />
        <div className={styles.ToolbarContainer}>
          <ul className={styles.Toolbar}>
            <li>
              <IconButton icon={<FiEdit3 />} text="Write" />
            </li>
            <li>
              <IconButton icon={<FiEdit3 />} text="Write" />
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

export default Toolbar;
