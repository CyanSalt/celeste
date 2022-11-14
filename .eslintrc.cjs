module.exports = {
  root: true,
  extends: [
    '@cyansalt/preset',
  ],
  rules: {
    'vue/no-setup-props-destructure': 'off',
    'vue/no-undef-components': 'error',
    'vue/no-undef-properties': 'error',
  },
}
