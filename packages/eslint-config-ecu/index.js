module.exports = {
  extends: 'dherault-typescript',
  rules: {
    'default-param-last': 'off',
    'react/no-unused-prop-types': 'warn',
    'react/jsx-closing-bracket-location': 'off', // To allow ecu-display-name and other JSX comments
  },
}
