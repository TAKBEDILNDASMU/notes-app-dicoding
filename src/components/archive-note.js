/**
 * @class ArchiveNote
 * @extends HTMLElement
 * @description Custom element that displays archived notes.
 * Automatically updates when note data changes via the "notes-updated" event.
 * Uses Shadow DOM for encapsulation and global styles for consistent appearance.
 */
import NoteApi from "../data/noteApi.js";
import globalStyles from "../globalStylesheet.js";

class ArchiveNote extends HTMLElement {
  /**
   * Initialize the component with shadow DOM and global styles
   */
  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [globalStyles];
    this._notes = [];
    this._style = document.createElement("style");
  }

  /**
   * Gets CSS styles for the component
   * @returns {string} CSS styles as a string
   */
  getStyles() {
    const styles = `
    h2 {
      margin-top: 2rem;
      margin-bottom: 0;
      color: var(--light);
    }

    section {
      margin-top: 10px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 10px;
      width: 100%;
    }

    .note {
      position: relative;
      width: 100%;
      padding: 10px;
      border: 1px solid var(--white-alpha-low);
      border-radius: 4px;
      background-color: var(--dark);
      color: var(--white);
      box-shadow: var(--box-shadow);
      transition: .3s;
      overflow: hidden;
    }

    .note-body {
      min-height: 180px;
    }

    h3 {
      font-size: 16px;
      font-weight: 700;
      margin-top: 30px;
      margin-bottom: 10px;
    }

    p {
      font-size: 14px;
      font-weight: lighter;
      line-height: 1.4;
    }

    .note-action {
      display: flex;
      gap: 10px;
      justify-content: center;
      align-items: center;
      margin-top: 10px;
      border-top: 1px solid var(--dark-alpha-low);
      padding-top: 10px;
    }

    .delete,
    .archive {
      display: block;
      width: 100%;
      padding: 5px;
      font-size: 14px;
      border: 1px solid var(--primary);
      border-radius: 4px;
      cursor: pointer;
      transition: .3s;
    }

    .delete {
      background-color: var(--dark);
      color: var(--primary);
    }

    .delete:hover {
      background-color: var(--primary);
      color: var(--white);
    }

    .archive {
      background-color: var(--primary);
      color: var(--white);
    }

    .archive:hover {
      background-color: var(--dark);
      color: var(--primary);
    }

    .note-empty {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
      margin-top: 10px;
      width: 100%;
      text-align: center;
      font-size: 14px;
      color: var(--white-alpha-low);
      background-color: var(--dark);
      border: 1px solid var(--white-alpha-low);
      border-radius: 4px;
      padding: 10px;
    }

    .loading-spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-color: rgba(255,255,255,0.2);
      border-top-color: #fff;
      animation: spin 0.8s linear infinite;
      vertical-align: middle;
      margin-right: 5px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media screen and (min-width: 768px) {
      .note {
        width: calc(33.33% - 10px);
      }
    }
  `;

    this._style.textContent = styles;
  }

  /**
   * Component lifecycle method that runs when the element is added to the DOM
   * Fetches initial archived notes and sets up event listeners
   * @returns {Promise<void>}
   */
  async connectedCallback() {
    this.renderLoading();
    await this.fetchArchivedNotes();
    this.setupEventListeners();
  }

  /**
   * Sets up event listeners for the component
   */
  setupEventListeners() {
    document.addEventListener("notes-updated", this.handleNotesUpdated.bind(this));
  }

  /**
   * Event handler for when notes are updated elsewhere in the application
   * @returns {Promise<void>}
   */
  async handleNotesUpdated() {
    await this.fetchArchivedNotes();
  }

  /**
   * Fetches archived notes from the API and triggers a render
   * @returns {Promise<void>}
   */
  async fetchArchivedNotes() {
    try {
      this._notes = await NoteApi.getArchiveNote();
      this.render();
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Creates and renders note elements into the container
   * @param {HTMLElement} container - The DOM element to render notes into
   */
  renderNotes(container) {
    this._notes.forEach((note) => {
      const noteElement = document.createElement("note-item");
      noteElement.id = note.id;
      noteElement.title = note.title;
      noteElement.date = note.createdAt;
      noteElement.content = note.body;
      noteElement.archive = note.archived;
      container.appendChild(noteElement);
    });
  }

  renderLoading() {
    this.getStyles();

    this.shadowRoot.innerHTML = `
      ${this._style.outerHTML}
      <h2>Archive Note</h2>
      <div class="note-empty">
        <p>Loading</p>
        <span class="loading-spinner"></span>
      </div>
    `;
  }

  /**
   * Renders the component's HTML and populates it with archived notes
   */
  render() {
    this.getStyles();

    this.shadowRoot.innerHTML = `
      ${this._style.outerHTML}

      <h2>Archived Notes</h2>
      ${
        this._notes.length === 0
          ? `<div class="note-empty">
           <p>There is no note</p>
         </div>`
          : '<section id="notes-container"></section>'
      }
    `;

    if (this._notes.length > 0) {
      const container = this.shadowRoot.getElementById("notes-container");
      this.renderNotes(container);
    }
  }
}

customElements.define("archive-note", ArchiveNote);
