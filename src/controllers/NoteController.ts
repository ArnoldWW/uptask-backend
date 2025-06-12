import type { Request, Response } from "express";
import Note, { INote } from "../models/Note";
import { Types } from "mongoose";

type NoteParams = {
  noteId: Types.ObjectId;
};

export class NoteController {
  // Method to create a new note in a task
  static createNote = async (req: Request<{}, {}, INote>, res: Response) => {
    const { content } = req.body;

    // Create a new note
    const note = new Note();
    note.content = content;
    note.createdBy = req.user.id;
    note.task = req.task.id;

    // Add the note to the task notes array
    req.task.notes.push(note.id);
    console.log(req.task);

    try {
      await Promise.allSettled([note.save(), req.task.save()]);
      res.send("Nota creada correctamente");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  // Method to get all notes of a task
  static getNotesOfTask = async (req: Request, res: Response) => {
    try {
      const notes = await Note.find({ task: req.task.id });
      res.send(notes);
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  // Method to delete a note
  static deleteNote = async (req: Request<NoteParams>, res: Response) => {
    try {
      const { noteId } = req.params;
      const note = await Note.findById(noteId);

      // Check if the note exists
      if (!note) {
        const error = new Error("Nota no encontrada");
        return res.status(404).json({ error: error.message });
      }

      // Check if the user is the creator of the note
      if (note.createdBy.toString() !== req.user.id.toString()) {
        const error = new Error("No autorizado");
        return res.status(403).json({ error: error.message });
      }

      // Remove the note from the task notes array
      req.task.notes = req.task.notes.filter((currentNote) => {
        return currentNote.toString() !== noteId.toString();
      });

      // Delete the note and update the task with the new notes array
      await Promise.allSettled([note.deleteOne(), req.task.save()]);
      res.send("Nota eliminada");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };
}
