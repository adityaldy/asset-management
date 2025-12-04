/**
 * useDebounce Hook Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../hooks/useDebounce';

describe('useDebounce Hook', () => {
  
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'changed', delay: 500 });

    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Advance timer by 499ms
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current).toBe('initial');

    // Advance timer by 1ms more (total 500ms)
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('changed');
  });

  it('should use default delay of 500ms', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    // Should not update before 500ms
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current).toBe('initial');

    // Should update after 500ms
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe('updated');
  });

  it('should reset timer when value changes during debounce', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } }
    );

    // First change
    rerender({ value: 'ab' });
    
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('a');

    // Second change - should reset timer
    rerender({ value: 'abc' });
    
    act(() => {
      vi.advanceTimersByTime(200);
    });
    // Still 'a' because timer was reset
    expect(result.current).toBe('a');

    // Complete the debounce
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe('abc');
  });

  it('should handle rapid successive changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 200),
      { initialProps: { value: 'start' } }
    );

    // Rapid changes
    rerender({ value: 's' });
    act(() => { vi.advanceTimersByTime(50); });
    
    rerender({ value: 'se' });
    act(() => { vi.advanceTimersByTime(50); });
    
    rerender({ value: 'sea' });
    act(() => { vi.advanceTimersByTime(50); });
    
    rerender({ value: 'sear' });
    act(() => { vi.advanceTimersByTime(50); });
    
    rerender({ value: 'search' });

    // Value should still be 'start'
    expect(result.current).toBe('start');

    // Wait for debounce
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Should have the final value
    expect(result.current).toBe('search');
  });

  it('should work with different data types', () => {
    // Number
    const { result: numberResult, rerender: rerenderNumber } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: 0 } }
    );
    
    rerenderNumber({ value: 42 });
    act(() => { vi.advanceTimersByTime(100); });
    expect(numberResult.current).toBe(42);

    // Object
    const { result: objResult, rerender: rerenderObj } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: { name: 'test' } } }
    );
    
    const newObj = { name: 'updated' };
    rerenderObj({ value: newObj });
    act(() => { vi.advanceTimersByTime(100); });
    expect(objResult.current).toEqual({ name: 'updated' });

    // Array
    const { result: arrResult, rerender: rerenderArr } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: [1, 2, 3] } }
    );
    
    rerenderArr({ value: [4, 5, 6] });
    act(() => { vi.advanceTimersByTime(100); });
    expect(arrResult.current).toEqual([4, 5, 6]);
  });

  it('should handle null and undefined values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: 'test' } }
    );

    rerender({ value: null });
    act(() => { vi.advanceTimersByTime(100); });
    expect(result.current).toBeNull();

    rerender({ value: undefined });
    act(() => { vi.advanceTimersByTime(100); });
    expect(result.current).toBeUndefined();
  });

  it('should handle empty string', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: '' });
    act(() => { vi.advanceTimersByTime(100); });
    expect(result.current).toBe('');
  });

  it('should update immediately when delay is 0', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 0),
      { initialProps: { value: 'first' } }
    );

    rerender({ value: 'second' });
    
    act(() => {
      vi.advanceTimersByTime(0);
    });
    
    expect(result.current).toBe('second');
  });

  it('should cleanup timer on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    
    const { unmount, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'test' } }
    );

    // Trigger a timer
    rerender({ value: 'new value' });
    
    // Unmount
    unmount();

    // clearTimeout should have been called
    expect(clearTimeoutSpy).toHaveBeenCalled();
    
    clearTimeoutSpy.mockRestore();
  });
});
