const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKS_APPS';

document.addEventListener('DOMContentLoaded', function () {
  const submitBook = document.getElementById('bookForm');
  submitBook.addEventListener('submit', function (event) {
      event.preventDefault();
      addBook();
  });

  const searchBook = document.getElementById('searchBook');
  searchBook.addEventListener('submit', function (event) {
      event.preventDefault();
      searchBookList();
  });

  if (isStorageExist()) {
      loadDataFromStorage();
  }
});

//make array book
let books = [];

function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

//save to localStorage
function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

//load from localStorage
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  if (serializedData !== null) {
    books = JSON.parse(serializedData);
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener(SAVED_EVENT, function () {
  console.log('Data buku berhasil disimpan.');
});

document.addEventListener(RENDER_EVENT, function () {
  renderBookList();
  updateBookCount();
});

//add new book
function addBook() {
  const bookTitle = document.getElementById('bookFormTitle').value;
  const bookAuthor = document.getElementById('bookFormAuthor').value;
  const bookYear = parseInt(document.getElementById('bookFormYear').value); //type number
  const isComplete = document.getElementById('bookFormIsComplete').checked;

  const book = {
      id: Date.now(),
      title: bookTitle,
      author: bookAuthor,
      year: bookYear,
      isComplete: isComplete
  };

  books.push(book);
  showToast("Book added successfully !", 'success');
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  document.getElementById('bookForm').reset();
}

function renderBookList() {
  const incompleteBookList = document.getElementById('incompleteBookList');
  const completeBookList = document.getElementById('completeBookList');

  incompleteBookList.innerHTML = '';
  completeBookList.innerHTML = '';

  books.forEach(book => {
      const bookItemHTML = `
        <div data-bookid="${book.id}" data-testid="bookItem" class="book-item">
          <h3 data-testid="bookItemTitle">${book.title}</h3>
          <p data-testid="bookItemAuthor">Author : ${book.author}</p>
          <p data-testid="bookItemYear">Year : ${book.year}</p>
          <div class="book-action">
            <button data-testid="bookItemIsCompleteButton">
              <i class="fas ${book.isComplete ? 'fa-check' : 'fa-book-open'}"></i>
            </button>
            <button data-testid="bookItemEditButton">
              <i class="fas fa-edit"></i>
            </button>
            <button data-testid="bookItemDeleteButton">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <hr>
      `;

      if (book.isComplete) {
          completeBookList.innerHTML += bookItemHTML;
      } else {
          incompleteBookList.innerHTML += bookItemHTML;
      }
  });

  //event handler for button
  document.querySelectorAll('[data-bookid]').forEach(bookElement => {
    //delete button
      bookElement.querySelector('.fa-trash').parentElement.addEventListener('click', function() {
          const bookId = Number(bookElement.dataset.bookid);
          deleteBook(bookId);
      });
    //status button
      bookElement.querySelector('.fa-book-open, .fa-check').parentElement.addEventListener('click', function() {
          const bookId = Number(bookElement.dataset.bookid);
          toggleComplete(bookId);
      });
    //edit button
      bookElement.querySelector('.fa-edit').parentElement.addEventListener('click', function() {
          const bookId = Number(bookElement.dataset.bookid);
          editBook(bookId);
      });
  });
}

function deleteBook(bookId) {
  books = books.filter(book => book.id !== bookId);
  showToast("Book deleted successfully", 'error');
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function toggleComplete(bookId) {
  const book = books.find(book => book.id === bookId);
  book.isComplete = !book.isComplete;
  showToast(book.isComplete ? "Book has been finished!" : "Book is not finished yet!", 'info');
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function editBook(bookId) {
  const bookToEdit = books.find(book => book.id === bookId);
  if (bookToEdit) {
      document.getElementById('bookFormTitle').value = bookToEdit.title;
      document.getElementById('bookFormAuthor').value = bookToEdit.author;
      document.getElementById('bookFormYear').value = bookToEdit.year;
      document.getElementById('bookFormIsComplete').checked = bookToEdit.isComplete;

      books = books.filter(book => book.id !== bookId);
      showToast("Please edit your book", 'warning');
      document.dispatchEvent(new Event(RENDER_EVENT));
      saveData();
  }
}

function updateBookCount() {
  const bookCountElement = document.getElementById('bookCount');
  bookCountElement.textContent = `${books.length} Book${books.length > 1 ? 's' : ''}`;
}

function searchBookList() {
  const searchBookInput = document.getElementById('searchBookTitle').value.toLowerCase();
  const filteredBooks = books.filter(book => book.title.toLowerCase().includes(searchBookInput));
  renderfilteredBookList(filteredBooks);
}

//function render book by search
function renderfilteredBookList(filteredBooks) {
  const incompleteBookList = document.getElementById('incompleteBookList');
  const completeBookList = document.getElementById('completeBookList');

  incompleteBookList.innerHTML = '';
  completeBookList.innerHTML = '';

  filteredBooks.forEach(book => {
      const bookItemHTML = `
        <div data-bookid="${book.id}" data-testid="bookItem" class="book-item">
          <h3 data-testid="bookItemTitle">${book.title}</h3>
          <p data-testid="bookItemAuthor">Author : ${book.author}</p>
          <p data-testid="bookItemYear">Year : ${book.year}</p>
          <div class="book-action">
            <button data-testid="bookItemIsCompleteButton">
              <i class="fas ${book.isComplete ? 'fa-check' : 'fa-book-open'}"></i>
            </button>
            <button data-testid="bookItemEditButton">
              <i class="fas fa-edit"></i>
            </button>
            <button data-testid="bookItemDeleteButton">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <hr>
      `;

      if (book.isComplete) {
          completeBookList.innerHTML += bookItemHTML;
      } else {
          incompleteBookList.innerHTML += bookItemHTML;
      }
  });
}

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;

  const toastColors = {
    success: '#F39C12',
    error: '#FF0000',
    warning: '#3498DB',
    info: '#29e42f',
  };

  toast.style.backgroundColor = toastColors[type] || toastColors['info'];
  toast.style.display = 'block';

  setTimeout(() => {
      toast.style.display = 'none';
  }, 3000);
}
