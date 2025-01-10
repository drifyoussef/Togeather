import React from 'react';
import { render } from '@testing-library/react';
import PaypalPayment from './PaypalPayment';
import fetchMock from 'jest-fetch-mock';

jest.mock('@paypal/react-paypal-js', () => ({
    PayPalButtons: jest.fn(() => <div>PayPal Button</div>),
}));

jest.mock('sweetalert2', () => ({
    fire: jest.fn(),
}));

describe('PaypalPayment Component', () => {
    beforeEach(() => {
        localStorage.clear();
        fetchMock.resetMocks();
    });

    it('should render PayPal button', () => {
        render(<PaypalPayment />);
    });

    it('should create an order successfully', async () => {
        const mockOrder = { token: 'fake-token', paymentId: 'fake-payment-id' };
        fetchMock.mockResponseOnce(JSON.stringify(mockOrder));
    });

    it('should handle order creation error', async () => {
        fetchMock.mockRejectOnce(new Error('Failed to create order'));
    });

    it('should approve an order successfully', async () => {
        const mockResult = { success: true };
        fetchMock.mockResponseOnce(JSON.stringify(mockResult));

        localStorage.setItem('paymentId', 'fake-payment-id');

    });

    it('should handle order approval error', async () => {
        fetchMock.mockRejectOnce(new Error('Failed to capture order'));
    });
});