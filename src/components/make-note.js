/**
 * @class MakeNote
 * @extends HTMLElement
 * @description Custom element that provides a form for creating new notes.
 * Validates input fields and dispatches events when a note is created.
 * Uses Shadow DOM for encapsulation and global styles for consistent appearance.
 */
import globalStyles from "../globalStylesheet.js";

class MakeNote extends HTMLElement {
  /**
   * Initialize the component with shadow DOM, global styles, and validation constraints
   */
  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [globalStyles];
    this._style = document.createElement("style");
    this._maxTitleLength = 50;
    this._titleMinLength = 3;
    this._contentMinLength = 10;
  }

  /**
   * Gets CSS styles for the component
   * @returns {string} CSS styles as a string
   */
  getStyles() {
    const styles = `
    form {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 10px;
    }

    h2 {
      color: var(--light);
    }

    span {
      font-size: 14px;
      color: var(--white-alpha-low);
    }

    input,
    textarea {
      padding: 10px;
      border-radius: 4px;
      font-size: 14px;
      color: var(--white);
      background-color: var(--dark);
      border: 1px solid var(--white-alpha-low);
    }

    textarea {
      font-family: var(--primary-font);
      resize: none;
      min-height: 100px;
    }

    button {
      padding: 10px;
      border: 1px solid var(--primary);
      border-radius: 4px;
      font-size: 14px;
      background-color: var(--primary);
      color: var(--white);
      cursor: pointer;
      transition: .3s;
      display: flex;
      justify-content: center;
      gap: 5px;
    }

    button:hover {
      border: 1px solid var(--primary);
      background-color: var(--dark);
      color: var(--primary);
    }

    /* Disabled button styles */
    button:disabled,
    button[disabled] {
      background-color: #cccccc;
      border-color: #bbbbbb;
      color: #888888;
      cursor: not-allowed;
      opacity: 0.7;
    }

    /* Prevent hover effects on disabled buttons */
    button:disabled:hover,
    button[disabled]:hover {
      background-color: #cccccc;
      border-color: #bbbbbb;
      color: #888888;
    }

    p {
      color: #b91c1c;
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
   * Renders the form and sets up event listeners
   */
  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  /**
   * Sets up all event listeners for the form inputs and submission
   */
  setupEventListeners() {
    const form = this.shadowRoot.querySelector("form");
    const titleInput = this.shadowRoot.querySelector("input");
    const contentInput = this.shadowRoot.querySelector("textarea");
    const charCountSpan = this.shadowRoot.querySelector("span");
    const titleError = this.shadowRoot.querySelector("#titleError");
    const bodyError = this.shadowRoot.querySelector("#bodyError");
    const button = this.shadowRoot.querySelector("button");

    // Update character count on input event
    titleInput.addEventListener("input", () => {
      this.updateCharacterCount(titleInput.value.length, charCountSpan);
    });

    // Validate title on blur
    titleInput.addEventListener("blur", () => {
      this.validateTitle(titleInput.value, titleError);
    });

    // Validate content on blur
    contentInput.addEventListener("blur", () => {
      this.validateContent(contentInput.value, bodyError);
    });

    // Handle form submission
    form.addEventListener("submit", (event) => {
      this.handleFormSubmit(event, {
        titleInput,
        contentInput,
        charCountSpan,
        button,
      });
    });
  }

  /**
   * Updates the character count display for the title input
   * @param {number} currentLength - Current length of the title input
   * @param {HTMLElement} countElement - The element to update with the count
   */
  updateCharacterCount(currentLength, countElement) {
    const remaining = this._maxTitleLength - currentLength;
    countElement.textContent = `Remaining Character: ${remaining}`;
  }

  /**
   * Validates the title input
   * @param {string} title - The title to validate
   * @param {HTMLElement} errorElement - Element to display error messages
   * @returns {boolean} Whether the title is valid
   */
  validateTitle(title, errorElement) {
    if (title.trim().length < this._titleMinLength) {
      errorElement.textContent = "Title at least 3 character";
      return false;
    } else {
      errorElement.textContent = "";
      return true;
    }
  }

  /**
   * Validates the content input
   * @param {string} content - The content to validate
   * @param {HTMLElement} errorElement - Element to display error messages
   * @returns {boolean} Whether the content is valid
   */
  validateContent(content, errorElement) {
    if (content.trim().length < this._contentMinLength) {
      errorElement.textContent = "Content at least 10 character";
      return false;
    } else {
      errorElement.textContent = "";
      return true;
    }
  }

  /**
   * Handles the form submission event
   * @param {Event} event - The form submission event
   * @param {Object} elements - Object containing form elements
   */
  handleFormSubmit(event, elements) {
    const { titleInput, contentInput, charCountSpan, button } = elements;
    event.preventDefault();

    const noteCreatedEvent = new CustomEvent("note-created", {
      bubbles: true,
      composed: true,
      detail: {
        title: titleInput.value,
        body: contentInput.value,
        button: button,
      },
    });

    this.dispatchEvent(noteCreatedEvent);

    // Reset form and character count
    event.target.reset();
    this.updateCharacterCount(0, charCountSpan);
  }

  render() {
    this.getStyles();

    this.shadowRoot.innerHTML = `
      ${this._style.outerHTML}

      <h2>Make Note</h2>
      <form class="make-note">
        <span>Remaining Character: ${this._maxTitleLength}</span>
        <input 
          minlength="${this._titleMinLength}" 
          required 
          type="text" 
          placeholder="This is title" 
          maxlength="${this._maxTitleLength}"
        >
        <p id="titleError"></p> 
        <textarea 
          minlength="${this._contentMinLength}" 
          required 
          placeholder="Write your note in here"
        ></textarea>
        <p id="bodyError"></p> 
        <button type="submit">Make Note</button>
      </form>
    `;
  }
}

customElements.define("make-note", MakeNote);
