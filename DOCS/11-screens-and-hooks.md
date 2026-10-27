# 11 — Screens & Hooks

## Screen anatomy

```text
screens/ItemListScreen/
├── index.tsx                 default export: the screen
├── itemList.styles.ts        styles factory
└── components/               pieces used only here
    ├── ItemCard.tsx
    ├── itemCard.styles.ts
    ├── FilterBar.tsx
    └── filterBar.styles.ts
```

Every screen:

1. Is typed with `NativeStackScreenProps<RootStackParamList, '<RouteName>'>`.
2. Returns `<AppLayout header={...} body={...} footer={...} />` as its root. Header, body, and footer are built as named elements above `return`; `AppLayout` never takes children.
3. Gets data from a domain hook (`hooks/`) or an API hook. No fetching logic inline.
4. Gets styles via `useThemedStyles(factory)`.
5. Wraps handlers passed to children in `useCallback`, and wraps list rows in `React.memo`.
6. Shows four states where relevant: **loading, error (with retry), empty, data**.

## Domain hooks — `src/hooks/`

Hooks combine API queries, slice selectors, and derived data for screens. They keep screens declarative.

```ts
// src/hooks/useItems.ts
import { useMemo } from 'react';
import { useGetItemsQuery } from '@api';
import { Item } from '@interfaces/item.interface';
import { selectActiveFilter } from '@slices/itemSlice';
import { useAppSelector } from '@store';

// Module-level constant so `data ?? EMPTY` keeps a stable reference
// (a `= []` default creates a new array every render and breaks useMemo).
const EMPTY: Item[] = [];

export const useItems = () => {
  const { data, isLoading, isFetching, isError, refetch } = useGetItemsQuery();
  const activeFilter = useAppSelector(selectActiveFilter);
  const items = data ?? EMPTY;

  const filteredItems = useMemo(
    () =>
      activeFilter === 'all'
        ? items
        : items.filter(item => item.status === activeFilter),
    [items, activeFilter],
  );

  return { items, filteredItems, activeFilter, isLoading, isFetching, isError, refetch };
};
```

Action hooks remove the duplicate "mutate + toast" code from screens and cards:

```ts
// src/hooks/useItemActions.ts
import { useCallback } from 'react';
import { useDeleteItemMutation, useUpdateItemMutation } from '@api';
import { ApiError } from '@api/manager';
import { useAppToast } from '@hooks/useAppToast';
import { Item } from '@interfaces/item.interface';

export const useItemActions = () => {
  const { showToast } = useAppToast();
  const [updateItem] = useUpdateItemMutation();
  const [deleteItem, { isLoading: isDeleting }] = useDeleteItemMutation();

  const toggleStatus = useCallback(
    async (item: Item) => {
      const status = item.status === 'completed' ? 'pending' : 'completed';
      try {
        await updateItem({ id: item.id, status }).unwrap();
        showToast({ message: `Marked as ${status}`, type: 'success', position: 'top' });
      } catch (e) {
        showToast({ message: (e as ApiError).message, type: 'error' });
      }
    },
    [updateItem, showToast],
  );

  const remove = useCallback(
    async (id: string) => {
      try {
        await deleteItem(id).unwrap();
        showToast({ message: 'Item deleted', type: 'success', position: 'top' });
        return true;
      } catch (e) {
        showToast({ message: (e as ApiError).message, type: 'error' });
        return false;
      }
    },
    [deleteItem, showToast],
  );

  return { toggleStatus, remove, isDeleting };
};
```

Hook rules:
- Hooks used inside list rows must be cheap. Never call a hook that subscribes to a whole query (`useItems`) inside every row. Pass data down as props instead.
- Pure helpers (formatters, status-to-label) go in `utils/`, not in hooks.

---

## List screen — `src/screens/ItemListScreen/index.tsx`

