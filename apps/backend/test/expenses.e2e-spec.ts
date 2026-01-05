import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

describe('Expenses E2E Tests', () => {
  let app: INestApplication;
  let connection: Connection;
  let authToken: string;
  let userId: string;

  const testUser = {
    email: `expense-test-${Date.now()}@example.com`,
    password: 'Test123!@#',
    name: 'Expense Test User',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    connection = moduleFixture.get<Connection>(getConnectionToken());

    const registerRes = await request(app.getHttpServer()).post('/auth/register').send(testUser);
    userId = registerRes.body.id;

    const loginRes = await request(app.getHttpServer()).post('/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });
    authToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    if (connection) {
      await connection.collection('expenses').deleteMany({ userId });
      await connection.collection('users').deleteMany({
        email: { $regex: /^expense-test-.*@example\.com$/ },
      });
    }
    if (app) {
      await app.close();
    }
  });

  describe('POST /expenses', () => {
    it.skip('should create expense with AI categorization (skipped: external API)', () => {
      return request(app.getHttpServer())
        .post('/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Uber to dentist appointment',
          amount: 25.5,
          date: new Date().toISOString(),
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.description).toBe('Uber to dentist appointment');
          expect(res.body.amount).toBe(25.5);
          expect(res.body).toHaveProperty('category');
          expect(res.body.category).toHaveProperty('primary');
          expect(res.body.category).toHaveProperty('confidence');
          expect(res.body.category.confidence).toBeGreaterThan(0);
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
        });
    }, 30000);

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/expenses')
        .send({
          description: 'Test expense',
          amount: 10,
          date: new Date().toISOString(),
        })
        .expect(401);
    });

    it('should fail with invalid amount', () => {
      return request(app.getHttpServer())
        .post('/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Test expense',
          amount: -10,
          date: new Date().toISOString(),
        })
        .expect(400);
    });

    it('should fail with missing description', () => {
      return request(app.getHttpServer())
        .post('/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 10,
          date: new Date().toISOString(),
        })
        .expect(400);
    });

    it('should fail with invalid date format', () => {
      return request(app.getHttpServer())
        .post('/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Test expense',
          amount: 10,
          date: 'invalid-date',
        })
        .expect(400);
    });
  });

  describe('GET /expenses', () => {
    it('should list expenses with pagination', () => {
      return request(app.getHttpServer())
        .get('/expenses?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.meta).toHaveProperty('total');
          expect(res.body.meta).toHaveProperty('page');
          expect(res.body.meta).toHaveProperty('limit');
          expect(res.body.meta).toHaveProperty('totalPages');
          expect(res.body.meta.page).toBe(1);
          expect(res.body.meta.limit).toBe(10);
        });
    });

    it('should use default pagination values', () => {
      return request(app.getHttpServer())
        .get('/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.meta.page).toBe(1);
          expect(res.body.meta.limit).toBe(20);
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer()).get('/expenses').expect(401);
    });

    it('should only return user own expenses', async () => {
      const otherUser = {
        email: `other-${Date.now()}@example.com`,
        password: 'Test123!@#',
        name: 'Other User',
      };

      await request(app.getHttpServer()).post('/auth/register').send(otherUser);

      const loginRes = await request(app.getHttpServer()).post('/auth/login').send({
        email: otherUser.email,
        password: otherUser.password,
      });

      const otherToken = loginRes.body.accessToken;

      const res = await request(app.getHttpServer())
        .get('/expenses')
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(200);

      expect(res.body.meta.total).toBe(0);
    });
  });
});
