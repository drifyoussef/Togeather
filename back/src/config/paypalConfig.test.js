const paypal = require('paypal-rest-sdk');
const { paypalConfig } = require('./paypalConfig');

jest.mock('paypal-rest-sdk');

describe('paypalConfig', () => {
    beforeEach(() => {
        process.env.CLIENT_ID = 'test-client-id';
        process.env.APP_SECRET = 'test-app-secret';
    });

    it('should configure PayPal with the correct settings', () => {
        paypalConfig();

        expect(paypal.configure).toHaveBeenCalledWith({
            mode: 'sandbox',
            client_id: 'test-client-id',
            client_secret: 'test-app-secret'
        });
    });

    it('should throw an error if CLIENT_ID is not set', () => {
        delete process.env.CLIENT_ID;

    });

    it('should throw an error if APP_SECRET is not set', () => {
        delete process.env.APP_SECRET;

    });
});