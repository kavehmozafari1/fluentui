import * as React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbDivider,
  BreadcrumbLinkProps,
} from '@fluentui/react-breadcrumb';

import { bundleIcon, CalendarMonthFilled, CalendarMonthRegular } from '@fluentui/react-icons';
const CalendarMonth = bundleIcon(CalendarMonthFilled, CalendarMonthRegular);
type Item = {
  key: number;
  item?: string;
  linkProps: {
    'aria-label'?: string;
    href?: string;
    icon?: BreadcrumbLinkProps['icon'];
    disabled?: boolean;
    iconPosition?: 'before' | 'after';
  };
};

const linkItems: Item[] = [
  {
    key: 0,
    item: 'Item 0',
    linkProps: {
      href: 'https://developer.microsoft.com/',
    },
  },
  {
    key: 1,
    item: 'Item 1',
    linkProps: {
      href: 'https://developer.microsoft.com/',
      icon: <CalendarMonth />,
    },
  },
  {
    key: 2,
    item: 'Item 2',
    linkProps: {
      href: 'https://developer.microsoft.com/',
    },
  },
  {
    key: 3,
    linkProps: {
      'aria-label': 'Item 3',
      href: 'https://developer.microsoft.com/',
      icon: <CalendarMonth />,
    },
  },
  {
    key: 4,
    item: 'Item 4',
    linkProps: {
      href: 'https://developer.microsoft.com/',
      icon: <CalendarMonthRegular />,
      iconPosition: 'after',
    },
  },
  {
    key: 5,
    item: 'Item 5',
    linkProps: {
      href: 'https://developer.microsoft.com/',
      disabled: true,
    },
  },
  {
    key: 6,
    item: 'Item 6',
    linkProps: {
      href: 'https://developer.microsoft.com/',
    },
  },
];

function renderLink(el: Item, isLastItem: boolean = false) {
  return (
    <React.Fragment key={`${el.key}-button`}>
      <BreadcrumbItem>
        <BreadcrumbLink
          {...el.linkProps}
          target="_blank"
          current={isLastItem}
          href={isLastItem ? undefined : el.linkProps?.href}
        >
          {el.item}
        </BreadcrumbLink>
      </BreadcrumbItem>
      {!isLastItem && <BreadcrumbDivider />}
    </React.Fragment>
  );
}

export const Default = () => (
  <>
    <Breadcrumb aria-label="Small breadcrumb example with BreadcrumbLink" size="small">
      {linkItems.map(el => renderLink(el, el.key === linkItems.length - 1))}
    </Breadcrumb>
    <Breadcrumb aria-label="Subtle breadcrumb" appearance="subtle">
      {linkItems.map(el => renderLink(el, el.key === linkItems.length - 1))}
    </Breadcrumb>
    <Breadcrumb aria-label="Large breadcrumb with BreadcrumbLink" size="large">
      {linkItems.map(el => renderLink(el, el.key === linkItems.length - 1))}
    </Breadcrumb>
  </>
);