```tsx
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ConfirmModal from '@components/ConfirmModal';
import Txt from '@components/CustomText';
import AppLayout from '@components/layout';
import NoData from '@components/NoData';
import { useItemActions } from '@hooks/useItemActions';
import { useItems } from '@hooks/useItems';
import { useResponsive } from '@hooks/useResponsive';
import { useThemedStyles } from '@hooks/useThemedStyles';
import { RootStackParamList } from '@interfaces/navigation';
import { Item } from '@interfaces/item.interface';
import FilterBar from './components/FilterBar';
import ItemCard from './components/ItemCard';
import { itemListStyles } from './itemList.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'ItemListScreen'>;

const keyExtractor = (item: Item) => item.id;

const ItemListScreen = ({ navigation }: Props) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(itemListStyles);
  const { filteredItems, isLoading, isFetching, isError, refetch } = useItems();
  const { toggleStatus, remove } = useItemActions();
  const { columns } = useResponsive(); // 1 phone, 2 medium, 3 expanded
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);

  const handlePress = useCallback(
    (item: Item) => navigation.navigate('ItemDetailScreen', { itemId: item.id }),
    [navigation],
  );
  const handleEdit = useCallback(
    (item: Item) => navigation.navigate('ItemFormScreen', { itemId: item.id }),
    [navigation],
  );
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) {
      return;
    }
    setDeleteTarget(null);
    await remove(deleteTarget.id);
  }, [deleteTarget, remove]);

  const renderItem = useCallback(
    ({ item }: { item: Item }) => (
      <ItemCard
        item={item}
        onPress={handlePress}
        onEdit={handleEdit}
        onToggle={toggleStatus}
        onDelete={setDeleteTarget}
      />
    ),
    [handlePress, handleEdit, toggleStatus],
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }
    if (isError) {
      return (
        <NoData headerText="Failed to load" descriptionText="Check your connection.">
          <TouchableOpacity onPress={refetch}>
            <Txt style={styles.retryText}>Tap to retry</Txt>
          </TouchableOpacity>
        </NoData>
      );
    }
    return (
      <NoData
        headerText="Nothing here yet"
        descriptionText="No items match the selected filter."
      />
    );
  };

  const header = (
    <View style={styles.headerRow}>
      <Txt style={styles.headerTitle}>Items</Txt>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('ItemFormScreen')}
        accessibilityRole="button"
      >
        <Txt style={styles.addButtonText}>+ Add</Txt>
      </TouchableOpacity>
    </View>
  );

  const body = (
    <>
      <FilterBar />

      <FlatList
        // FlatList cannot change numColumns on the fly; remount when it changes.
        key={`items-${columns}`}
        numColumns={columns}
        columnWrapperStyle={columns > 1 ? styles.columnWrapper : undefined}
        data={filteredItems}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty()}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={refetch}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        initialNumToRender={10}
        windowSize={7}
        removeClippedSubviews
      />

      <ConfirmModal
        visible={deleteTarget !== null}
        title="Delete Item"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        positiveText="Delete"
        destructive
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );

  // Grid uses the full width on tablets; other screens keep the centered column.
  return <AppLayout header={header} body={body} fullWidth={columns > 1} />;
};

export default ItemListScreen;
```

```ts
// src/screens/ItemListScreen/itemList.styles.ts
import { StyleSheet } from 'react-native';
import { responsiveFonts } from '@constants/responsive-fonts';
import { IColors } from '@interfaces/theme';
import { ms, screenPadding } from '@utils';
import { textStyling } from '@utils/text';

export const itemListStyles = (colors: IColors) =>
  StyleSheet.create({
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: screenPadding(),
      paddingVertical: ms(12),
    },
    headerTitle: {
      ...textStyling({ fontSize: responsiveFonts.fontxx, color: colors.text })
        .bold,
    },
    addButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: ms(16),
      paddingVertical: ms(8),
      borderRadius: ms(8),
    },
    addButtonText: {
      ...textStyling({ fontSize: responsiveFonts.fontxiv, color: colors.white })
        .semiBold,
    },
    columnWrapper: {
      gap: ms(12),
    },
    listContent: {
      flexGrow: 1,
      paddingHorizontal: screenPadding(),
      paddingBottom: ms(24),
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    retryText: {
      ...textStyling({ fontSize: responsiveFonts.fontxiv, color: colors.primary })
        .medium,
    },
  });
```

### List row — `components/ItemCard.tsx`

Rows are `React.memo`. They receive stable callbacks and call them with their own item, which avoids inline closures in `renderItem`. In a multi-column grid the card style needs `flex: 1` so cells share the row equally.

```tsx
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Txt from '@components/CustomText';
import { useThemedStyles } from '@hooks/useThemedStyles';
import { Item } from '@interfaces/item.interface';
import { itemCardStyles } from './itemCard.styles';

interface ItemCardProps {
  item: Item;
  onPress: (item: Item) => void;
  onEdit: (item: Item) => void;
  onToggle: (item: Item) => void;
  onDelete: (item: Item) => void;
}

const ItemCard = ({ item, onPress, onEdit, onToggle, onDelete }: ItemCardProps) => {
  const isCompleted = item.status === 'completed';
  const styles = useThemedStyles(itemCardStyles, isCompleted);

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.75}>
      <View style={styles.row}>
        <Txt style={styles.title} numberOfLines={2}>
          {item.title}
        </Txt>
        <View style={styles.badge}>
          <Txt style={styles.badgeText}>{item.status}</Txt>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={[styles.actionBtn, styles.toggleBtn]} onPress={() => onToggle(item)}>
          <Txt style={styles.toggleBtnText}>
            Mark as {isCompleted ? 'Pending' : 'Done'}
          </Txt>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => onEdit(item)}>
          <Txt style={styles.editBtnText}>Edit</Txt>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => onDelete(item)}>
          <Txt style={styles.deleteBtnText}>Delete</Txt>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(ItemCard);
```

