import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { UserRole } from '../src/users/schemas/user.schema';
import { EventStatus } from '../src/events/schemas/event.schema';
import { ReservationStatus } from '../src/reservations/schemas/reservation.schema';

type App = Parameters<typeof request>[0];

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
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

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
      throw new Error(
        'DANGER! Trying to run tests on PRODUCTION/DEV database. Aborting to save data.',
      );
    }
  });

  // Cleanup Database once before all tests
  beforeAll(async () => {
    await connection.collection('users').deleteMany({});
    await connection.collection('events').deleteMany({});
    await connection.collection('reservations').deleteMany({});
  });

  // Cleanup data created during tests
  afterAll(async () => {
    if (eventId) {
      await connection
        .collection('events')
        .deleteOne({ _id: eventId as unknown as object });
    }
    await connection
      .collection('users')
      .deleteMany({ email: { $in: ['admin@e2e.com', 'user@e2e.com'] } });
    await connection.collection('reservations').deleteMany({});

    await app.close();
  });

  // Admin registration
  it('/auth/register (POST) - Register Admin', async () => {
    await request(app.getHttpServer() as App)
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
    const res = await request(app.getHttpServer() as App)
      .post('/auth/login')
      .send({ email: 'admin@e2e.com', password: 'password123' })
      .expect(200);

    const body = res.body as {
      success: boolean;
      data: { access_token: string };
    };
    adminToken = body.data.access_token;
    expect(adminToken).toBeDefined();
  });

  // Participant registration
  it('/auth/register (POST) - Register Participant', async () => {
    await request(app.getHttpServer() as App)
      .post('/auth/register')
      .send({
        fullName: 'Participant E2E',
        email: 'user@e2e.com',
        password: 'password123',
        role: UserRole.PARTICIPANT,
      })
      .expect(201);
  });

  // Participant login
  it('/auth/login (POST) - Login Participant', async () => {
    const res = await request(app.getHttpServer() as App)
      .post('/auth/login')
      .send({ email: 'user@e2e.com', password: 'password123' })
      .expect(200);

    const body = res.body as {
      success: boolean;
      data: { access_token: string };
    };
    participantToken = body.data.access_token;
  });

  // Event Management (admin)
  it('/events (POST) - Admin creates PUBLISHED event', async () => {
    const res = await request(app.getHttpServer() as App)
      .post('/events')
      .set('Authorization', `Bearer ${adminToken}`) // Admin Token
      .send({
        imageUrl:
          'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
        title: 'E2E Tech Conference',
        description: 'End to End testing event',
        date: new Date().toISOString(),
        location: 'Casablanca',
        totalCapacity: 50,
        status: EventStatus.PUBLISHED,
      })
      .expect(201);

    const body = res.body as { success: boolean; data: { _id: string } };
    eventId = body.data._id;
    expect(eventId).toBeDefined();
  });

  // Event Discovery (participant)
  it('/events (GET) - Participant sees the event', async () => {
    const res = await request(app.getHttpServer() as App)
      .get('/events') // Public endpoint
      .expect(200);

    const body = res.body as { success: boolean; data: unknown[] };
    const events = body.data;
    const createdEvent = events.find(
      (e: unknown) => (e as { _id: string })._id === eventId,
    ) as { _id: string; title: string } | undefined;
    expect(createdEvent).toBeDefined();
    expect(createdEvent?.title).toBe('E2E Tech Conference');
  });

  // Reservation (participant)
  it('/reservations (POST) - Participant books a spot', async () => {
    const res = await request(app.getHttpServer() as App)
      .post('/reservations')
      .set('Authorization', `Bearer ${participantToken}`) // User Token
      .send({ eventId: eventId })
      .expect(201);

    const body = res.body as {
      success: boolean;
      data: { _id: string; status: string };
    };
    reservationId = body.data._id;
    expect(body.data.status).toBe(ReservationStatus.PENDING);
  });

  it('/reservations (POST) - Block Double Booking', async () => {
    await request(app.getHttpServer() as App)
      .post('/reservations')
      .set('Authorization', `Bearer ${participantToken}`)
      .send({ eventId: eventId })
      .expect(409); // Conflict Exception
  });

  // Reservation Management (admin)
  it('/reservations/:id/status (PATCH) - Admin confirms reservation', async () => {
    const res = await request(app.getHttpServer() as App)
      .patch(`/reservations/${reservationId}/status`)
      .set('Authorization', `Bearer ${adminToken}`) // Admin Token
      .send({ status: ReservationStatus.CONFIRMED })
      .expect(200);

    const body = res.body as { success: boolean; data: { status: string } };
    expect(body.data.status).toBe(ReservationStatus.CONFIRMED);
  });

  // Verification (participant)
  it('/reservations/my (GET) - Participant sees confirmed status', async () => {
    const res = await request(app.getHttpServer() as App)
      .get('/reservations/my')
      .set('Authorization', `Bearer ${participantToken}`)
      .expect(200);

    const body = res.body as { success: boolean; data: unknown[] };
    const reservations = body.data;
    const myRes = reservations.find(
      (r: unknown) => (r as { _id: string })._id === reservationId,
    ) as { _id: string; status: string } | undefined;
    expect(myRes?.status).toBe(ReservationStatus.CONFIRMED);
  });
});
