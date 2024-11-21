import Note from "../models/Note.js";


import pdfMake from "pdfmake/build/pdfmake.js";
import pdfFonts from "pdfmake/build/vfs_fonts.js";
// Render the new note form
export const renderNoteForm = (req, res) => res.render("notes/new-note");
pdfMake.vfs = pdfFonts.pdfMake.vfs;
// Create a new note
export const createNewNote = async (req, res) => {
  const { title, description } = req.body;
  const errors = [];

  // Validate title and description
  if (!title) {
    errors.push({ text: "Please Write a Title." });
  }
  if (!description) {
    errors.push({ text: "Please Write a Description." });
  }

  if (errors.length > 0) {
    return res.render("notes/new-note", {
      errors,
      title,
      description,
    });
  }

  try {
    // Create and save the new note
    const newNote = new Note({
      title,
      description,
      user: req.user.id, // Associate the note with the logged-in user
    });
    await newNote.save();

    // Send a success message
    req.flash("success_msg", "Note Added Successfully");
    res.redirect("/notes");
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "There was an error while saving the note.");
    res.redirect("/notes");
  }
};

// Render all notes of the logged-in user
export const renderNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id })
      .sort({ date: "desc" })
      .lean();
    res.render("notes/all-notes", { notes });
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "There was an error retrieving your notes.");
    res.redirect("/notes");
  }
};

// Render the edit form for a note
export const renderEditForm = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).lean();

    // Check if the note belongs to the current user
    if (note.user != req.user.id) {
      req.flash("error_msg", "Not Authorized");
      return res.redirect("/notes");
    }

    res.render("notes/edit-note", { note });
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "There was an error loading the note for editing.");
    res.redirect("/notes");
  }
};

// Update an existing note
export const updateNote = async (req, res) => {
  const { title, description } = req.body;
  try {
    await Note.findByIdAndUpdate(req.params.id, { title, description });
    req.flash("success_msg", "Note Updated Successfully");
    res.redirect("/notes");
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "There was an error updating the note.");
    res.redirect("/notes");
  }
};

// Delete a note
export const deleteNote = async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    req.flash("success_msg", "Note Deleted Successfully");
    res.redirect("/notes");
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "There was an error deleting the note.");
    res.redirect("/notes");
  }
};

export const generateNotesPDF = async (req, res) => {
    try {
      // Obtén las notas del usuario actual
      const notes = await Note.find({ user: req.user.id }).lean();
  
      console.log("Notas obtenidas:", notes); // Verifica que se están obteniendo las notas
  
      if (!notes || notes.length === 0) {
        req.flash("error_msg", "No notes found to generate a PDF.");
        return res.redirect("/notes");
      }
  
      // Definir el contenido del PDF
      const docDefinition = {
        content: [
          { text: "Your Notes", style: "header" },
          ...notes.map((note) => ({
            text: `${note.title}\nDescription:${note.description}\n\n`, // Muestra título y descripción
            style: "note",
          })),
        ],
        styles: {
          header: { fontSize: 18, bold: true, marginBottom: 10 },
          note: { fontSize: 12, marginBottom: 5 },
        },
      };
   console.log("Documento generado:", docDefinition); 
      // Generar el PDF
      const pdfDoc = pdfMake.createPdf(docDefinition);

      // Usar getBase64() para generar la respuesta como base64
    pdfDoc.getBase64((data) => {
        const buffer = Buffer.from(data, 'base64');  // Convertir base64 a buffer
  
        // Configurar los encabezados para la descarga
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=notes.pdf');
        res.send(buffer);  // Enviar el archivo PDF al cliente
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      req.flash('error_msg', 'There was an error generating the PDF.');
      res.redirect('/notes');
    }
  };
  
      /*
      // Enviar el PDF como archivo descargable
      pdfDoc.getBuffer((buffer) => {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=notes.pdf");
        res.send(buffer);
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      req.flash("error_msg", "There was an error generating the PDF.");
      res.redirect("/notes");
    }
  };
  */