`itemCard.styles.ts` follows the factory pattern with a variant flag, `(colors: IColors, isCompleted: boolean) => StyleSheet.create({...})`. Badge and toggle colors switch between `green50/green500` and `orange50/orange400`.

### Filter chips — `components/FilterBar.tsx`

```tsx
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Txt from '@components/CustomText';
import { useThemedStyles } from '@hooks/useThemedStyles';
import { ItemFilter } from '@interfaces/item.interface';
import { selectActiveFilter, setFilter } from '@slices/itemSlice';
import { useAppDispatch, useAppSelector } from '@store';
import { filterBarStyles } from './filterBar.styles';

const FILTERS: ItemFilter[] = ['all', 'pending', 'completed'];

const FilterBar = () => {
  const styles = useThemedStyles(filterBarStyles);
  const dispatch = useAppDispatch();
  const activeFilter = useAppSelector(selectActiveFilter);

  return (
    <View style={styles.container}>
      {FILTERS.map(filter => {
        const active = activeFilter === filter;
        return (
          <TouchableOpacity
            key={filter}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => dispatch(setFilter(filter))}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Txt style={active ? styles.chipTextActive : styles.chipText}>{filter}</Txt>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default React.memo(FilterBar);
```

---

## Detail screen — `src/screens/ItemDetailScreen/index.tsx`

Reads live data by id. `selectFromResult` reuses the list cache, so detail opens instantly with no extra request. Use `useGetItemByIdQuery(itemId)` instead when the detail endpoint returns more fields than the list.

```tsx
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useGetItemsQuery } from '@api';
import ConfirmModal from '@components/ConfirmModal';
import Txt from '@components/CustomText';
import AppLayout from '@components/layout';
import NoData from '@components/NoData';
import { useItemActions } from '@hooks/useItemActions';
import { useThemedStyles } from '@hooks/useThemedStyles';
import { RootStackParamList } from '@interfaces/navigation';
import { itemDetailStyles } from './itemDetail.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'ItemDetailScreen'>;

const ItemDetailScreen = ({ route, navigation }: Props) => {
  const { itemId } = route.params;
  const styles = useThemedStyles(itemDetailStyles);
  const { toggleStatus, remove } = useItemActions();
  const [deleteVisible, setDeleteVisible] = useState(false);

  const { item, isFetching, refetch } = useGetItemsQuery(undefined, {
    selectFromResult: ({ data, isFetching: fetching }) => ({
      item: data?.find(i => i.id === itemId),
      isFetching: fetching,
    }),
  });

  if (!item) {
    return (
      <AppLayout title="Item" body={<NoData headerText="Item not found" />} />
    );
  }

  const handleDelete = async () => {
    setDeleteVisible(false);
    if (await remove(item.id)) {
      navigation.goBack();
    }
  };

  const body = (
    <>
      <View style={styles.container}>
        <View style={styles.card}>
          <Txt style={styles.title}>{item.title}</Txt>
          <View style={styles.row}>
            <Txt style={styles.label}>Status</Txt>
            <Txt style={styles.value}>{item.status}</Txt>
          </View>
          <View style={styles.row}>
            <Txt style={styles.label}>Created</Txt>
            <Txt style={styles.value}>{new Date(item.createdAt).toLocaleString()}</Txt>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => toggleStatus(item)}>
            <Txt style={styles.actionText}>
              {item.status === 'completed' ? 'Mark as Pending' : 'Mark as Completed'}
            </Txt>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('ItemFormScreen', { itemId: item.id })}
          >
            <Txt style={styles.actionText}>Edit</Txt>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => setDeleteVisible(true)}
          >
            <Txt style={styles.deleteText}>Delete</Txt>
          </TouchableOpacity>
        </View>
      </View>

      <ConfirmModal
        visible={deleteVisible}
        title="Delete Item"
        message="Are you sure? This cannot be undone."
        positiveText="Delete"
        destructive
        onCancel={() => setDeleteVisible(false)}
        onConfirm={handleDelete}
      />
    </>
  );

  return (
    <AppLayout
      title="Item Detail"
      withScroll
      onRefresh={refetch}
      refreshing={isFetching}
      body={body}
    />
  );
};

export default ItemDetailScreen;
```

