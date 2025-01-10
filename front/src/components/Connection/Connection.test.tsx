import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Connection from './Connection';

describe('Connection Component', () => {
    it('should render without crashing', () => {
        render(
            <Router>
                <Connection />
            </Router>
        );
    });
});