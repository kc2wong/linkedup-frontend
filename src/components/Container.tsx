import {
  Button,
  makeStyles,
  MessageBar,
  shorthands,
  tokens,
  Toolbar,
  ToolbarButton,
  typographyStyles,
} from '@fluentui/react-components';
import React from 'react';
import { ReactElement } from 'react';
import { Pagination } from './pagination';
import { PageTitle } from './page-title';
import { DeviceComponent } from './device-component';

const useStyles = makeStyles({
  root: {
    ...shorthands.overflow('hidden'),
    display: 'flex',
    marginLeft: tokens.spacingHorizontalXXL,
    marginRight: tokens.spacingHorizontalXXL,
    '@media (max-width: 600px)': {
      minHeight: 'calc(100vh - 56px)', // adjust 56px if your bottom bar height changes
      marginTop: tokens.spacingVerticalL,
      marginBottom: tokens.spacingVerticalL,
      marginLeft: tokens.spacingHorizontalM,
      marginRight: tokens.spacingHorizontalM,
    },
    ...shorthands.flex(1),
  },
  mobileRoot: {
    '@media (max-width: 600px)': {
      minHeight: 'calc(100vh - 56px)', // adjust 56px if your bottom bar height changes
    },
  },
  titleBar: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: tokens.spacingVerticalM,
    marginBottom: tokens.spacingVerticalM,
    minHeight: '40px',
    gap: tokens.spacingVerticalS,
    '& span': typographyStyles.title3,
    justifyContent: 'space-between',
  },
  baseForm: {
    display: 'grid',
    columnGap: '15px',
    width: '100%',
    '@media (max-width: 600px)': {
      display: 'flex',
      flexDirection: 'column',
    },
  },
  buttonPanel: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    '@media (max-width: 600px)': {
      gap: '20px',
      flexDirection: 'column',
    },
  },
  columnTwo: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  spanTwo: {
    gridColumn: 'span 2',
  },
  columnThree: {
    gridTemplateColumns: 'repeat(3, 1fr)',
  },
  spanThree: {
    gridColumn: 'span 3',
  },
  columnFour: {
    gridTemplateColumns: 'repeat(4, 1fr)',
  },
  spanFour: {
    gridColumn: 'span 4',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    gap: tokens.spacingHorizontalS,
  },
});

type FormProps = {
  numColumn: 1 | 2 | 3 | 4;
  buttons?: React.ReactElement<typeof Button>[];
  toolbarSlot?: React.ReactElement<typeof ToolbarButton>[] | React.ReactElement<typeof MessageBar>;
  pagination?: React.ReactElement<typeof Pagination>;
  styles?: React.CSSProperties;
  title?: string;
  children: ReactElement | ReactElement[];
};

export const Root: React.FC<{
  children: ReactElement | ReactElement[];
}> = ({ children }) => {
  const styles = useStyles();
  return <div className={styles.root}>{children}</div>;
};

export const MobileRoot: React.FC<{
  children: ReactElement | ReactElement[];
}> = ({ children }) => {
  const styles = useStyles();
  return <div className={styles.mobileRoot}>{children}</div>;
};

export const Form: React.FC<FormProps> = ({
  buttons,
  toolbarSlot,
  pagination,
  numColumn,
  styles: inputStyles,
  title,
  children,
}) => {
  const styles = useStyles();
  let columnClass: string | undefined, buttonClass: string | undefined;
  switch (numColumn) {
    case 2:
      columnClass = styles.columnTwo;
      buttonClass = styles.spanTwo;
      break;
    case 3:
      columnClass = styles.columnThree;
      buttonClass = styles.spanThree;
      break;
    case 4:
      columnClass = styles.columnFour;
      buttonClass = styles.spanFour;
      break;
  }
  const toolBar = toolbarSlot ? (
    Array.isArray(toolbarSlot) ? (
      <Toolbar> {toolbarSlot.map((btn, index) => React.cloneElement(btn, { key: index }))}</Toolbar>
    ) : (
      toolbarSlot
    )
  ) : (
    <></>
  );
  return (
    <div style={inputStyles}>
      {title ? (
        <>
          <div className={styles.titleBar}>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <PageTitle>{title}</PageTitle>
              {toolBar}
            </div>
            <DeviceComponent desktop={pagination ?? <></>} mobile={<></>}></DeviceComponent>
          </div>
        </>
      ) : (
        <></>
      )}
      <div className={`${styles.baseForm} ${columnClass}`}>
        {children}
        {buttons ? (
          <div className={`${styles.buttonPanel} ${buttonClass}`}>
            {buttons.map((btn, index) => React.cloneElement(btn, { key: index }))}
          </div>
        ) : (
          <></>
        )}
      </div>
      <DeviceComponent desktop={<></>} mobile={pagination ?? <></>}></DeviceComponent>
    </div>
  );
};

export const Row: React.FC<{
  children: ReactElement | ReactElement[];
  style?: React.CSSProperties;
}> = ({ children, style }) => {
  const styles = useStyles();
  return (
    <div className={styles.row} style={style}>
      {children}
    </div>
  );
};
