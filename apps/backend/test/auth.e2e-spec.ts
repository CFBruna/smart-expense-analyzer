import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

describe('Auth E2E Tests', () => {
  let app: INestApplication;
  let connection: Connection;

  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'Test123!@#',
    name: 'Test User',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    connection = moduleFixture.get<Connection>(getConnectionToken());
  });

  afterAll(async () => {
    await connection.collection('users').deleteMany({
      email: { $regex: /^test-.*@example\.com$/ },
    });
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe(testUser.email);
          expect(res.body.name).toBe(testUser.name);
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).not.toHaveProperty('passwordHash');
        });
    });

    it('should fail to register with duplicate email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toContain('already exists');
        });
    });

    it('should fail with invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Test123!@#',
          name: 'Test',
        })
        .expect(400);
    });

    it('should fail with short password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'new@example.com',
          password: 'short',
          name: 'Test',
        })
        .expect(400);
    });

    it('should fail with missing name', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'new@example.com',
          password: 'Test123!@#',
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully with correct credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('userId');
          expect(res.body).toHaveProperty('email');
          expect(res.body.email).toBe(testUser.email);
          expect(typeof res.body.accessToken).toBe('string');
        });
    });

    it('should fail login with wrong password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid credentials');
        });
    });

    it('should fail login with non-existent user', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test123!@#',
        })
        .expect(401);
    });

    it('should fail with invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'invalid-email',
          password: 'Test123!@#',
        })
        .expect(400);
    });
  });
});
