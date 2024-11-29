describe('Admin Routes', () => {
  describe('POST /register', () => {
    it('should register a new admin with valid data', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [] }) // Verificar si el admin existe
        .mockResolvedValueOnce({
          rows: [{ admin_id: 1, admin_email: newAdmin.admin_email }]
        }); // Insertar nuevo admin

      bcrypt.hash.mockResolvedValueOnce('hashedPassword');

      const response = await request(app)
        .post('/api/admin/register')
        .send(newAdmin);

      expect(response.status).toBe(201);
      expect(response.body.token).toBe('mockToken');
      expect(generateToken).toHaveBeenCalledWith(expect.objectContaining({ admin_id: 1, admin_email: newAdmin.admin_email }));
    });

    it('should return 400 if admin already exists', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ admin_email: newAdmin.admin_email }]
      });

      const response = await request(app).post('/api/admin/register').send(newAdmin);

      expect(response.status).toBe(400);
      expect(response.body.msg).toBe('El administrador ya existe');
    });

    it('should return 400 for invalid input', async () => {
      const invalidAdmin = { ...newAdmin, admin_email: 'invalid-email' };

      const response = await request(app)
        .post('/api/admin/register')
        .send(invalidAdmin);

      expect(response.status).toBe(400);
      expect(response.body.msg).toBe('Invalid input');
    });

    it('should return 500 on database error', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).post('/api/admin/register').send(newAdmin);

      expect(response.status).toBe(500);
      expect(response.body.msg).toBe('Error en el servidor');
    });
  });

  describe('POST /login', () => {
    it('should login admin with correct credentials', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ admin_email: newAdmin.admin_email, admin_password: 'hashedPassword' }]
      });
      bcrypt.compare.mockResolvedValueOnce(true);

      const response = await request(app)
        .post('/api/admin/login')
        .send({ admin_email: newAdmin.admin_email, admin_password: newAdmin.admin_password });

      expect(response.status).toBe(200);
      expect(response.body.token).toBe('mockToken');
    });

    it('should return 400 if credentials are invalid', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ admin_email: newAdmin.admin_email, admin_password: 'hashedPassword' }]
      });
      bcrypt.compare.mockResolvedValueOnce(false);

      const response = await request(app)
        .post('/api/admin/login')
        .send({ admin_email: newAdmin.admin_email, admin_password: 'wrongpassword' });

      expect(response.status).toBe(400);
      expect(response.body.msg).toBe('Credenciales inválidas');
    });
  });
});
