module.exports = {
    globals: {
        'ts-jest': {
            tsConfig: 'tsconfig.json'
        }
    },
    preset: 'ts-jest',
    roots: ['<rootDir>/src'],
    testEnvironment: 'node'
}