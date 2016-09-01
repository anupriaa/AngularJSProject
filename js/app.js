//same as ng-app name in index.html
var app = angular.module("practiceToDoApp",["ngRoute"]);

//To implement the routing
app.config(function($routeProvider){
    $routeProvider
        .when("/", {
            templateUrl: "views/toDoList.html",
            controller: "HomeController"
        })
        .when("/addItem", {
            templateUrl: "views/addItem.html",
            controller: "ToDoListItemsController"
        })
        //To pass parameters
        .when("/addItem/edit/:id/", {
            templateUrl: "views/addItem.html",
            controller: "ToDoListItemsController"
        })
        .otherwise({
            redirectTo: "/"
        })
});
//service for the todo list
app.service("ToDoService", function($http){
    var toDoService = {};
    toDoService.toDoListItems = [
        {id: 1, completed: false, itemName: 'Get Milk', date: new Date("October 1, 2016 11:13:00")},
        {id: 2, completed: false, itemName: 'Get maggi', date: new Date("October 10, 2016 11:13:00")},
        {id: 3, completed: false, itemName: 'Get abc', date: new Date("October 16, 2016 11:13:00")},
        {id: 4, completed: false, itemName: 'Get xyz', date: new Date("October 21, 2016 11:13:00")},
        {id: 5, completed: false, itemName: 'Get water', date: new Date("October 15, 2016 11:13:00")}
    ];
    $http.get("data/server_data.json")
        .success(function(data){
            toDoService.toDoListItems = data;
            for(item in toDoService.toDoListItems){
                toDoService.toDoListItems[item].date = new Date(toDoService.toDoListItems[item].date)
            }
        })
        .error(function(data,status){
            alert("Something's wrong");
        });


    //function to find an item by id
    toDoService.findById = function(id) {
        for(var item in toDoService.toDoListItems){
            if(toDoService.toDoListItems[item].id == id){
                return toDoService.toDoListItems[item];
            }
        }
    };
    //function to generate id because the app is offline
    //else server would generate it.
    toDoService.getNewId = function() {
        if(toDoService.newId){
            toDoService.newId++;
            return toDoService.newId;
        }else{
            var maxId = _.max(toDoService.toDoListItems, function(entry) {
                return entry.id;
            });
            toDoService.newId = maxId + 1;
            return toDoService.newId;
        }
    };
    toDoService.save = function(entry){
        var update = toDoService.findById(entry.id);
        //check if entry present then update else create new.
        if(update){
            $http.post("data/updated_item.json", entry)
                .success(function(data){
                    if(data.status == 1){
                        _.extend(update, entry);
                        /*update.completed = entry.completed;
                         update.itemName = entry.itemName;
                         update.date = entry.date;*/
                    }
                })
                .error(function(data, status){
                    if(data.status == 0){
                        alert("failure");
                    }
                });
        }else {
            $http.post("data/added_item.json", entry)
                .success(function(data){
                    //server creating ids
                    entry.id = data.newId;
                })
                .error(function(data, status){

                });
            //creating ids client side
            //entry.id = toDoService.getNewId();
            toDoService.toDoListItems.push(entry);
        }
    };
    //function to delete entry
    toDoService.delete = function(entry){
        //can use post or delete.
        $http.post("data/delete_item.json", {id: entry.id})
            .success(function(data){
                if(data.status == 1){
                    var index = toDoService.toDoListItems.indexOf(entry);
                    toDoService.toDoListItems.splice(index,1);
                }
            })
            .error(function(data, status){
                if(status == 0){
                    alert("failure")
                }
            });


    };

    //To check if an item has been completed.
    toDoService.markCompleted = function(entry){
        entry.completed = !entry.completed;
    };
    return toDoService;

});
//Controller for home page. Will go in the body.
app.controller("HomeController", ["$scope", "ToDoService", function($scope, ToDoService) {
    //$scope.appTitle = "To Do List";
    $scope.toDoListItems = ToDoService.toDoListItems;

    console.log($scope.toDoListItems);

    //To remove items
    $scope.delete = function(entry) {
        ToDoService.delete(entry);
    };

    //To mark an item completed or not
    $scope.markCompleted = function(entry) {
        ToDoService.markCompleted(entry);
    };

    //
    $scope.$watch(function(){
        return ToDoService.toDoListItems;
        },
        function (toDoListItems) {
            $scope.toDoListItems = toDoListItems;
        });

}]);

//Controller for individual list items.
app.controller("ToDoListItemsController", ["$scope", "$routeParams", "$location", "ToDoService", function($scope, $routeParams, $location, ToDoService) {
    //to differentiate between edit and adding new entry check route params
    if(!$routeParams) {
        $scope.toDoItem = {id: 0, completed: true, itemName: "", date: new Date()};
    }else{
        $scope.toDoItem = _.clone(ToDoService.findById(parseInt($routeParams.id)));
    }
    //Save function is called when item is saved on add item page.
    $scope.save = function() {
      //defining function in service for modularity.
        ToDoService.save($scope.toDoItem);
        //this will route to home page
        $location.path("/");
    };
    //to debug print on dev tool console.
    //console.log($scope.toDoListItems);

    //To print a value. Print as an expression in html
    //$scope.temp = "Route parameter = "+ $routeParams.id;
}]);

app.directive("apToDoItems", function(){
    return{
        restrict: "E",
        templateUrl: "views/toDoItems.html"
    }
});