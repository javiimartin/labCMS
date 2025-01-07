export default {
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    // Agrega más métodos si los usas (put, delete, etc.)
  };
  