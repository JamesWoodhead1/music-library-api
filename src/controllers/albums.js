const { Album, Artist } = require('../models');

exports.create = (req, res) => {
    const { artistId } = req.params;

    Artist.findByPk(artistId).then((artist) => {
        if (!artist) {
            res.status(404).json({ error: 'The artist could not be found.' });
        } else {
            Album.create({
                name: req.body.name,
                year: req.body.year,
            }).then((album) => {
                album.setArtist(artist).then((album) => {
                    res.status(201).json(album);
                });
            });
        }
    });
};

exports.listAlbums = (req, res) => {
    Album.findAll({
        include: [{
            model: Artist,
            as: 'artist',
        },],
    }).then((albums) => {
        res.status(200).json(albums);
    });
};

exports.getAlbumsByArtistId = (req, res) => {
    const { artistId } = req.params;
    Artist.findByPk(artistId).then((artist) => {
        if (!artist) {
            res.status(404).json({ error: 'The artist could not be found.' });
        } else {
            Album.findAll({
                where: { artistId: artistId },
                include: [{
                    model: Artist,
                    as: 'artist',
                }]
            })
            .then((albums) => {
                res.status(200).json(albums);
            });
        }
    });
};

exports.update = (req, res) => {
    const { albumId } = req.params;
    Album.update(req.body, { where: { id: albumId } }).then(([rowsUpdated]) => {
        if(!rowsUpdated) {
            res.status(404).json({ error: 'The album does not exist.' });
        } else {
            res.status(200).json([rowsUpdated]);
        }
    });
};

exports.deleteAlbum = (req, res) => {
    const { albumId } = req.params;
    Album.destroy({ where: { id: albumId } }).then((rowsDeleted) => {
        if (!rowsDeleted) {
            res.status(404).json({ error: 'The album does not exist.' });
        } else {
            res.status(204).json(rowsDeleted);
        }
    });
};