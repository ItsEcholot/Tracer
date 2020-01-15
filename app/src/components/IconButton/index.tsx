import React, { ReactNode } from 'react';

import styles from './styles.module.css';

interface IconButtonProps {
  className: string;
  icon: ReactNode;
  text: string | undefined;
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

class IconButton extends React.PureComponent<IconButtonProps, {}> {
  public render(): ReactNode {
    return (
      <button className={this.props.className} onClick={this.props.onClick}>
        <span className={styles.Icon}>{this.props.icon}</span>
        <span className={styles.Text}>{this.props.text}</span>
      </button>
    );
  }
}

export default IconButton;
