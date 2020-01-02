import React, { ReactNode } from 'react';

import styles from './styles.module.css';

interface IconButtonProps {
  icon: ReactNode;
  text: string | undefined;
}

class IconButton extends React.PureComponent<IconButtonProps, {}> {
  public render(): ReactNode {
    return (
      <button>
        <span className={styles.Icon}>{this.props.icon}</span>
        <span className={styles.Text}>{this.props.text}</span>
      </button>
    );
  }
}

export default IconButton;
