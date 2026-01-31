export const noteApi = {
  createNote: async (title: string, content: string) => {
    const res = await fetch("/api/notes", {
      method: "POST",
      body: JSON.stringify({ title, content }),
    });
    if (!res.ok) throw new Error("Failed to create");
    return res.json();
  },

  updateNote: async (id: string, title: string, content: string) => {
    const res = await fetch(`/api/notes/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ title, content }),
    });
    if (!res.ok) throw new Error("Failed to update");
    return res.json();
  },

  deleteNote: async (id: string) => {
    const res = await fetch(`/api/notes/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete");
    return res.json();
  },
};