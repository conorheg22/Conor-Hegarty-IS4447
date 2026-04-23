import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import FormField from '../components/FormField';

describe('FormField Component', () => {
  it('renders label and placeholder correctly', () => {
    const { getByText, getByPlaceholderText } = render(
      <FormField
        label="Trip Name"
        placeholder="Enter trip"
        value=""
        onChangeText={() => {}}
      />
    );

    expect(getByText('Trip Name')).toBeTruthy();
    expect(getByPlaceholderText('Enter trip')).toBeTruthy();
  });

  it('fires onChangeText when typing', () => {
    const mockFn = jest.fn();

    const { getByPlaceholderText } = render(
      <FormField
        label="Trip Name"
        placeholder="Enter trip"
        value=""
        onChangeText={mockFn}
      />
    );

    fireEvent.changeText(getByPlaceholderText('Enter trip'), 'Paris');

    expect(mockFn).toHaveBeenCalledWith('Paris');
  });
});