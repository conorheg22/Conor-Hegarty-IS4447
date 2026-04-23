import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import TripsScreen from '../app/trips';
import { seedDatabase } from '../db/seed';

// MOCK FETCH (Important for weather API)
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        results: [{ latitude: 48.85, longitude: 2.35 }],
        current: { temperature_2m: 20 },
      }),
  })
) as jest.Mock;

describe('Trips Screen Integration', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    await seedDatabase();
  });

  it('displays seeded trips on screen', async () => {
    const { getByText } = render(<TripsScreen />);

    await waitFor(() => {
      expect(getByText('Paris Trip')).toBeTruthy();
      expect(getByText('Bali Trip')).toBeTruthy();
    });
  });
});