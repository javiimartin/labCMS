module.exports = {
    transform: {
      '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    },
    transformIgnorePatterns: [
      'node_modules/(?!axios)', // Asegura que Jest transforme Axios y otras dependencias con sintaxis ESM
    ],
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Stub para archivos CSS
    },
  };
  