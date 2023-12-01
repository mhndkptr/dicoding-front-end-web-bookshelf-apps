const bookData = [];
const BOOK_DATA_KEY = 'BOOK_DATA';
const RENDER_EVENT = 'render-apps';
const SEARCH_RENDER = 'render-search';

// Fungsi berikut untuk mengecek apakah browser support dengan Web Storage
function isStorageExist() {
    if (typeof(Storage) === undefined) {
      alert('Browser kamu tidak mendukung local storage');
      return false;
    }
    return true;
}

// Fungsi berikut untuk memuat data dari Local Storage
function loadDataFromStorage() {
    const data = localStorage.getItem(BOOK_DATA_KEY);
    let dataObj = JSON.parse(data);

    if(data !== null) {
        for(const item of dataObj) {
            bookData.push(item);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

// Fungsi dibawah untuk mencari buku berdasarkan id
function findBook(bookId) {
    for(const book of bookData) {
        if(book.id === bookId) {
            return book;
        }
    }
    return null;
}

// Fungsi dibawah untuk mencari index array dari buku berdasarkan id
function findBookIndex(bookId) {
    for(const i in bookData) {
        if(bookData[i].id === bookId) {
            return i;
        }
    }
    return -1;
}

// Fungsi dibawah untuk membuat id
function generateId() {
    return +new Date();
}

// Fungsi dibawah untuk membuat objek dari sebuah buku
function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year: Number(year),
        isComplete
    };
}

// Fungsi dibawah untuk menyimpan data ke Local Storage
function saveData() {
    if(isStorageExist()) {
        const parsed = JSON.stringify(bookData);
        localStorage.setItem(BOOK_DATA_KEY, parsed);
        savedEvent('Perubahan berhasil disimpan', true)
    }
}

// Fungsi dibawah untuk membuat elemen html yang akan ditampilkan
function makeItem(obj) {
    const {id, title, author, year, isComplete} = obj;

    const article = document.createElement('article');
    const bookTitle = document.createElement('h3');
    const bookAuthor = document.createElement('p');
    const bookYear = document.createElement('p');
    const action = document.createElement('div');
    const green = document.createElement('button');
    const red = document.createElement('button');

    article.setAttribute('id', `book-${id}`);
    article.classList.add('bookItem');
    action.classList.add('action');
    green.classList.add('green');
    red.classList.add('red');
    
    bookTitle.innerText = title;
    bookAuthor.innerText = 'Penulis: ' + author;
    bookYear.innerText = 'Tahun: ' + year;
    red.innerText = 'Hapus buku';
    
    if(isComplete) {
        green.innerText = 'Belum selesai dibaca';
        action.append(green, red);
        
        green.addEventListener('click', function() {
            green.innerText = 'Selesai dibaca';
            addBookToIncomplete(id);
            document.dispatchEvent(new Event(RENDER_EVENT));
            document.dispatchEvent(new Event(SEARCH_RENDER));
            saveData();
        });
    } else {
        green.innerText = 'Selesai dibaca';
        action.append(green, red);
        
        green.addEventListener('click', function() {
            green.innerText = 'Belum selesai dibaca';
            addBookToComplete(id);
            document.dispatchEvent(new Event(RENDER_EVENT));
            document.dispatchEvent(new Event(SEARCH_RENDER));
            saveData();
        });
    }

    red.addEventListener('click', () => {
        removeBook(id);
    });

    article.append(bookTitle, bookAuthor, bookYear, action);
    
    return article;
}

// Fungsi dibawah untuk validasi tahun buku
function validationYear(value) {
    if(value <= 0) {
        savedEvent('Tahun tidak valid', false);
        return null;
    } else {
        return value;
    }
}

// Fungsi dibawah untuk validasi judul
function validationBook(value) {
    for(book of bookData) {
        if(book.title == value) {
            savedEvent('Buku sudah ada', false);
            return null;
        }
    }
    return value;
}

// Fungsi dibawah untuk menambahkan objek buku ke array bookData lalu simpan perubahannya di local storage
function addItem() {
    const bookId = generateId(); 
    const bookTitle = validationBook(document.getElementById('inputBookTitle').value);
    if(bookTitle == null) {
        return;
    }
    const bookAuthor = document.getElementById('inputBookAuthor').value;
    const bookYear = validationYear(document.getElementById('inputBookYear').value);
    if(bookYear == null) {
        return;
    }
    const bookIsComplete = document.getElementById('inputBookIsComplete').checked;
    const bookObject = generateBookObject(bookId, bookTitle, bookAuthor, bookYear, bookIsComplete);
    bookData.push(bookObject);
    
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

// Fungsi dibawah untuk memindahkan buku yang belum selesai dibaca ke selesai dibaca
function addBookToComplete(bookId) {
    const bookTarget = findBook(bookId);
    
    if(bookTarget == null) return;
    
    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

// Fungsi dibawah untuk memindahkan buku yang selesai dibaca ke belum selesai dibaca
function addBookToIncomplete(bookId) {
    const bookTarget = findBook(bookId);

    if(bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

// Fungsi dibawah untuk menghapus buku dari local storage
function removeBook(bookId) {
    const bookTarget = findBookIndex(bookId);

    if(bookTarget === -1) return;

    bookData.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

document.addEventListener('DOMContentLoaded', function() {
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function(e) {
        addItem();
        e.preventDefault();
    });

    if(isStorageExist()) {
        loadDataFromStorage();
    }

    const searchSubmit = document.getElementById('searchBook');
    searchSubmit.addEventListener('submit', function(e) {
        document.dispatchEvent(new Event(SEARCH_RENDER));
        e.preventDefault();
    });
});

// Fungsi dibawah untuk mentrigger notifikasi perubahan
function savedEvent(message, bool) {
    const notify = document.querySelector('.notify');
    const notifyP = document.querySelector('.notify p');
    if(bool) {
        notify.style.backgroundColor = "lightgreen";
    } else {
        notify.style.backgroundColor = "#FF7F7F";
    }
    notifyP.innerText = message;
    notify.classList.add('active');
    setTimeout(() => {
        notify.classList.remove('active');
    }, 3000)
}
  
// Event dibawah untuk merender aplikasi setelah terjadi perubahan
document.addEventListener(RENDER_EVENT, function () {
    const completeBookshelfList = document.getElementById('completeBookshelfList');
    const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
    
    completeBookshelfList.innerHTML = '';
    incompleteBookshelfList.innerHTML = '';
    
    for(const book of bookData) {
        const bookItem = makeItem(book);
        if(book.isComplete) {
            completeBookshelfList.append(bookItem);
        } else {
            incompleteBookshelfList.append(bookItem);
        }
    }
});

// Event dibawah untuk merender search section setelah terjadi perubahan
document.addEventListener(SEARCH_RENDER, function() {
    const bookTitle = document.getElementById('searchBookTitle').value;
    const bookResult = findBookTitle(bookTitle);
    const searchBookshelfList = document.querySelector('.searchSection .bookList');
    if(bookResult == null) {
        searchBookshelfList.innerHTML = '';
    } else {
        const bookSearchItem = makeItem(bookResult);
        searchBookshelfList.innerHTML = '';
        searchBookshelfList.append(bookSearchItem);
    }
});

// Fungsi dibawah untuk mencari buku berdasarkan judul
function findBookTitle(bookTitle) {
    for(const book of bookData) {
        if(book.title.toLowerCase() === bookTitle.toLowerCase()) {
            return book;
        }
    }
    return null;
}