import { useTheme } from '@react-navigation/native';
import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { toastContextStyles } from './toastContext.styles';

interface ToastOptions {
  message: string;
  position?: 'top' | 'bottom';
  duration?: number;
  backgroundColor?: string;
  textColor?: string;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

interface ToastState extends ToastOptions {
  id: number;
}

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const { colors } = useTheme();
  const styles = toastContextStyles(colors);

  const [toast, setToast] = useState<ToastState | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    (options: ToastOptions) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      opacity.setValue(0);

      setToast({ ...options, id: Date.now() });

      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      timerRef.current = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start(() => setToast(null));
      }, options.duration ?? 2500);
    },
    [opacity],
  );

  const isBottom = !toast || toast.position !== 'top';

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.container,
            isBottom ? styles.bottom : styles.top,
            { opacity, backgroundColor: toast.backgroundColor ?? '#323232' },
          ]}
        >
          <Text style={[styles.text, { color: toast.textColor ?? '#FFFFFF' }]}>
            {toast.message}
          </Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};
