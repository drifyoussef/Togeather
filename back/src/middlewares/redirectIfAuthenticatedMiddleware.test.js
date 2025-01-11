const redirectIfAuthenticatedMiddleware = require('./redirectIfAuthenticatedMiddleware');

describe('redirectIfAuthenticatedMiddleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            session: {}
        };
        res = {
            redirect: jest.fn()
        };
        next = jest.fn();
    });

    it('should redirect to home if user is authenticated', () => {
        req.session.userId = '12345';

        redirectIfAuthenticatedMiddleware(req, res, next);

        expect(res.redirect).toHaveBeenCalledWith('/');
        expect(next).not.toHaveBeenCalled();
    });

    it('should call next if user is not authenticated', () => {
        req.session.userId = null;

        redirectIfAuthenticatedMiddleware(req, res, next);

        expect(res.redirect).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
    });
});