---

## Form screen (create + edit) — `src/screens/ItemFormScreen/index.tsx`

- No `itemId` param means create; with `itemId` it means edit.
- `keyboardAvoiding` + `withScroll` + a sticky `footer` keep the Save button visible above the keyboard.
- Field state is local `useState`. Validation runs on save and clears on edit.
- Submits through a mutation, shows a toast, then `goBack()`.

```tsx
import React, { useState } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCreateItemMutation, useGetItemsQuery, useUpdateItemMutation } from '@api';
import { ApiError } from '@api/manager';
import Btn from '@components/Button';
import Txt from '@components/CustomText';
import AppLayout from '@components/layout';
import { useAppToast } from '@hooks/useAppToast';
import { useThemedStyles } from '@hooks/useThemedStyles';
import { ItemStatus } from '@interfaces/item.interface';
import { RootStackParamList } from '@interfaces/navigation';
import { itemFormStyles } from './itemForm.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'ItemFormScreen'>;

const STATUSES: ItemStatus[] = ['pending', 'completed'];

const ItemFormScreen = ({ route, navigation }: Props) => {
  const itemId = route.params?.itemId;
  const isEditing = !!itemId;

  const { colors } = useTheme();
  const styles = useThemedStyles(itemFormStyles);
  const { showToast } = useAppToast();

  const { existing } = useGetItemsQuery(undefined, {
    skip: !itemId,
    selectFromResult: ({ data }) => ({ existing: data?.find(i => i.id === itemId) }),
  });
  const [createItem, { isLoading: isCreating }] = useCreateItemMutation();
  const [updateItem, { isLoading: isUpdating }] = useUpdateItemMutation();

  const [title, setTitle] = useState(existing?.title ?? '');
  const [status, setStatus] = useState<ItemStatus>(existing?.status ?? 'pending');
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState('');

  const validate = (value: string) => {
    if (!value) {
      return 'Title cannot be empty.';
    }
    if (value.length < 3) {
      return 'Title must be at least 3 characters.';
    }
    return '';
  };

  const handleSave = async () => {
    const trimmed = title.trim();
    const validationError = validate(trimmed);
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      if (isEditing) {
        await updateItem({ id: itemId, title: trimmed, status }).unwrap();
      } else {
        await createItem({ title: trimmed, status }).unwrap();
      }
      showToast({
        message: isEditing ? 'Item updated' : 'Item created',
        type: 'success',
        position: 'top',
      });
      navigation.goBack();
    } catch (e) {
      showToast({ message: (e as ApiError).message, type: 'error' });
    }
  };

  const body = (
    <View style={styles.container}>
      <Txt style={styles.label}>Title</Txt>
      <TextInput
        style={[styles.input, focused && styles.inputFocused]}
        placeholder="Enter title..."
        placeholderTextColor={colors.grey300}
        value={title}
        onChangeText={text => {
          setTitle(text);
          if (error) {
            setError('');
          }
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        maxLength={200}
        returnKeyType="done"
        onSubmitEditing={handleSave}
      />
      {!!error && <Txt style={styles.errorText}>{error}</Txt>}

      <Txt style={styles.label}>Status</Txt>
      <View style={styles.statusRow}>
        {STATUSES.map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.chip, status === s && styles.chipActive]}
            onPress={() => setStatus(s)}
          >
            <Txt style={status === s ? styles.chipTextActive : styles.chipText}>{s}</Txt>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const footer = (
    <Btn
      title={isEditing ? 'Save Changes' : 'Create'}
      onPress={handleSave}
      loading={isCreating || isUpdating}
    />
  );

  return (
    <AppLayout
      title={isEditing ? 'Edit Item' : 'Create Item'}
      keyboardAvoiding
      withScroll
      body={body}
      footer={footer}
    />
  );
};

export default ItemFormScreen;
```

`TextInput` is themed through its styles (`backgroundColor: colors.card`, `borderColor: colors.border`, text color via `textStyling`) and `placeholderTextColor`. For multi-field forms, add a shared `components/Input` that bundles label + input + error, using the same pattern.

## Performance checklist for screens

- `FlatList` for any list longer than a screen. Never `ScrollView` + `.map()`.
- `keyExtractor` defined at module level; `renderItem` in `useCallback`; rows in `React.memo`.
- Never nest a `FlatList` inside `AppLayout withScroll`.
- Lists that should become grids on tablets use `useResponsive().columns` with `key` + `numColumns` (see the list screen).
- Delay heavy work until after the native transition (`InteractionManager.runAfterInteractions`).
- Use `selectFromResult` to subscribe to only the slice of a query a component needs.
