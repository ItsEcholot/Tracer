import React, { ReactNode } from 'react';
import { FiEdit3 } from 'react-icons/fi';
import { MdSelectAll } from 'react-icons/md';
import classNames from 'classnames';
import IconButton from '../IconButton';
import ToolModes from '../../types/ToolModes';

import styles from './styles.module.css';

interface ToolbarProps {
  toolMode: ToolModes;
  onToolModeChange: (toolMode: ToolModes) => void;
}

class Toolbar extends React.PureComponent<ToolbarProps, {}> {
  public render(): ReactNode {
    return (
      <div className={styles.ToolbarContainer}>
        <ul className={styles.Toolbar}>
          <IconButton
            className={classNames({
              [styles.Active]: this.props.toolMode === ToolModes.Draw,
              [styles.IconButton]: true,
            })}
            icon={<FiEdit3 />}
            text="Draw"
            onClick={(): void => this.props.onToolModeChange(ToolModes.Draw)}
          />
          <IconButton
            className={classNames({
              [styles.Active]: this.props.toolMode === ToolModes.Select,
              [styles.IconButton]: true,
            })}
            icon={<MdSelectAll />}
            text="Select"
            onClick={(): void => this.props.onToolModeChange(ToolModes.Select)}
          />
        </ul>
      </div>
    );
  }
}

export default Toolbar;
