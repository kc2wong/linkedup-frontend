import { TFunction } from 'i18next';
import {
  Button,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  InlineDrawer,
  makeStyles,
  OverlayDrawer,
} from '@fluentui/react-components';
import { Dismiss24Regular, EraserRegular, SearchRegular } from '@fluentui/react-icons';
import { ReactElement } from 'react';
import { Form } from './Container';
import { useIsMobile } from '../hooks/use-mobile';

const useStylesDrawer = makeStyles({
  drawerSupplementInfo: {
    maxWidth: '40vw',
    '@media (max-width: 600px)': {
      maxWidth: '100vw',
    },
  },
  drawerSsearchCriteria: { minWidth: '200px', width: '20%' },
});

type DrawerComponentProps = {
  children: ReactElement | ReactElement[];
  isOpen: boolean;
  onClose: () => void;
  position: 'start' | 'end';
  noPadding: boolean;
  title: string;
  className: string;
};

const DrawerComponent: React.FC<DrawerComponentProps> = ({
  children,
  isOpen,
  onClose,
  position,
  noPadding,
  title,
  className,
}) => {
  const styles = noPadding ? { paddingLeft: 'unset', paddingTop: '6px' } : { paddingTop: '6px' };
  const isMobile = useIsMobile();

  const drawerHeader = (
    <DrawerHeader style={styles}>
      <DrawerHeaderTitle
        action={
          <Button
            appearance="subtle"
            aria-label="Close"
            icon={<Dismiss24Regular />}
            onClick={onClose}
          />
        }
      >
        {title}
      </DrawerHeaderTitle>
    </DrawerHeader>
  );
  const drawerBody = <DrawerBody style={styles}>{children}</DrawerBody>;

  return isMobile ? (
    // For mobile, must pop from bottom
    <OverlayDrawer className={className} open={isOpen} position="bottom" size="small">
      {drawerHeader}
      {drawerBody}
    </OverlayDrawer>
  ) : (
    <InlineDrawer className={className} open={isOpen} position={position} separator size="large">
      {drawerHeader}
      {drawerBody}
    </InlineDrawer>
  );
};

type SearchCriteriaDrawerProps = {
  children: ReactElement[];
  isOpen: boolean;
  onDrawerClose: () => void;
  onClear: () => void;
  onSearch: () => void;
  title?: string;
  t: TFunction;
};

export const SearchCriteriaDrawer: React.FC<SearchCriteriaDrawerProps> = ({
  children,
  isOpen,
  onDrawerClose,
  onClear,
  onSearch,
  title,
  t,
}) => {
  const stylesDrawer = useStylesDrawer();

  const searchForm = (
    <Form
      buttons={[
        <Button key="resetBtn" icon={<EraserRegular />} onClick={onClear}>
          {t('system.message.reset')}
        </Button>,
        <Button key="searchBtn" appearance="primary" icon={<SearchRegular />} onClick={onSearch}>
          {t('system.message.search')}
        </Button>,
      ]}
      numColumn={1}
    >
      {children}
    </Form>
  );
  return (
    <DrawerComponent
      className={stylesDrawer.drawerSsearchCriteria}
      isOpen={isOpen}
      noPadding={true}
      onClose={onDrawerClose}
      position="start"
      title={title ?? t('system.message.searchCriteria')}
    >
      {searchForm}
    </DrawerComponent>
  );
};

type DetailEditingDrawerProps = {
  children: ReactElement | ReactElement[];
  isOpen: boolean;
  onCloseDrawer: () => void;
  title: string;
};

export const DetailEditingDrawer: React.FC<DetailEditingDrawerProps> = ({
  children,
  isOpen,
  onCloseDrawer,
  title,
}) => {
  const stylesDrawer = useStylesDrawer();

  return (
    <DrawerComponent
      className={stylesDrawer.drawerSupplementInfo}
      isOpen={isOpen}
      noPadding={false}
      onClose={onCloseDrawer}
      position="end"
      title={title}
    >
      {children}
    </DrawerComponent>
  );
};
