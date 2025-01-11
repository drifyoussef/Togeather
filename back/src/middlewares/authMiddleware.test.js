process.env.SECRET_KEY = 'your-secret-key-in-hex-format';

const authMiddleware = require('./authMiddleware');

describe('authMiddleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {
                authorization: 'Bearer valid-token',
            },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
        next = jest.fn();
    });

    it('should return 401 if token is invalid', async () => {
        req.headers.authorization = 'Bearer invalid-token';

        await authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith('Unauthorized');
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if no token is provided', async () => {
        req.headers.authorization = null;

        await authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith('Unauthorized');
        expect(next).not.toHaveBeenCalled();
    });
});