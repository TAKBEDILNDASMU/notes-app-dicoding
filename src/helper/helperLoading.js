/**
 * @class HelperLoading
 * @description Utility class for managing loading states of UI elements
 */

class HelperLoading {
  /**
   * Sets an element to a loading state with a spinner icon
   *
   * @static
   * @param { HTMLElement } element - The DOM element to put into loading state
   * @returns { returnType } description
   */
  static showLoading(element) {
    // Create spinner element
    const spinner = document.createElement("span");
    spinner.className = "loading-spinner";

    // Clear current content and add spinner + text
    element.innerHTML = "";
    element.appendChild(document.createTextNode("Loading"));
    element.appendChild(spinner);
    element.disabled = true;
  }

  /**
   * Restores an element from loading state by updating its text and enabling it
   *
   * @param { HTMLElement } element - The DOM element to restore from loading sdtate
   * @param { string } text - The text to display on the element
   */
  static hideLoading(element, text) {
    element.textContent = text;
    element.disabled = false;
  }
}

export default HelperLoading;
