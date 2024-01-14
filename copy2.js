class House {
   constructor(name) {
      this.name = name;
      this.rooms = [];
   }

   //adds new rooms to the rooms aray
   addRoom(name, area) {
      this.rooms.push(new Room(name, area));
   }
}

class Room {
   constructor(name, area) {
      this.name = name;
      this.area = area;
   }
}

class HouseService {
   static url = "https://ancient-taiga-31359.herokuapp.com/api/houses";

   //method returns all houses listed, retrieves through "get"
   static getAllHouses() {
      return $.get(this.url);
   }

   //method returns house listed, retrieves through "get"
   static getHouse(id) {
      return $.get(this.url + `/${id}`);
   }

   //method returns a house created with "post"
   static createHouse(house) {
      return $.post(this.url, house);
   } 

   //method returns a house to update with updates via "PUT"
   //_.id is the value the database will automatically make for a house
   //JSON.stringify automatically makes strings out of input
   static updateHouse(house) {
      return $.ajax({
         url: this.url + `/${house._id}`,
         dataType: "json",
         data: JSON.stringify(house),
         contentType: "application/json",
         type: "PUT"
      });
   }

   //method deletes houses via "DELETE"
   //whatever house matches the id, the program will delete.
   static deleteHouse(id) {
      return $.ajax({
         url: this.url + `/${id}`,
         type: "DELETE"
      })
   }
}

class DOMManager {
   static houses;

   //calls method getAllHouses and turns it into a promise to then call method render for the houses
   static getAllHouses() {
      HouseService.getAllHouses().then(houses => this.render(houses));
   }

   //creating new instance of house within the class, rerender info
   static createHouse(name) {
      HouseService.createHouse(new House(name))
         .then(() => {
            return HouseService.getAllHouses();
         })
         .then((houses)=> this.render(houses));
   }

   //create method within DOMManager to delete houses and rerender information 
   static deleteHouse(id) {
      HouseService.deleteHouse(id)
         .then(() => {
            return HouseService.getAllHouses();
         })
         .then((houses) => this.render(houses));
   }

   //method to add a room within DOMManager
   static addRoom(id) {
      for (let house of this.houses) {
         if (house._id ==id) {
            house.rooms.push(new Room($(`#${house._id}-room-name`).val(), $(`#${house._id}-room-area`).val()));
            HouseService.updateHouse(house) 
               .then(() => {
                  return HouseService.getAllHouses();
               })
               .then((houses) => this.render(houses));
         }
      }
   }

   //method to remove rooms within houses
   static deleteRoom(houseId, roomId) {
      for (let house of this.houses) {
         if (house._id == houseId) {
            for (let room of house.rooms) {
               if (room._id == roomId) {
                  house.rooms.splice(house.rooms.indexOf(room), 1);
                  HouseService.updateHouse(house)
                     .then(() => {
                        return HouseService.getAllHouses();
                     })
                     .then((houses) => this.render(houses));
               }
            }
         }
      }
   }


   //method shows all the houses put into the system on the front page of the website
   //call upon ID app where these houses will be displayed
   static render(houses) {
      this.houses = houses;
      $("#app").empty(); //empty first before rerendering/displaying information
      for (let house of houses) {
         $("#app").prepend( //displays format of houses on display
            `<div id="${house._id}" class="card">
               <div class="card-header">
                  <h2>${house.name}</h2>
                  <button class="btn btn-danger" onclick="DOMManager.deleteHouse('${house._id}')">Delete</button>
               </div>
               <div class="card-body">
                  <div class="card">
                     <div class="row">
                        <div class="col-sm">
                           <input type="text" id="${house._id}-room-name" class="form-control" placeholder="Room Name">
                        </div>
                        <div class="col-sm">
                           <input type="text" id="${house._id}-room-area" class="form-control" placeholder="Room Area">
                        </div>
                     </div>
                     <button id="${house._id}-new-room" onclick="DOMManager.addRoom('${house._id}')" class="btn btn-primary form-control">Add</button>
                  </div>
               </div>
            </div><br>`
         );
      }
      for (let room of house.rooms) { //for loop to add rooms to the houses
         $(`#${house._id}`).find(".card-body").append(
            `<p>
               <span id="name-${room._id}"><strong>Name: </strong> ${room.name}</span>
               <span id="area-${room._id}"><strong>Area: </strong> ${room.area}</span>
               <button class="btn btn-danger" onclick="DOMManager.deleteRoom('${house._id}', '${room._id}')">Delete Room</button>
               `
         );
      }
   }
}

$("#create-new-house").click(() => {
   DOMManager.createHouse($("#new-house-name").val());
   $("#new-house-name").val("");
});

DOMManager.getAllHouses();