/**
 * Created by elliot on 29/03/2017.
 */

var dKDBMApp = angular.module('dKDBMApp', ['ngRoute', 'ngResource'])
    .config(function ($routeProvider) {
        $routeProvider.when(
            "/login", {
                templateUrl: "templates/login.html",
                controller: 'loginController'
            }
        ).when(
            "/drinks", {
                templateUrl: "templates/drinks.html",
                controller: 'drinksController'
            }
        ).when(
            "/drink/:id", {
                templateUrl: "templates/drink.html",
                controller: 'drinkController'
            }
        ).otherwise("/login");
    });

dKDBMApp.controller('loginController', function($scope, $timeout, $document, $location){
    $document.ready(fadeViewIn);
    $timeout(openDoors, 1000);
    $scope.test = "TEST";
    console.log("Doing ready");
    $scope.doLogin = function(){
        console.log("Doing login");
        closeDoors();
        $timeout(function () {
            var login = false;
            if(true){
                fadeView(false);
                $timeout(function () {
                    $location.path("/drinks");
                }, 1000);
            } else {
                openDoors();
            }
        }, 1200);

    }

}).controller('drinksController', function ($scope, $location, $document) {
    $document.ready(fadeViewIn);
    $scope.drinks = [
        {
            name: 'Drink 1',
            id: 1,
            description: 'This is drink 1',
            url: 'http://46.101.52.91/drinKit/images/13.png'
        },
        {
            name: 'Drink 2',
            id: 2,
            description: 'This is drink 2',
            url: 'http://46.101.52.91/drinKit/images/13.png'
        },
        {
            name: 'Drink 3',
            id: 3,
            description: 'This is drink 3',
            url: 'http://46.101.52.91/drinKit/images/13.png'
        },
        {
            name: 'Drink 4',
            id: 4,
            description: 'This is drink 4',
            url: 'http://46.101.52.91/drinKit/images/13.png'
        },
        {
            name: 'Drink 5',
            id: 5,
            description: 'This is drink 5',
            url: 'http://46.101.52.91/drinKit/images/13.png'
        },
        {
            name: 'Drink 6',
            id: 6,
            description: 'This is drink 6',
            url: 'http://46.101.52.91/drinKit/images/13.png'
        },
        {
            name: 'Drink 7',
            id: 7,
            description: 'This is drink 7',
            url: 'http://46.101.52.91/drinKit/images/13.png'
        }
    ];

    $scope.goToDrink = function (id) {
        $location.path("drink/"+id);
    }


}).controller('drinkController', function ($scope, $routeParams) {
    $document.ready(fadeViewIn);
    $scope.drink = {
        newImage:"No new image selected."
    };
    $scope.types = [
        {
            ID:1,
            Name:"Cocktail"
        },
        {
            ID:2,
            Name:"Mocktail"
        },
        {
            ID:3,
            Name:"Smoothie"
        },
        {
            ID:4,
            Name:"Milkshake"
        }
    ];
    $scope.tab = "general";
    $scope.goToTab = function (target) {
        $('.'+$scope.tab).removeClass("active");
        $('.'+target).addClass("active");
        $scope.tab = target;
    }
}).controller('appController', function ($scope, $location) {
    $location.path("login");
});

function openDoors(){
    $(".login-door-top").animate({top:-150}, 1000, "easeInOutCubic");
    $(".login-door-bottom").animate({bottom:-150}, 1000, "easeInOutCubic");
}

function closeDoors(){
    $(".login-door-top").animate({top:0}, 1000, "easeInOutCubic");
    $(".login-door-bottom").animate({bottom:0}, 1000, "easeInOutCubic");
}
function fadeViewIn(){
    fadeView(true);
}
function fadeView(fadeIn){
    if(fadeIn){
        $(".view-wrapper").animate({opacity:1.0},1000);
    } else {
        $(".view-wrapper").animate({opacity:0.0},1000);
    }
}