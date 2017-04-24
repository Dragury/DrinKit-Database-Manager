/**
 * Created by elliot on 29/03/2017.
 *
 * The behaviour for the tool
 */

let authKey = "";

let dKDBMApp = angular.module('dKDBMApp', ['ngRoute', 'ngResource'])
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

dKDBMApp
    .controller('loginController', function ($scope, $timeout, $document, $location, $rootScope) {
        $document.ready(fadeViewIn);
        $timeout(openDoors, 1000);
        $scope.doLogin = function () {
            closeDoors();
            let userbox = $("#username-box");
            let passbox = $("#password-box");
            $timeout(function () {
                let username = userbox.val();
                let password = passbox.val();
                passbox.val("");
                $.post(
                    "https://drinkit.pro/api/auth",
                    {
                        USER: username,
                        PASS: password
                    }, function () {
                    }).done(
                    function (data) {
                        authKey = data;
                        fadeView(false);
                        $.get("https://drinkit.pro/api/type").done(function (data) {
                            $rootScope.types = data;
                        });
                        $timeout(function () {
                            $location.path("/drinks");
                        }, 1000);
                    }
                ).fail(function () {
                    userbox.addClass("failed");
                    passbox.addClass("failed");
                    openDoors();
                });
            }, 1200);

        };

    })

    .controller('drinksController', function ($scope, $location, $document, $timeout, $rootScope) {
        $document.ready(fadeViewIn);
        $rootScope.drinks = [];
        $(".drinks").isotope();

        $scope.reload = function () {
            $.get(
                "https://drinkit.pro/api/drink"
            ).done(function (data) {
                $rootScope.drinks = data;
                for (let i = 0; i < $rootScope.drinks.length; i++) {
                    addURL(i);
                }
                $scope.$apply();
                let drinks = $(".drinks");
                drinks.isotope('destroy');
                drinks.isotope();
            });
        };

        function addURL(i) {
            $.get(
                "https://drinkit.pro/api/drink/image/" + $rootScope.drinks[i].ID
            ).done(function (data) {
                $rootScope.drinks[i].URL = data;
                $scope.$apply();
            });
        }

        $scope.goToDrink = function (id) {
            fadeView(false);
            $timeout(function () {
                $location.path("drink/" + id);
            }, 1000);
        };

        $scope.reload();


    })

    .controller('drinkController', function ($scope, $routeParams, $document, $rootScope, $location, $timeout) {

        $scope.goBack = function () {
            fadeView();
            $timeout(function () {
                $location.path("drinks/")
            }, 1000);
        };


        $document.ready(function () {
            for (let i = 0; i < $rootScope.drinks.length; i++) {
                if ($rootScope.drinks[i].ID == $routeParams.id) {
                    $scope.drink = $rootScope.drinks[i];
                    console.log($scope.drink);
                    $scope.drink.newImage = "No new image selected.";
                    break;
                }
            }
            for(let i = 0; i < $rootScope.types.length; i++){
                if($rootScope.types[i].ID == $scope.drink.DrinkTypeID ){
                    $scope.type = $rootScope.types[i];
                    break;
                }
            }
            $.get("https://drinkit.pro/api/drink/"+$scope.drink.ID+"/step").done(function(data){
                $scope.steps = data;
                $scope.$apply();
            });
            $scope.$apply();
            fadeViewIn();
        });
        $scope.tab = "general";
        $scope.goToTab = function (target) {
            let oldTab = '.' + $scope.tab;
            let newTab = '.' + target;
            $(oldTab).removeClass("button-active-view");
            $(newTab).addClass("button-active-view");
            $scope.tab = target;
        };
    }).controller('appController', function ($scope, $location) {
    $location.path("login");
});

function openDoors() {
    $(".login-door-top").animate({top: -150}, 1000, "easeInOutCubic");
    $(".login-door-bottom").animate({bottom: -150}, 1000, "easeInOutCubic");
}

function closeDoors() {
    $(".login-door-top").animate({top: 0}, 1000, "easeInOutCubic");
    $(".login-door-bottom").animate({bottom: 0}, 1000, "easeInOutCubic");
}
function fadeViewIn() {
    fadeView(true);
}
function fadeView(fadeIn) {
    if (fadeIn) {
        $(".view-wrapper").animate({opacity: 1.0}, 1000);
    } else {
        $(".view-wrapper").animate({opacity: 0.0}, 1000);
    }
}