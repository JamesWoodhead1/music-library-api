const { expect } = require('chai');
const request = require('supertest');
const { Artist } = require('../src/models');
const app = require('../src/app');

describe('/artists', () => {

    before(async () => {
        try {
            await Artist.sequelize.sync();
        } catch (err) {
            console.log(err);
        }
    });

    beforeEach(async () => {
        try {
            await Artist.destroy({ where: {} });
        } catch (err) {
            console.log(err);
        }
    });
    describe('POST /artists', async () => {
        it('creates a new artist in the database', async () => {
            const response = await request(app).post('/artists').send({
                name: 'Streetlight Manifesto',
                genre: 'Ska',
            });
            await expect(response.status).to.equal(201);
            expect(response.body.name).to.equal('Streetlight Manifesto');

            const insertedArtistRecords = await Artist.findByPk(response.body.id, { raw: true });
            expect(insertedArtistRecords.name).to.equal('Streetlight Manifesto');
            expect(insertedArtistRecords.genre).to.equal('Ska');
        });
    });
    describe('with artists in the database', () => {
        let artists;
        beforeEach((done) => {
            Promise.all([
                Artist.create({ name: 'Streetlight Manifesto', genre: 'Ska' }),
                Artist.create({ name: 'The Skints', genre: 'Dub Reggae' }),
                Artist.create({ name: 'NOFX', genre: 'Punk' }),
            ]).then((documents) => {
                artists = documents;
                done();
            });
        });
        describe('GET /artists', () => {
            it('gets all artist records', (done) => {
                request(app).get('/artists').then((res) => {
                    expect(res.status).to.equal(200);
                    expect(res.body.length).to.equal(3);
                    res.body.forEach((artist) => {
                        const expected = artists.find((a) => a.id === artist.id);
                        expect(artist.name).to.equal(expected.name);
                        expect(artist.genre).to.equal(expected.genre);
                    });
                    done();
                }).catch(error => done(error));
            });
        });
        describe('GET /artists/:artistId', () => {
            it('gets artist record by Id', (done) => {
                const artist = artists[0];
                request(app)
                    .get(`/artists/${artist.id}`)
                    .then((res) => {
                        expect(res.status).to.equal(200);
                        expect(res.body.name).to.equal(artist.name);
                        expect(res.body.genre).to.equal(artist.genre);
                        done();
                }).catch(error => done(error));
            });
            it('returns a 404 if the artist does not exist', (done) => {
                request(app)
                    .get('/artists/12345')
                    .then((res) => {
                        expect(res.status).to.equal(404);
                        expect(res.body.error).to.equal('The artist could not be found.');
                        done();
                    });
            });
        });
        describe('PATCH /artists/:Id', () => {
            it('updates artist genre by id', (done) => {
                const artist = artists[0];
                request(app)
                    .patch(`/artists/${artist.id}`)
                    .send({ genre: 'Ska Punk' })
                    .then((res) => {
                        expect(res.status).to.equal(200);
                        Artist.findByPk(artist.id, { raw: true }).then((updatedArtist) => {
                            expect(updatedArtist.genre).to.equal('Ska Punk');
                            done();
                        });
                    }).catch(error => done(error));
            });
            it('updates artist name by id', (done) => {
                const artist = artists[0];
                request(app)
                    .patch(`/artists/${artist.id}`)
                    .send({ name: 'Less Than Jake' })
                    .then((res) => {
                        expect(res.status).to.equal(200);
                        Artist.findByPk(artist.id, { raw: true }).then((updatedArtist) => {
                            expect(updatedArtist.name).to.equal('Less Than Jake');
                            done();
                        });
                    }).catch(error => done(error));
            });
            it('returns a 404 if the artist does not exist', (done) => {
                request(app)
                    .patch('/artists/6789')
                    .send({ name: 'Reel Big Fish' })
                    .then((res) => {
                        expect(res.status).to.equal(404);
                        expect(res.body.error).to.equal('The artist could not be found.');
                        done();
                    });
            });
        });
    });
});