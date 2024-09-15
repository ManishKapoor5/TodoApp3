import create from "zustand";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const useStore = create((set) => ({
  todos: [],
  isAuthenticated: false,
  token: null,

  login: async (username, password) => {
    try {
      const response = await api.post("/login", { username, password });
      const token = response.data.token;
      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = token;
      set({ isAuthenticated: true, token });
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  },

  register: async (username, password) => {
    try {
      await api.post("/register", { username, password });
    } catch (error) {
      console.error("Registration error:", error);
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    set({ isAuthenticated: false, token: null, todos: [] });
  },

  fetchTodos: async () => {
    try {
      const response = await api.get("/todos");
      set({ todos: response.data });
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  },

  addTodo: async (todo) => {
    try {
      const response = await api.post("/todos", todo);
      set((state) => ({ todos: [...state.todos, response.data] }));
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  },

updateTodoOptimistic: (id, update) => {
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo._id === id ? { ...todo, ...update } : todo
      ),
    }));
  },

  updateTodo: async (id, updatedTodo) => {
    try {
      const response = await api.put(`/todos/${id}`, updatedTodo);
      set((state) => ({
        todos: state.todos.map((todo) =>
          todo._id === id ? response.data : todo
        ),
      }));
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  },

  deleteTodo: async (id) => {
    try {
      await api.delete(`/todos/${id}`);
      set((state) => ({
        todos: state.todos.filter((todo) => todo._id !== id),
      }));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  },
  checkAuth: () => {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = token;
      set({ isAuthenticated: true, token });
    }
  },
}));
