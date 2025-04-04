/**
 * Main Application script for the Note Management System
 * Handles event listeners and manage the communication between UI and API
 *
 * @file index.js
 * @requires './components/make-note.js'
 * @requires './components/note-item.js'
 * @requires './components/active-note.js'
 * @requires './components/archive-note.js'
 * @requires './style/global.css'
 * @requires './data/noteApi.js'
 * @requires './helper/helperLoading.js'
 */

import "./components/make-note.js";
import "./components/note-item.js";
import "./components/active-note.js";
import "./components/archive-note.js";
import "./style/global.css";
import NoteApi from "./data/noteApi.js";
import HelperLoading from "./helper/helperLoading.js";

/**
 * Event handler for note creation
 * Handles the UI state and API communication when a new note is created
 *
 * @listens CustomEvent#note-created
 * @fires CustomEvent#note-updated - Notifies component to refresh their data
 * @fires CustomEvent#notes-update-complete - Signifies completion of the update process
 */
document.addEventListener("note-created", async (event) => {
  const { title, body, button } = event.detail;
  const request = { title, body };
  HelperLoading.showLoading(button);
  handleNoteOperation(request, NoteApi.createNote, button);
});

/**
 * Event handler for note deletion
 *
 * @listens CustomEvent#note-deleted
 */
document.addEventListener("note-deleted", (event) => {
  const { id, button } = event.detail;
  HelperLoading.showLoading(button);
  handleNoteOperation(id, NoteApi.deleteNote, button);
});

/**
 * Event handler for note archiving
 *
 * @listens CustomEvent#note-archived
 */
document.addEventListener("note-archived", (event) => {
  const { id, button } = event.detail;
  HelperLoading.showLoading(button);
  handleNoteOperation(id, NoteApi.archiveNote, button);
});

/**
 * Event handler for note unarchiving
 *
 * @listens CustomEvent#note-unarchived
 */
document.addEventListener("note-unarchived", (event) => {
  const { id, button } = event.detail;
  HelperLoading.showLoading(button);
  handleNoteOperation(id, NoteApi.unarchiveNote, button);
});

/**
 * Generic handler for note operations (create, delete, archive, unarchive)
 * Applies the operations and updates UI when complete
 *
 * @param { Object|string|number } noteData - Note object or ID depending on operation
 * @param { Function } operation - The API operation to perform
 * @param { HTMLElement } button - Button element to update loading state
 * @returns { Promise<void> }
 */
async function handleNoteOperation(noteData, operation, button) {
  try {
    await operation.call(NoteApi, noteData);
    await notifyAndWaitForUpdate(button);

    if (button) {
      // Reset button text based on operation
      const buttonText = getButttonTextForOperation(operation);
      HelperLoading.hideLoading(button, buttonText);
    }
  } catch (error) {
    alert(error.message);
    if (button) {
      const buttonText = getButttonTextForOperation(operation);
      HelperLoading.hideLoading(button, buttonText);
    }
  }
}

/**
 * Determines the appropriate button text based on the operation
 *
 * @param { Function } operation - The API operation
 * @returns { string } Text to display on the button
 */
function getButttonTextForOperation(operation) {
  if (operation === NoteApi.createNote) return "Make Note";
  if (operation === NoteApi.deleteNote) return "Delete";
  if (operation === NoteApi.archiveNote) return "Archive";
  if (operation === NoteApi.archiveNote) return "Unarchive";
  return "Submit";
}

/**
 * Notifies components of data changes and waits for updates to complete
 *
 * @param { HTMLElement } [button] - Optional button reference to include in event detail
 * @returns { Promise<void> } - Resolve when update is complete
 * @fires CustomEvent#notes-updated - Triggers components to refresh their data
 * @listens CustomEvent#notes-update-complete - Waits for this event to resolve their promise
 */
function notifyAndWaitForUpdate(button) {
  return new Promise((resolve) => {
    const onceListener = async () => {
      document.removeEventListener("notes-update-complete", onceListener);
      resolve();
    };

    document.addEventListener("notes-update-complete", onceListener, { once: true });

    document.dispatchEvent(
      new CustomEvent("notes-updated", {
        bubbles: true,
        composed: true,
        detail: { button },
      }),
    );
  });
}
