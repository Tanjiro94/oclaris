

export const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
};

export const formatDateToShort = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
    });
};