class Shelf {
   constructor(name) {
      this.name = name;
      this.books = [];
   }

   //adds new books to the books aray
   addBook(name) {
      this.books.push(new Book(name));
   }
}

class Book {
   constructor(name) {
      this.name = name;
   }
}

//connects API to JS
class ShelfService {
   static url = "https://65a34888a54d8e805ed38042.mockapi.io/api/shelves/shelf";

   //method returns all shelves listed, retrieves through "get"
   static getAllShelves() {
      return $.get(this.url);
   }

   //method returns shelf listed, retrieves through "get"
   static getShelf(id) {
      return $.get(this.url + `/${id}`);
   }

   //method returns a shelf created with "post"
   static createShelf(shelf) {
      return $.post(this.url, shelf);
   } 

   //method returns a shelf to update with updates via "PUT"
   //_.id is the value the database will automatically make for a shelf
   //JSON.stringify automatically makes strings out of input
   static updateShelf(shelf) {
      return $.ajax({
         url: this.url + `/${shelf._id}`,
         dataType: "json",
         data: JSON.stringify(shelf),
         contentType: "application/json",
         type: "PUT"
      });
   }

   //method deletes shelves via "DELETE"
   //whatever shelf matches the id, the program will delete.
   static deleteShelf(id) {
      return $.ajax({
         url: this.url + `/${id}`,
         type: "DELETE"
      })
   }
}

class DOMManager {
   static shelves;

   //calls method getAllShelfs and turns it into a promise to then call method render for the shelfs
   static getAllShelves() {
      ShelfService.getAllShelves().then(shelves => this.render(shelves));
   }

   //creating new instance of shelf within the class, rerender info
   static createShelf(name) {
      ShelfService.createShelf(new Shelf(name))
         .then(() => {
            return ShelfService.getAllShelves();
         })
         .then((shelves)=> this.render(shelves));
   }

   //create method within DOMManager to delete shelves and rerender information 
   static deleteShelf(id) {
      ShelfService.deleteShelf(id)
         .then(() => {
            return ShelfService.getAllShelves();
         })
         .then((shelves) => this.render(shelves));
   }
   
   //method to add books to shelf
   static addBook(id) {
      for (let shelf of this.shelves) {
         if (shelf._id == id) {
            shelf.books.push(new Book($(`#${shelf._id}-book-name`).val()));
            ShelfService.updateShelf(shelf)
               .then(() => {
                  return ShelfService.getAllShelves();
               })
               .then((shelves) => this.render(shelves));
         }
      }
   }

   //method to remove books within shelfs
   static deleteBook(shelfId, bookId) {
      for (let shelf of this.shelves) {
         if (shelf._id == shelfId) {
            for (let book of shelf.books) {
               if (book._id == bookId) {
                  shelf.books.splice(shelf.books.indexOf(book), 1);
                  ShelfService.updateShelf(shelf)
                     .then(() => {
                        return ShelfService.getAllShelves();
                     })
                     .then((shelves) => this.render(shelves));
               }
            }
         }
      }
   }


   //method shows all the shelves put into the system on the front page of the website
   //call upon ID app where these shelves will be displayed
   static render(shelves) {
      this.shelves = shelves;
      $("#app").empty();
   
      for (let shelf of shelves) {
         $("#app").prepend(
            `<div id="${shelf._id}" class="card">
               <div class="card-header">
                  <h2>${shelf.name}</h2>
                  <button class="btn btn-danger" onclick="DOMManager.deleteShelf('${shelf._id}')">Delete</button>
               </div>
               <div class="card-body">
                  <div class="card">
                     <div class="row">
                        <div class="col-sm">
                           <input type="text" id="${shelf._id}-book-name" class="form-control" placeholder="Book Name">
                        </div>
                     </div>
                     <button id="${shelf._id}-new-book" onclick="DOMManager.addBook('${shelf._id}')" class="btn btn-primary form-control">Add</button>
                  </div>
               </div>
            </div><br>`
         );
   
         //book loop outside the shelf loop
         for (let book of shelf.books) {
            $(`#${shelf._id}`).find(".card-body").append(
               `<p>
                  <span id="name-${book._id}"><strong>Name: </strong> ${book.name}</span>
                  <button class="btn btn-danger" onclick="DOMManager.deleteBook('${shelf._id}', '${book._id}')">Delete Book</button>
               </p>`
            );
         }
      }
   }   
}

$("#create-new-shelf").click(() => {
   DOMManager.createShelf($("#new-shelf-name").val());
   $("#new-shelf-name").val("");
});

DOMManager.getAllShelves();


//code only allows the first card to be displayed but logs other cards
// or "shelves" in the API. It does not include the "books" however
// code works on the original copy that contains different names
   // I only changed the titles from House/houses to Shelf/shelves
   // and Room/rooms to Book/books. completely removed "area" option

//exact copy works however, with the original names and API given in the 
// notes. I suspect the issue is in the API or my naming convention