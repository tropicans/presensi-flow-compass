import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce a value.
 * @param value The value to debounce.
 * @param delay The debounce delay in milliseconds.
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, delay: number): T {
  // State untuk menyimpan nilai yang sudah di-debounce
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Atur timer untuk memperbarui nilai debounced setelah delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Bersihkan timer jika nilai atau delay berubah
    // Ini penting untuk mencegah update jika pengguna masih mengetik
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Hanya jalankan ulang efek jika nilai atau delay berubah

  return debouncedValue;
}
