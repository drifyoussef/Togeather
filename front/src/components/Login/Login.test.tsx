import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Login from './Login';

jest.mock('sweetalert2', () => ({
    fire: jest.fn(),
}));

describe('Login Component', () => {

    it('should render without crashing', () => {
        render(
            <Router>
                <Login />
            </Router>
        );
    });
});
