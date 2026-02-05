import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { UserRole } from '../src/users/schemas/user.schema';
import { EventStatus } from '../src/events/schemas/event.schema';
import { ReservationStatus } from '../src/reservations/schemas/reservation.schema';

describe('EventFlow E2E Scenario', () => {
  let app: INestApplication;
  let connection: Connection;

  // Data Holders
  let adminToken: string;
  let participantToken: string;
  let eventId: string;
  let reservationId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply same pipes as main.ts
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true
    }));

    await app.init();

    // Get DB Connection to clean it before tests
    connection = app.get(getConnectionToken());

    // Safety Check to prevent running tests on production/dev database
    if (!connection.db) {
      throw new Error('Database connection not established');
    }

    const dbName = connection.db.databaseName;
    console.log(`Running E2E Tests on DB: ${dbName}`);

    if (dbName === 'eventflow') {
      throw new Error('DANGER! Trying to run tests on PRODUCTION/DEV database. Aborting to save data.');
    }
  });

  // Cleanup Database before each test to ensure isolation
  beforeEach(async () => {
    await connection.collection('users').deleteMany({});
    await connection.collection('events').deleteMany({});
    await connection.collection('reservations').deleteMany({});
  });

  // Cleanup data created during tests
  afterAll(async () => {
    if (eventId) await connection.collection('events').deleteOne({ _id: Object(eventId) });
    await connection.collection('users').deleteMany({ email: { $in: ['admin@e2e.com', 'user@e2e.com'] } });
    await connection.collection('reservations').deleteMany({});

    await app.close();
  });

  // Admin registration
  it('/auth/register (POST) - Register Admin', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        fullName: 'Admin E2E',
        email: 'admin@e2e.com',
        password: 'password123',
        role: UserRole.ADMIN, // Force Admin Role
      })
      .expect(201);
  });

  // Admin login
  it('/auth/login (POST) - Login Admin & Get Token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@e2e.com', password: 'password123' })
      .expect(200);

    adminToken = res.body.access_token;
    expect(adminToken).toBeDefined();
  });

  // Participant registration
  it('/auth/register (POST) - Register Participant', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        fullName: 'Participant E2E',
        email: 'user@e2e.com',
        password: 'password123',
        // Role default is Participant
      })
      .expect(201);
  });

  // Participant login
  it('/auth/login (POST) - Login Participant', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@e2e.com', password: 'password123' })
      .expect(200);

    participantToken = res.body.access_token;
  });

  // Event Management (admin)
  it('/events (POST) - Admin creates PUBLISHED event', async () => {
    const res = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${adminToken}`) // Admin Token
      .send({
        title: 'E2E Tech Conference',
        description: 'End to End testing event',
        date: new Date().toISOString(),
        location: 'Casablanca',
        totalCapacity: 50,
        status: EventStatus.PUBLISHED,
      })
      .expect(201);

    eventId = res.body._id;
    expect(eventId).toBeDefined();
  });

  // Event Discovery (participant)
  it('/events (GET) - Participant sees the event', async () => {
    const res = await request(app.getHttpServer())
      .get('/events') // Public endpoint
      .expect(200);

    const createdEvent = res.body.find((e) => e._id === eventId);
    expect(createdEvent).toBeDefined();
    expect(createdEvent.title).toBe('E2E Tech Conference');
  });

  // Reservation (participant)
  it('/reservations (POST) - Participant books a spot', async () => {
    const res = await request(app.getHttpServer())
      .post('/reservations')
      .set('Authorization', `Bearer ${participantToken}`) // User Token
      .send({ eventId: eventId })
      .expect(201);

    reservationId = res.body._id;
    expect(res.body.status).toBe(ReservationStatus.PENDING);
  });

  it('/reservations (POST) - Block Double Booking', async () => {
    await request(app.getHttpServer())
      .post('/reservations')
      .set('Authorization', `Bearer ${participantToken}`)
      .send({ eventId: eventId })
      .expect(409); // Conflict Exception
  });

  // Reservation Management (admin)
  it('/reservations/:id/status (PATCH) - Admin confirms reservation', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/reservations/${reservationId}/status`)
      .set('Authorization', `Bearer ${adminToken}`) // Admin Token
      .send({ status: ReservationStatus.CONFIRMED })
      .expect(200);

    expect(res.body.status).toBe(ReservationStatus.CONFIRMED);
  });

  // Verification (participant)
  it('/reservations/my (GET) - Participant sees confirmed status', async () => {
    const res = await request(app.getHttpServer())
      .get('/reservations/my')
      .set('Authorization', `Bearer ${participantToken}`)
      .expect(200);

    const myRes = res.body.find((r) => r._id === reservationId);
    expect(myRes.status).toBe(ReservationStatus.CONFIRMED);
  });
});