import React, { ReactNode } from 'react';
import { FiEdit3 } from 'react-icons/fi';
import classNames from 'classnames';
import IconButton from '../IconButton';
import ToolModes from '../../types/ToolModes';

import styles from './styles.module.css';

interface ToolbarProps {
  toolMode: ToolModes;
}

class Toolbar extends React.PureComponent<ToolbarProps, {}> {
  public render(): ReactNode {
    return (
      <div className={styles.ToolbarContainer}>
        <ul className={styles.Toolbar}>
          <li className={classNames({ [styles.Active]: this.props.toolMode === ToolModes.Write })}>
            <IconButton
              icon={<FiEdit3 />}
              text="Write"
              color={this.props.toolMode === ToolModes.Write ? 'white' : 'black'}
            />
          </li>
          <li>
            <IconButton icon={<FiEdit3 />} text="Write" color="black" />
          </li>
        </ul>
      </div>
    );
  }
}

export default Toolbar;
