const STORAGE_KEY = "blog-posts";

let posts = [];
let editingPostId = null;

let form;
let titleInput;
let contentInput;
let errorMessage;
let postsContainer;
let submitButton;
let formTitle;

function generateId() {
  return Date.now().toString() + Math.random().toString(16).slice(2);
}

function loadPosts() {
  try {
    const savedPosts = localStorage.getItem(STORAGE_KEY);
    if (!savedPosts) return [];

    const parsed = JSON.parse(savedPosts);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.log("Couldn't load posts", error);
    return [];
  }
}

function savePosts() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch (error) {
    console.log("Couldn't save posts", error);
  }
}

function setError(message) {
  if (errorMessage) {
    errorMessage.textContent = message;
  }
}

function clearError() {
  setError("");
}

function resetForm() {
  if (form) {
    form.reset();
  }

  editingPostId = null;

  if (submitButton) {
    submitButton.textContent = "Add Post";
  }

  if (formTitle) {
    formTitle.textContent = "Create a New Post";
  }

  if (titleInput) {
    titleInput.focus();
  }
}

function renderPosts() {
  if (!postsContainer) return;

  postsContainer.innerHTML = "";

  if (posts.length === 0) {
    postsContainer.innerHTML = '<p class="empty-state">No posts yet. Add one above.</p>';
    return;
  }

  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  sortedPosts.forEach((post) => {
    const article = document.createElement("article");
    article.className = "post";
    article.dataset.id = post.id;

    const title = document.createElement("h3");
    title.textContent = post.title;

    const content = document.createElement("p");
    content.textContent = post.content;

    const meta = document.createElement("small");
    const postDate = post.timestamp ? new Date(post.timestamp) : new Date();
    meta.textContent = postDate.toLocaleString();

    const actionRow = document.createElement("div");
    actionRow.className = "post-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.dataset.action = "edit";
    editButton.dataset.id = post.id;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.dataset.action = "delete";
    deleteButton.dataset.id = post.id;

    actionRow.appendChild(editButton);
    actionRow.appendChild(deleteButton);

    article.appendChild(title);
    article.appendChild(content);
    article.appendChild(meta);
    article.appendChild(actionRow);
    postsContainer.appendChild(article);
  });
}

function handleFormSubmit(event) {
  event.preventDefault();
  clearError();

  const title = titleInput ? titleInput.value.trim() : "";
  const content = contentInput ? contentInput.value.trim() : "";

  if (!title) {
    setError("Title is required.");
    if (titleInput) {
      titleInput.focus();
    }
    return;
  }

  if (!content) {
    setError("Content is required.");
    if (contentInput) {
      contentInput.focus();
    }
    return;
  }

  if (editingPostId) {
    posts = posts.map((post) => {
      if (post.id !== editingPostId) {
        return post;
      }

      return {
        ...post,
        title,
        content,
        timestamp: new Date().toISOString(),
      };
    });
  } else {
    posts.push({
      id: generateId(),
      title,
      content,
      timestamp: new Date().toISOString(),
    });
  }

  savePosts();
  renderPosts();

  if (form) {
    form.reset();
  }

  editingPostId = null;

  if (submitButton) {
    submitButton.textContent = "Add Post";
  }

  if (formTitle) {
    formTitle.textContent = "Create a New Post";
  }
}

function handlePostAction(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const action = target.dataset.action;
  const id = target.dataset.id;

  if (!action || !id) return;

  if (action === "delete") {
    posts = posts.filter((post) => post.id !== id);
    savePosts();
    renderPosts();

    if (editingPostId === id) {
      resetForm();
    }
    return;
  }

  if (action === "edit") {
    const postToEdit = posts.find((post) => post.id === id);
    if (!postToEdit) return;

    editingPostId = id;

    if (titleInput) {
      titleInput.value = postToEdit.title;
    }

    if (contentInput) {
      contentInput.value = postToEdit.content;
    }

    if (submitButton) {
      submitButton.textContent = "Update Post";
    }

    if (formTitle) {
      formTitle.textContent = "Edit Post";
    }

    clearError();

    if (titleInput) {
      titleInput.focus();
    }
  }
}

function initializeApp() {
  form = document.getElementById("post-form");
  titleInput = document.getElementById("title");
  contentInput = document.getElementById("content");
  errorMessage = document.getElementById("error-message");
  postsContainer = document.getElementById("posts");
  submitButton = form ? form.querySelector('button[type="submit"]') : null;
  formTitle = document.getElementById("form-title");

  posts = loadPosts();

  if (form) {
    form.addEventListener("submit", handleFormSubmit);
  }

  if (postsContainer) {
    postsContainer.addEventListener("click", handlePostAction);
  }

  renderPosts();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}
