import React, { ReactNode } from 'react';
import { FiEdit3 } from 'react-icons/fi';

import styles from './styles.module.css';
import IconButton from '../IconButton';

class Toolbar extends React.PureComponent<{}, {}> {
  public render(): ReactNode {
    return (
      <div className={styles.Container}>
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
