import Txt from '@components/CustomText';
import { useTheme } from '@react-navigation/native';
import { TaskFilter } from '@interfaces/task.interface';
import { setFilter } from '@slices/taskSlice';
import { useAppDispatch, useAppSelector } from '@store';
import React, { useCallback, useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { filterBarStyles } from './filterBar.styles';

const FILTERS: TaskFilter[] = ['all', 'completed', 'pending'];

const FilterBar = () => {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const activeFilter = useAppSelector(s => s.tasks.activeFilter);
  const styles = useMemo(() => filterBarStyles(colors), [colors]);

  const handleFilter = useCallback(
    (filter: TaskFilter) => dispatch(setFilter(filter)),
    [dispatch],
  );

  return (
    <View style={styles.container}>
      {FILTERS.map(filter => (
        <TouchableOpacity
          key={filter}
          style={[styles.chip, activeFilter === filter && styles.chipActive]}
          onPress={() => handleFilter(filter)}
          activeOpacity={0.8}
        >
          <Txt
            style={
              activeFilter === filter ? styles.chipTextActive : styles.chipText
            }
          >
            {filter}
          </Txt>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default React.memo(FilterBar);
