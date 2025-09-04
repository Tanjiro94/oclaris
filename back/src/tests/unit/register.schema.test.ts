import { parseRegisterInput } from '../../modules/auth/validator/register.schema.js';

test('should throw if email is invalid', () => {
    expect(() => parseRegisterInput({ email: 'invalid', password: 'password', passwordConfirm: 'password', username: 'username' })).toThrow('Email invalide');
});

test('should throw if password is too short', () => {
    expect(() => parseRegisterInput({ email: 'valid@email.com', password: 'invalid', passwordConfirm: 'invalid', username: 'username' })).toThrow('Mot de passe trop court');
});

test('should throw if password is not strong enough', () => {
    expect(() => parseRegisterInput({ email: 'valid@email.com', password: 'invalid94', passwordConfirm: 'invalid94', username: 'username' })).toThrow('Mot de passe doit contenir au moins une lettre majuscule, Mot de passe doit contenir au moins un chiffre, Mot de passe doit contenir au moins un caractère spécial');
});

test('should throw if passwordConfirm is invalid', () => {
    expect(() => parseRegisterInput({ email: 'valid@email.com', password: 'password', passwordConfirm: 'invalid', username: 'username' })).toThrow('Les mots de passe ne correspondent pas');
});

test('should throw if username is invalid', () => {
    expect(() => parseRegisterInput({ email: 'valid@email.com', password: 'password', passwordConfirm: 'password', username: 'inva' })).toThrow('Nom d\'utilisateur trop court');
});

test('should throw if password and passwordConfirm do not match', () => {
    expect(() => parseRegisterInput({ email: 'valid@email.com', password: 'password', passwordConfirm: 'password2', username: 'username' })).toThrow('Les mots de passe ne correspondent pas');
});