const { expect } = require('chai');
const request = require('supertest');
const { Artist, Album, Song } = require('../src/models');
const app = require('../src/app');

describe('/songs', () => {
    let artist;
    let album;
    
    before(async () => {
        try {
            await Artist.sequelize.sync();
            await Album.sequelize.sync();
            await Song.sequelize.sync();
        } catch (err) {
            console.log(err);
        }
    });

    beforeEach(async () => {
        try {
            await Artist.destroy({ where: {} });
            await Album.destroy({ where: {} });
            await Song.destroy({ where: {} });

            artist = await Artist.create({
                name: 'Streetlight Manifesto',
                genre: 'Ska',
            });
            album = await Album.create({
                name: 'Everything Goes Numb',
                year: 2003,
                artistId: artist.id,
            });
        } catch (err) {
            console.log(err);
        }
    });

    describe('POST /artists/:artistId/albums/:albumId/songs', () => {
        it('creates a new song for a given artist and album', (done) => {
            request(app)
                .post(`/artists/${artist.id}/albums/${album.id}/songs`)
                .send({
                    name: 'Everything Went Numb',
                    year: album.year,
                }).then((res) => {
                    expect(res.status).to.equal(201);

                    Song.findByPk(res.body.id, { raw: true })
                        .then((song) => {
                            expect(song.name).to.equal('Everything Went Numb');
                            expect(song.year).to.equal(album.year);
                            expect(song.albumId).to.equal(album.id);
                            done();
                        }).catch(error => done(error));
                }).catch(error => done(error));
        });
        it('returns a 404 if the artist does not exist', (done) => {
            request(app)
                .post(`/artists/45246/albums/${album.id}/songs`)
                .send({
                    name: 'Everything Went Numb',
                    year: album.year,
                }).then((res) => {
                    expect(res.status).to.equal(404);
                    expect(res.body.error).to.equal('The artist could not be found.');

                    Song.findAll().then((songs) => {
                        expect(songs.length).to.equal(0);
                        done();
                    });
                }).catch(error => done(error));
        });
        it('returns a 404 if the album does not exist', (done) => {
            request(app)
                .post(`/artists/${artist.id}/albums/183540/songs`)
                .send({
                    name: 'Everything Went Numb',
                    year: album.year,
                }).then((res) => {
                    expect(res.status).to.equal(404);
                    expect(res.body.error).to.equal('The album could not be found.');
                    Song.findAll().then((songs) => {
                        expect(songs.length).to.equal(0);
                        done();
                    });
                }).catch(error => done(error));
        });
    });
    describe('with songs in the database', () => {
        let songs;
        beforeEach((done) => {
            Promise.all(
                Promise.all([
                    Song.create({
                        name: "Everything Went Numb",
                        year: album.year,
                        artistId: artist.id,
                        albumId: album.id,
                    }),
                    Song.create({
                        name: 'A Moment of Silence',
                        year: album.year,
                        artistId: artist.id,
                        albumId: album.id,
                    }),
                    Song.create({
                        name: 'We are the Few',
                        year: album.year,
                        artistId: artist.id,
                        albumId: album.id,
                    })
                ]).then((documents) => {
                    songs = documents;
                    done();
                })
            )
        });

        describe('GET /songs', () => {
            it('gets all song records', (done) => {
                request(app)
                    .get('/songs')
                    .then((res) => {
                        expect(res.status).to.equal(200);
                        expect(res.body.length).to.equal(3);
                        res.body.forEach((song) => {
                            const expected = songs.find((a) => a.id === song.id);
                            expect(song.name).to.equal(expected.name);
                            expect(song.year).to.equal(expected.year);
                        });
                        done();
                    }).catch(error => done(error));
            });
        });
        describe('Get /artists/:artistId/songs', () => {
            it('gets all songs for an artist by Id', (done) => {
                request(app)
                .get(`/artists/${artist.id}/songs`)
                .then((res) => {
                    expect(res.status).to.equal(200);
                    expect(res.body.length).to.equal(3);
                    res.body.forEach((song) => {
                        const expected = songs.find((a) => a.id === song.id);
                            expect(song.name).to.equal(expected.name);
                            expect(song.year).to.equal(expected.year);
                    });
                    done();
                }).catch(error => done(error));
            });
            it('returns a 404 if the artist does not exist', (done) => {
                request(app)
                    .get('/artists/185430/songs')
                    .then((res) => {
                        expect(res.status).to.equal(404);
                        expect(res.body.error).to.equal('The artist could not be found.');
                        done();
                    }).catch(error => done(error));
            });
        });
        describe('GET /albums/:albumId/songs', () => {
            it('gets all songs for an album by Id', (done) => {
                request(app)
                    .get(`/albums/${album.id}/songs`)
                    .then((res) => {
                        expect(res.status).to.equal(200);
                        expect(res.body.length).to.equal(3);
                        res.body.forEach((song) => {
                            const expected = songs.find((a) => a.id === song.id);
                            expect(song.name).to.equal(expected.name);
                            expect(song.year).to.equal(expected.year);
                        });
                        done();
                    }).catch(error => done(error));
            });
            it('returns a 404 if the album does not exist', (done) => {
                request(app)
                    .get('/albums/734589/songs')
                    .then((res) => {
                        expect(res.status).to.equal(404);
                        expect(res.body.error).to.equal('The album could not be found.');
                        done();
                    }).catch(error => done(error));
            });
        });
        describe('PATCH /songs/:songId', () => {
            it('updates song name via Id', (done) => {
                const song = songs[0];
                request(app)
                    .patch(`/songs/${song.id}`)
                    .send({ name: 'A Moment of Violence' })
                    .then((res) => {
                        expect(res.status).to.equal(200);
                        Song.findByPk(song.id, { raw: true }).then((updatedSong) => {
                            expect(updatedSong.name).to.equal('A Moment of Violence');
                            done();
                        });
                    }).catch(error => done(error));
            });
            it('returns a 404 if the song does not exist', (done) => {
                request(app)
                    .patch('/songs/09798')
                    .send({ name: 'The Void' })
                    .then((res) => {
                        expect(res.status).to.equal(404);
                        expect(res.body.error).to.equal('The song does not exist.');
                        done();
                    }).catch(error => done(error));
            });
        });

        describe('DELETE /songs/:songId', () => {
            it('deletes a song record by Id', (done) => {
                const song = songs[0];
                request(app)
                    .delete(`/songs/${song.id}`)
                    .then((res) => {
                        expect(res.status).to.equal(204);
                        Song.findByPk(song.id).then((updatedSong) => {
                            expect(updatedSong).to.equal(null);
                            done();
                        });
                    }).catch(error => done(error));
            });
            it('returns a 404 if the song does not exist', (done) => {
                request(app)
                    .delete('/songs/09798')
                    .then((res) => {
                        expect(res.status).to.equal(404);
                        expect(res.body.error).to.equal('The song does not exist.');
                        done();
                    }).catch(error => done(error));
            });
        });
    });
});