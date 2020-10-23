module.exports = {
    rules: {
        'header-max-length': [2, 'always', 72],
        'type-case': [2, 'always', ['lower-case']],
        'type-empty': [2, 'never'],
        'type-enum': [
            2,
            'always',
            [
                'feat',
                'fix',
                'docs',
                'style',
                'refactor',
                'test',
                'perf',
                'build',
                'conf',
                'chore',
                'revert',
            ],
        ],
        'scope-empty': [2, 'never'],
        'subject-empty': [2, 'never'],
    },
};
