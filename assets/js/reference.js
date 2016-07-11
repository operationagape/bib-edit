const session = require('electron').remote.session,
      ipc = require('electron').ipcRenderer,
      {Menu} = require('electron').remote,
      PouchDB = require('pouchdb');
var bibUtil = require("../util/json_to_usfm.js");

/*const menu = Menu.buildFromTemplate([
    {
        label: 'Autographa Lite'/*,
	submenu: [
	    {
		label: 'Settings',
		click: function () {
		    ipc.sendSync('show-import-window');
		}
	    }
	]
    }
]);*/

//Menu.setApplicationMenu(menu);

var constants = require('../util/constants.js');

var ot_books = constants.booksList.slice(0,39);
var nt_books = constants.booksList.slice(39,66);
var all_books = constants.booksList;

function createBooksList(booksLimit, bookButton) {
  for (var i=1; i<=booksLimit; i++) {
    var li = document.createElement('li'),
    a = document.createElement('a'),
    bookName = document.createTextNode(bookButton[i-1]);
    a.id = 'b'+i;
    a.setAttribute('href', '#');
    a.appendChild(bookName);
    li.appendChild(a);
	  document.getElementById('books-pane').appendChild(li);
  }
}

function createChaptersList(chaptersLimit) {
  for (var i=1; i<=chaptersLimit; i++) {
    var li = document.createElement('li'),
    a = document.createElement('a'),
    chapterNumber = document.createTextNode(i);
    a.id = 'c'+i;
    a.setAttribute('href', 'index.html');
    a.appendChild(chapterNumber);
    li.appendChild(a);
    document.getElementById('chapters-pane').appendChild(li);

    a.addEventListener('click', function (e) {
      const cookie = {url: 'http://chapter.autographa.com', name: 'chapter', value: e.target.id.substring(1)};

      session.defaultSession.cookies.set(cookie, (error) => {
        if (error)
          console.error(error);
      });
      const reply = ipc.sendSync('synchronous-message', 'ping');
      const message = `Synchronous message reply: ${reply}`;
    });
  }
}

function onBookSelect(bookId, selectedBooks) {
  console.log(bookId.substring(1));
  document.querySelector('.page-header').innerHTML = selectedBooks[parseInt(bookId.substring(1), 10)-1];
  const cookie = {url: 'http://book.autographa.com', name: 'book', value: bookId.substring(1)};
  session.defaultSession.cookies.set(cookie, (error) => {
    if (error)
      console.error(error);
  });
  var db = new PouchDB('database');
  db.get(bookId.substring(1).toString()).then(function (doc) {
    chaptersPane = document.getElementById("chapters-pane");
    while (chaptersPane.lastChild) {
      chaptersPane.removeChild(chaptersPane.lastChild);
    }
    createChaptersList(doc.chapters.length);
    db.close();
  }).catch(function (err) {
    console.log('Error: While retrieving document. ' + err);
    db.close();
  });
}

document.leftPannelBox.onclick = function(){
  if(document.leftPannelBox.R1.value == "ALL"){
    console.log(document.leftPannelBox.R1.value);
    list = document.getElementById('books-pane');
    while(list.firstChild){
      list.removeChild(list.childNodes[0]);
    }
    createBooksList(all_books.length, all_books);
    bookLink(all_books);
  }else if(document.leftPannelBox.R1.value == "NT"){
    console.log(document.leftPannelBox.R1.value);
    list = document.getElementById('books-pane');
    while(list.firstChild){
      list.removeChild(list.childNodes[0]);
    }
    createBooksList(nt_books.length, nt_books);
    bookLink(nt_books);
  }
  else if(document.leftPannelBox.R1.value == "OT"){
    console.log(document.leftPannelBox.R1.value);
    list = document.getElementById('books-pane');
    while(list.firstChild){
      list.removeChild(list.childNodes[0]);
    }
    createBooksList(ot_books.length, ot_books);
    bookLink(ot_books);
  }else{
    console.log(document.leftPannelBox.R1.value);
    list = document.getElementById('books-pane');
    while(list.firstChild){
      list.removeChild(list.childNodes[0]);
    }
    createBooksList(all_books.length, all_books);
    bookLink(all_books);
  }
}

//createBooksList(66);

// Check for existing book in session.
session.defaultSession.cookies.get({url: 'http://book.autographa.com'}, (error, cookie) => {
  var onLoadBookId = 'b1';
  if(cookie.length > 0) {
    onLoadBookId = 'b'+cookie[0].value;
  }
  console.log(onLoadBookId)
  onBookSelect(onLoadBookId, all_books);
});

function bookLink(selectedBooks) {
  books = document.querySelectorAll("a[id^=b]");
  for(i=1; i<=books.length; i++) {
    books[i-1].addEventListener("click", function (e) {
      onBookSelect(e.target.id, selectedBooks);
    });
  }
}

/*document.getElementById("export-btn").addEventListener("click", function (e) {
    session.defaultSession.cookies.get({url: 'http://book.autographa.com'}, (error, cookie) => {
	console.log(cookie);
	book = {};
	var db = new PouchDB('database');
	db.get('targetBible').then(function (doc) {
	    book.bookNumber = cookie[0].value;
	    book.bookName = constants.booksList[parseInt(book.bookNumber, 10)-1];
	    book.bookCode = constants.bookCodesList[parseInt(book.bookNumber, 10)-1];
	    book.outputPath = doc.targetPath;
	    bibUtil.toUsfm(book);
	}).catch(function (err) {
	    console.log('Error: Cannot get details from DB');
	});
    });
});*/
