const BASE_URL = "https://notes-api.dicoding.dev/v2";

class NoteApi {
  /**
   * Helper method for fetching with a specific timeout
   * Returns the data from the response or throws an error if the request times out.
   *
   * @param { string } url - The URL to fetch from
   * @param { Object } options - Fetch options like method, header, body
   * @returns { Promise<any> } - Parsed JSON data for GET requests, response object for DELETE/POST method
   * @throws {Error} - Throws error if request exceeds 5 seconds or network fails
   */
  static async fetchWithTimeout(url, options = {}) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const fetchOption = {
        ...options,
        signal: controller.signal,
      };

      const response = await fetch(url, fetchOption);
      clearTimeout(timeoutId);

      // Throw error if the status is below 200 or above 300
      if (response.status < 200 || response.status > 300) {
        throw new Error("Something went wrong");
      }

      // return just the response for Delete and Post method
      if (options.method === "DELETE" || options.method === "POST") {
        return response;
      }

      const { data } = await response.json();
      return data;
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Error: Request took longer than 5 seconds");
      }
      throw error;
    }
  }

  /**
   * Retrieve active (non-archived) notes from the server
   *
   * @returns { Promise<any> } - Array of active notes
   * @throws { Error } - Throws timeout error or generic error message
   */
  static async getActiveNote() {
    try {
      return await this.fetchWithTimeout(`${BASE_URL}/notes`);
    } catch (error) {
      if (error.message.includes("Request took longer")) {
        throw error;
      }

      throw new Error("Something is error");
    }
  }

  /**
   * Retrieve archived notes from the server
   *
   * @returns { Promise<any> } - Array of archived notes
   * @throws { Error } - Throws timeout error or generic error message
   */
  static async getArchiveNote() {
    try {
      return await this.fetchWithTimeout(`${BASE_URL}/notes/archived`);
    } catch (error) {
      if (error.message.includes("Request took longer")) {
        throw error;
      }

      throw new Error("Something is error");
    }
  }

  /**
   * Archive a specific note by ID
   *
   * @param { string|number } noteId - The ID of the note to archive
   * @returns { Promise<Response> } - Fetch response object
   * @throws { Error } - Throws timeout error or generic error message
   */
  static async archiveNote(noteId) {
    try {
      return await this.fetchWithTimeout(`${BASE_URL}/notes/${noteId}/archive`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      if (error.message.includes("Request took longer")) {
        throw error;
      }

      throw new Error("Something is error");
    }
  }

  /**
   * Unarchive a specific note by ID
   *
   * @param { string|number } noteId - The ID of the note to archive
   * @returns { Promise<Response> } - Fetch response object
   * @throws { Error } - Throws timeout error or generic error message
   */
  static async unarchiveNote(noteId) {
    try {
      return await this.fetchWithTimeout(`${BASE_URL}/notes/${noteId}/unarchive`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      if (error.message.includes("Request took longer")) {
        throw error;
      }

      throw new Error("Something is error");
    }
  }

  /**
   * Create a new note
   *
   * @param { Object } note - The note object to create
   * @param { String } note.title - The title of the note
   * @param { String } note.content - The content of the note
   * @returns { Promise<Response> } - Fetch response object
   * @throws { Error } - Throws timeout error or generic error message
   */
  static async createNote(note) {
    try {
      return await this.fetchWithTimeout(`${BASE_URL}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(note),
      });
    } catch (error) {
      if (error.message.includes("Request took longer")) {
        throw error;
      }

      throw new Error("Something is error");
    }
  }

  /**
   * Delete specific note by ID
   *
   * @param { string|number } noteId - The ID of the note to archive
   * @returns { Promise<Response> } - Fetch response object
   * @throws { Error } - Throws timeout error or generic error message
   */
  static async deleteNote(noteId) {
    try {
      return await this.fetchWithTimeout(`${BASE_URL}/notes/${noteId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      if (error.message.includes("Request took longer")) {
        throw error;
      }

      throw new Error("Something is error");
    }
  }
}

export default NoteApi;
