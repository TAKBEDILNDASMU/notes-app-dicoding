/**
 * @class NoteItem
 * @extends HTMLElement
 * @description Custom element that displays a single note with title, content, date and action buttons.
 * Provides functionality for deleting and archiving/unarchiving notes.
 * Uses Shadow DOM for encapsulation and global styles for consistent appearance.
 */
import globalStyles from "../globalStylesheet.js";

class noteitem extends HTMLElement {
  /**
   * Initialize the component with shadow DOM, global styles, and property defaults
   */
  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [globalStyles];
    this._deletebutton = null;
    this._archivebutton = null;
    this._unarchivebutton = null;
    this._style = document.createElement("style");

    this._id = "";
    this._title = "";
    this._date = "";
    this._content = "";
    this._archive = "";
    this._unarchive = "";

    this.handleDelete = this.handleDelete.bind(this);
    this.handleArchive = this.handleArchive.bind(this);
    this.handleUnarchive = this.handleUnarchive.bind(this);
  }

  /**
   * List of attributes that trigger callback when changed
   * @returns {string[]} Array of attribute names to observe
   */
  static get observedAttributes() {
    return ["data-id", "title", "date", "content", "archive"];
  }

  /**
   * Gets CSS styles for the component
   * @returns {string} CSS styles as a string
   */
  getStyles() {
    const styles = `
    :host {
      position: relative;
      display: block;
      width: 100%;
      padding: 10px !important;
      border: 1px solid var(--white-alpha-low);
      border-radius: 4px;
      background-color: var(--dark);
      color: var(--white);
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

    .note-date {
      position: absolute;
      top: 10px;
      right: 10px;
      font-size: 12px;
      color: var(--white-alpha-low);
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
      display: inline-flex;
      flex: 1;
      justify-content: center;
      gap: 5px;
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

    /* disabled button styles */
    button:disabled,
    button[disabled] {
      background-color: #cccccc;
      border-color: #bbbbbb;
      color: #888888;
      cursor: not-allowed;
      opacity: 0.7;
    }

    /* prevent hover effects on disabled buttons */
    button:disabled:hover,
    button[disabled]:hover {
      background-color: #cccccc;
      border-color: #bbbbbb;
      color: #888888;
    }

    .archive {
      background-color: var(--primary);
      color: var(--white);
    }

    .archive:hover {
      background-color: var(--dark);
      color: var(--primary);
    }

    .loading-spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-color: rgba(0,0,0,0.2);
      border-top-color: #333;
      animation: spin 0.8s linear infinite;
      vertical-align: middle;
      margin-right: 5px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

  `;

    this._style.textContent = styles;
  }

  /**
   * Component lifecycle method that runs when the element is added to the DOM
   * Renders the component and attaches event listeners
   */
  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  /**
   * Component lifecycle method that runs when the element is removed from the DOM
   * Removes event listeners to prevent memory leaks
   */
  disconnectedCallback() {
    this.removeEventListeners();
  }

  /**
   * Callback that fires when an observed attribute changes
   * @param {string} name - Name of the attribute that changed
   * @param {string} oldValue - Previous value of the attribute
   * @param {string} newValue - New value of the attribute
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case "data-id":
        this._id = newValue;
        break;
      case "title":
        this._title = newValue;
        break;
      case "date":
        this._date = this.formatDate(newValue);
        break;
      case "archive":
        this._archive = newValue;
        break;
      case "content":
        this._content = newValue;
        break;
    }

    this.render();
  }

  /**
   * Sets up event listeners for action buttons
   */
  setupEventListeners() {
    const deleteButton = this.shadowRoot.querySelector("#delete");
    const archiveButton = this.shadowRoot.querySelector("#archive");
    const unarchiveButton = this.shadowRoot.querySelector("#unarchive");

    if (deleteButton) {
      deleteButton.addEventListener("click", this.handleDelete);
    }

    if (archiveButton) {
      archiveButton.addEventListener("click", this.handleArchive);
    }

    if (unarchiveButton) {
      unarchiveButton.addEventListener("click", this.handleUnarchive);
    }
  }

  /**
   * Removes event listeners from action buttons
   */
  removeEventListeners() {
    const deleteButton = this.shadowRoot.querySelector("#delete");
    const archiveButton = this.shadowRoot.querySelector("#archive");
    const unarchiveButton = this.shadowRoot.querySelector("#unarchive");

    if (deleteButton) {
      deleteButton.removeEventListener("click", this.handleDelete);
    }

    if (archiveButton) {
      archiveButton.removeEventListener("click", this.handleArchive);
    }

    if (unarchiveButton) {
      unarchiveButton.removeEventListener("click", this.handleUnarchive);
    }
  }

  /**
   * Formats a date string into a localized version
   * @param {string} dateString - The date string to format
   * @returns {string} Formatted date string
   */
  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  /**
   * Event handler for the delete button
   */
  handleDelete() {
    const deletedNoteEvent = new CustomEvent("note-deleted", {
      bubbles: true,
      composed: true,
      detail: {
        id: this._id,
        button: this.shadowRoot.querySelector("#delete"),
      },
    });

    this.dispatchEvent(deletedNoteEvent);
  }

  /**
   * Event handler for the archive button
   */
  handleArchive() {
    console.log(this.shadowRoot);
    const archivedNoteEvent = new CustomEvent("note-archived", {
      bubbles: true,
      composed: true,
      detail: {
        id: this._id,
        button: this.shadowRoot.querySelector("#archive"),
      },
    });

    this.dispatchEvent(archivedNoteEvent);
  }

  /**
   * Event handler for the unarchive button
   */
  handleUnarchive() {
    const unarchivedNoteEvent = new CustomEvent("note-unarchived", {
      bubbles: true,
      composed: true,
      detail: {
        id: this._id,
        button: this.shadowRoot.querySelector("#unarchive"),
      },
    });

    this.dispatchEvent(unarchivedNoteEvent);
  }

  /**
   * Formats note content by replacing newlines with <br> tags
   * @param {string} content - The raw content text
   * @returns {string} HTML formatted content
   */
  formatContent(content) {
    return content.replace(/\n/g, "<br>");
  }

  /**
   * Renders the note with all its content and action buttons
   */
  render() {
    // replace newlines with <br> tags
    const formattedContent = this._content.replace(/\n/g, "<br>");
    this.getStyles();

    this.shadowRoot.innerHTML = `
      ${this._style.outerHTML}
      <div class="note-body">
        <h3>${this._title}</h3>
        <span class="note-date">${this._date}</span>
        <p>${formattedContent}</p>
      </div>
      <div class="note-action">
        <button id="delete" class="delete">
          Delete
        </button>
        <button id="${this._archive === "true" ? "unarchive" : "archive"}" class="archive">
          ${this._archive === "true" ? "Unarchive" : "Archive"}
        </button>
      </div>
    `;
  }

  // Getter and setter for id
  get id() {
    return this._id;
  }

  set id(value) {
    this._id = value;
    this.setAttribute("data-id", value);
  }

  // Getter and setter for title
  get title() {
    return this._title;
  }

  set title(value) {
    this._title = value;
    this.setAttribute("title", value);
  }

  // Getter and setter for date
  get date() {
    return this._date;
  }

  set date(value) {
    this._date = this.formatDate(value);
    this.setAttribute("date", value);
  }

  // Getter and setter for content
  get content() {
    return this._content;
  }

  set content(value) {
    this._content = value;
    this.setAttribute("content", value);
  }

  // Getter and setter for archive
  get archive() {
    return this._archive;
  }

  set archive(value) {
    this._archive = value;
    this.setAttribute("archive", value);
  }
}

customElements.define("note-item", noteitem);
