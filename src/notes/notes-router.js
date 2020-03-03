const path = require("path");
const express = require("express");
const NotesService = require("./notes-service");

const notesRouter = express.Router();
const jsonParser = express.json();

const serializeNote = note => ({
  id: parseInt(note.id),
  notename: note.name || note.notename,
  folderid: parseInt(note.folderid),
  content: note.content,
  modified: note.modified
});

notesRouter
  .route("/")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    NotesService.getAllNotes(knexInstance)
      .then(notes => {
        res.json(notes);
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { name, folderid, content, modified } = req.body;
    const newNote = { name, folderid, content, modified };
    for (const [key, value] of Object.entries(newNote)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing ${key} in request body` }
        });
      }
    }
    NotesService.insertNote(req.app.get("db"), serializeNote(newNote))
      .then(note => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${note.id}`))
          .json(serializeNote(note));
      })
      .catch(next);
  });

notesRouter
  .route("/:note_id")
  .get((req, res, next) => {
    NotesService.getById(req.app.get("db"), req.params.note_id)
      .then(note => {
        if (!note) {
          return res.status(404).json({
            error: { message: "article doesn't exist" }
          });
        }
        res.json(note);
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeNote(res.note));
  })
  .delete((req, res, next) => {
    NotesService.deleteNote(req.app.get("db"), req.params.note_id)
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { name, folderid, content } = req.body;
    const noteToUpdate = { name, folderid, content };
    const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain either title, style, or content`
        }
      });
    NotesService.updateNote(
      req.app
        .get("db", req.params.id, noteToUpdate)
        .then(numRowsAffected => {
          res.status(204).end();
        })
        .catch(next)
    );
  });

module.exports = notesRouter;
