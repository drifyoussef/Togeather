import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import ConfirmEmail from './ConfirmEmail';
import fetchMock from 'jest-fetch-mock';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn(),
    useNavigate: jest.fn(),
}));

jest.mock('sweetalert2', () => ({
    fire: jest.fn(),
}));

describe('ConfirmEmail Component', () => {
    const mockUseLocation = useLocation as jest.Mock;
    const mockNavigate = jest.fn();

    beforeEach(() => {
        localStorage.clear();
        fetchMock.resetMocks();
        mockUseLocation.mockReturnValue({
            search: '?token=fake-token',
        });
        jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => mockNavigate);
    });

    it('should log error if no token is found in the URL', () => {
        mockUseLocation.mockReturnValueOnce({
            search: '',
        });

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        render(
            <Router>
                <ConfirmEmail data={{ message: '' }} />
            </Router>
        );

        expect(consoleErrorSpy).toHaveBeenCalledWith('No token found in the URL');
        consoleErrorSpy.mockRestore();
    });
});