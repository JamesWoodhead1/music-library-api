const express = require('express');

const artistControllers = require('./controllers/artists');
const albumControllers = require('./controllers/albums');
const songControllers = require('./controllers/songs');

const app = express();

app.use(express.json());

app.post('/artists', artistControllers.create);

app.get('/artists', artistControllers.list);

app.get('/artists/:artistId', artistControllers.getArtistById);

app.patch('/artists/:id', artistControllers.update);

app.delete('/artists/:artistId', artistControllers.deleteArtist);


app.post('/artists/:artistId/albums', albumControllers.create);

app.get('/albums', albumControllers.listAlbums);

app.get('/artists/:artistId/albums', albumControllers.getAlbumsByArtistId);

app.patch('/albums/:albumId', albumControllers.update);

app.delete('/albums/:albumId', albumControllers.deleteAlbum);


app.post('/artists/:artistId/albums/:albumId/songs', songControllers.create);

app.get('/songs', songControllers.list);

app.get('/artists/:artistId/songs', songControllers.getSongsByArtistId);

app.get('/albums/:albumId/songs', songControllers.getSongsByAlbumId);

app.patch('/songs/:songId', songControllers.update);

app.delete('/songs/:songId', songControllers.deleteSong);

module.exports = app;