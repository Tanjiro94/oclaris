import { parseLoginInput } from '../../modules/auth/validator/login.schema.js';

test('should throw if email is invalid', () => {
    expect(() => parseLoginInput({ email: 'invalid', password: 'password' })).toThrow('Email invalide');
});

test('should throw if password is too short', () => {
    expect(() => parseLoginInput({ email: 'valid@email.com', password: '' })).toThrow('Mot de passe requis');
});
