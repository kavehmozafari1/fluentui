import type { ComponentProps, ComponentState, ExtractSlotProps, Slot } from '@fluentui/react-utilities';
import type { TreeItemContextValue } from '../../contexts';
import { treeItemLevelToken } from '../../utils/tokens';
import * as React from 'react';

export type TreeItemCSSProperties = React.CSSProperties & { [treeItemLevelToken]?: string | number };

export type TreeItemType = 'leaf' | 'branch';

export type TreeItemSlots = {
  root: Slot<ExtractSlotProps<Slot<'div'> & { style?: TreeItemCSSProperties }>>;
};

export type TreeItemContextValues = { treeItem: TreeItemContextValue };

/**
 * TreeItem Props
 */
export type TreeItemProps<Value = string> = ComponentProps<Partial<TreeItemSlots>> & {
  value?: Value;
  itemType: TreeItemType;
};

/**
 * State used in rendering TreeItem
 */
export type TreeItemState = ComponentState<TreeItemSlots> &
  TreeItemContextValue & {
    level: number;
    itemType: TreeItemType;
  };
