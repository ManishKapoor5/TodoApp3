import React, { useState, useEffect } from "react";
import { useStore } from "../store";

function TodoList() {
  const [newTodo, setNewTodo] = useState({ name: "", description: "", pending: true });
  const [editingTodo, setEditingTodo] = useState(null);
  const [displayTodo, setDisplayTodo] = useState(null);
  const { todos, fetchTodos, addTodo, updateTodo, deleteTodo, logout } = useStore();

  // Fetch todos on component mount
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleSubmit = (e) => {
    e.preventDefault();
    addTodo(newTodo);
    setNewTodo({ name: "", description: "", pending: true });
  };

  const handleUpdate = async (id, updates) => {
    try {
      await updateTodo(id, updates);
    } catch (error) {
      console.error("Failed to update todo:", error);
    }
  };

  const handleEdit = (todo) => {
    setEditingTodo({ ...todo });
    setDisplayTodo(null);
  };

  const handleCancelEdit = () => {
    setEditingTodo(null);
  };

  const handleSaveEdit = async () => {
    if (editingTodo) {
      await handleUpdate(editingTodo._id, {
        name: editingTodo.name,
        description: editingTodo.description,
        pending: editingTodo.pending
      });
      setEditingTodo(null);
      fetchTodos();  // Ensure re-fetching after updating
    }
  };

  const handleDisplay = (todo) => {
    setDisplayTodo(todo);
    setEditingTodo(null);
  };

  const handleCloseDisplay = () => {
    setDisplayTodo(null);
  };

  // Function to handle checkbox change (toggles the "pending" status)
  const handleStatusChange = async (todo) => {
    console.log("Before toggle:", todo.name, "Pending:", todo.pending);

    const updatedPendingStatus = !todo.pending;
    await handleUpdate(todo._id, { pending: updatedPendingStatus });

    console.log("After toggle:", todo.name, "Pending:", updatedPendingStatus);

    fetchTodos(); // Fetch todos again to refresh the list after update
  };

  return (
    <div>
      <h1>Todo List</h1>
      <button onClick={logout}>Logout</button>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Todo name"
          value={newTodo.name}
          onChange={(e) => setNewTodo({ ...newTodo, name: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={newTodo.description}
          onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
        />
        <button type="submit">Add Todo</button>
      </form>
      <ul>
        {todos.map((todo) => (
          <li key={todo._id}>
            {editingTodo && editingTodo._id === todo._id ? (
              <>
                <input
                  type="text"
                  value={editingTodo.name}
                  onChange={(e) => setEditingTodo({ ...editingTodo, name: e.target.value })}
                />
                <input
                  type="text"
                  value={editingTodo.description}
                  onChange={(e) => setEditingTodo({ ...editingTodo, description: e.target.value })}
                />
                <select
                  value={editingTodo.pending ? "pending" : "completed"}
                  onChange={(e) => setEditingTodo({ ...editingTodo, pending: e.target.value === "pending" })}
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
                <button onClick={handleSaveEdit}>Save</button>
                <button onClick={handleCancelEdit}>Cancel</button>
              </>
            ) : (
              <>
                <input
                  type="checkbox"
                  checked={!todo.pending} // Checked when task is completed
                  onChange={() => handleStatusChange(todo)} // Toggle pending status
                />
                <span
                  style={{
                    textDecoration: todo.pending ? "none" : "line-through",
                  }}
                >
                  {todo.name}
                </span>
                <span style={{ marginLeft: "10px", color: todo.pending ? "orange" : "green" }}>
                  {todo.pending ? "Pending" : "Completed"}
                </span>
                <button onClick={() => handleEdit(todo)}>Edit</button>
                <button onClick={() => handleDisplay(todo)}>Display</button>
                <button onClick={() => deleteTodo(todo._id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
      {displayTodo && (
        <div className="modal">
          <div className="modal-content">
            <h2>{displayTodo.name}</h2>
            <p>{displayTodo.description}</p>
            <p>Status: {displayTodo.pending ? "Pending" : "Completed"}</p>
            <button onClick={handleCloseDisplay}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TodoList;
