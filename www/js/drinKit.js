/** Created by elliot on 29/03/2017. The behaviour for the tool */ let authKey = "";
let dKDBMApp = angular.module('dKDBMApp', ['ngRoute', 'ngResource']).config(function ($routeProvider) {
    $routeProvider.when("/login", {
        templateUrl: "templates/login.html",
        controller: 'loginController'
    }).when("/drinks", {
        templateUrl: "templates/drinks.html",
        controller: 'drinksController'
    }).when("/drink/:id", {templateUrl: "templates/drink.html", controller: 'drinkController'}).otherwise("/login");
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
                $.post("https://drinkit.pro/api/auth", {USER: username, PASS: password}, function () {
                }).done(function (data) {
                    authKey = data;
                    fadeView(false);
                    $timeout(function () {
                        $location.path("/drinks");
                    }, 1000);
                }).fail(function () {
                    userbox.addClass("failed");
                    passbox.addClass("failed");
                    openDoors();
                });
            }, 1200);
        };
    })
    .controller('drinksController', function ($scope, $location, $document, $timeout, $rootScope) {
        $document.ready(function () {
            $scope.reload();
            fadeViewIn();
        });
        $rootScope.drinks = [];
        $(".drinks").isotope();
        $scope.reload = function () {
            $.get("https://drinkit.pro/api/type").done(function (data) {
                delete $rootScope.types;
                $rootScope.types = data;
            });
            $.get("https://drinkit.pro/api/ingredient").done(function (data) {
                delete $rootScope.ingredients;
                $rootScope.ingredients = data;
            });
            $.get("https://drinkit.pro/api/measurement/type").done(function (data) {
                delete $rootScope.measurementTypes;
                $rootScope.measurementTypes = data;
                for (let i = 0; i < $rootScope.measurementTypes.length; i++) {
                    $rootScope.measurementTypes[i].measurements = [];
                }
                console.log($rootScope.measurementTypes);
                $.get("https://drinkit.pro/api/measurement").done(function (data) {
                    console.log($rootScope.measurementTypes);
                    for (let i = 0; i < data.length; i++) {
                        for (let j = 0; j < $rootScope.measurementTypes.length; j++) {
                            if (data[i].TypeID == $rootScope.measurementTypes[j].ID) {
                                $rootScope.measurementTypes[j].measurements[$rootScope.measurementTypes[j].measurements.length] = data[i];
                                break;
                            }
                        }
                    }
                    console.log($rootScope.measurementTypes);
                });
            });
            $.get("https://drinkit.pro/api/drink").done(function (data) {
                delete $rootScope.drinks;
                $rootScope.drinks = data;
                for (let i = 0; i < $rootScope.drinks.length; i++) {
                    addURL(i);
                }
                $scope.$apply();
                let drinks = $(".drinks");
                drinks.isotope('destroy');
                drinks.isotope();
            });
            $.get("https://drinkit.pro/api/equipment").done(function (data) {
                delete $rootScope.equipment;
                $rootScope.equipment = data;
            });
        };

        $scope.createDrink = function () {
            $.post("https://drinkit.pro/api/drink", {
                AUTH: authKey,
                NAME: "",
                FLAVOURTEXT: "",
                DESCRIPTION: "",
                TYPEID: 1
            }).done(function (data) {
                fadeView();
                $timeout(function () {
                    $scope.reload();
                    $scope.$apply();
                    $scope.goToDrink(data[data.length - 1].ID);
                }, 1000);
            });
        };
        function goto(id) {
            $location.path("/drink/" + id);
        };
        function addURL(i) {
            $.get("https://drinkit.pro/api/drink/image/" + $rootScope.drinks[i].ID).then(function (data) {
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
    })
    .controller('drinkController', function ($scope, $routeParams, $document, $rootScope, $location, $timeout) {
        $scope.goBack = function () {
            fadeView();
            $timeout(function () {
                $location.path("drinks/");
            }, 1000);
        };
        $scope.selectStep = function (index) {
            $scope.step = index;
        };
        $scope.addStepToUpdate = function () {
            if (!$scope.steps[$scope.step].Method) {
                $scope.steps[$scope.step].Method = "PUT";
            }
        };
        $scope.addIngredientToUpdate = function () {
            if (!$scope.ingredients[$scope.ingredient].Method) {
                $scope.ingredients[$scope.ingredient].Method = "PUT";
            }
        };
        $scope.deleteStep = function () {
            $scope.steps[$scope.step].Method = 'DELETE';
            for (let i = $scope.step; i >= 0; i--) {
                if ($scope.steps[i].Method != "DELETE") {
                    $scope.step = i;
                    return;
                }
            }
            for (let i = $scope.step; i < $scope.steps.length; i++) {
                if ($scope.steps[i].Method != "DELETE") {
                    $scope.step = i;
                    return;
                }
            }
            $scope.step = null;
        };
        $scope.deleteIngredient = function () {
            $scope.ingredients[$scope.ingredient].Method = 'DELETE';
            for (let i = $scope.ingredient; i >= 0; i--) {
                if ($scope.ingredients[i].Method != "DELETE") {
                    $scope.ingredient = i;
                    return;
                }
            }
            for (let i = $scope.ingredient; i < $scope.ingredients.length; i++) {
                if ($scope.ingredients[i].Method != "DELETE") {
                    $scope.ingredient = i;
                    return;
                }
            }
            $scope.ingredient = null;
        };

        $scope.createStep = function () {
            $scope.steps[$scope.steps.length] = {Method: "POST", Text: ""};
            $scope.step = $scope.steps.length - 1;
        };
        $scope.runUpdate = function () {
            $.ajax({
                url: "https://drinkit.pro/api/drink/" + $scope.drink.ID,
                method: 'PUT',
                data: {
                    NAME: $scope.drink.Name,
                    DESCRIPTION: $scope.drink.Description,
                    FLAVOURTEXT: $scope.drink.FlavourText,
                    TYPEID: $scope.type.ID,
                    AUTH: authKey
                }
            });
            submitDrinkSteps($scope.drink.ID, $scope.steps);
            submitDrinkIngredients($scope.drink.ID, $scope.ingredients);
            $scope.goBack();
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
            for (let i = 0; i < $rootScope.types.length; i++) {
                if ($rootScope.types[i].ID == $scope.drink.DrinkTypeID) {
                    $scope.type = $rootScope.types[i];
                    break;
                }
            }
            $scope.step = null;
            $.get("https://drinkit.pro/api/drink/" + $scope.drink.ID + "/step").done(function (data) {
                $scope.steps = data;
                if ($scope.steps[0]) {
                    $scope.step = 0;
                }
                $scope.$apply();
            });
            $.get("https://drinkit.pro/api/drink/" + $scope.drink.ID + "/ingredient").done(function (data) {
                $scope.ingredients = data;
                if ($scope.ingredients[0]) {
                    $scope.ingredient = 0;
                }
                for (var i = 0; i < $scope.ingredients.length; i++) {
                    for (var j = 0; j < $rootScope.ingredients.length; j++) {
                        if ($scope.ingredients[i].ID == $rootScope.ingredients[j].ID) {
                            $scope.ingredients[i].ingredient = $rootScope.ingredients[j];
                            break;
                        }
                    }
                    for (var j = 0; j < $rootScope.measurementTypes.length; j++) {
                        if ($scope.ingredients[i].TypeID == $rootScope.measurementTypes[j].ID) {
                            $scope.ingredients[i].mType = $rootScope.measurementTypes[j];
                            break;
                        }
                    }
                    for (var j = 0; j < $scope.ingredients[i].mType.measurements.length; j++) {
                        if ($scope.ingredients[i].mName == $scope.ingredients[i].mType.measurements[j].Name) {
                            $scope.ingredients[i].measurement = $scope.ingredients[i].mType.measurements[j];
                            break;
                        }
                    }
                    $scope.ingredients[i].Amount = Math.ceil($scope.ingredients[i].Amount / $scope.ingredients[i].Multiplier);
                }
                $scope.$apply();
            });
            $.get("https://drinkit.pro/api/drink/" + $scope.drink.ID + "/equipment").done(function (data) {
                $scope.equipmentz = data;
                if($scope.equipmentz[0]){
                    $scope.equipment = 0;
                }
                $scope.$apply();
            });
            $scope.$apply();
            fadeViewIn();
        });

        $scope.selectIngredient = function (index) {
            $scope.ingredient = index;
        }

        $scope.createIngredient = function () {
            $scope.ingredients[$scope.ingredients.length] = {Method: "POST", Name: "-New-", Unit: "--"};
            $scope.ingredient = $scope.ingredients.length - 1;
            console.log($scope.ingredients);
        }

        $scope.tab = "general";
        $scope.goToTab = function (target) {
            let oldTab = '.' + $scope.tab;
            let newTab = '.' + target;
            $(oldTab).removeClass("button-active-view");
            $(newTab).addClass("button-active-view");
            $scope.tab = target;
        };
    })
    .controller('appController', function ($scope, $location) {
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
function submitDrinkSteps(drinkID, stepsList) {
    for (let i = 0; i < stepsList.length; i++) {
        switch (stepsList[i].Method) {
            case "POST":
                $.ajax({
                    url: "https://drinkit.pro/api/drink/" + drinkID + "/step",
                    method: 'POST',
                    data: {AUTH: authKey, TEXT: stepsList[i].Text}
                });
                break;
            case "PUT":
                $.ajax({
                    url: "https://drinkit.pro/api/drink/" + drinkID + "/step/" + stepsList[i].ID,
                    method: 'PUT',
                    data: {AUTH: authKey, TEXT: stepsList[i].Text}
                });
                break;
            case "DELETE":
                $.ajax({
                    url: "https://drinkit.pro/api/drink/" + drinkID + "/step/" + stepsList[i].ID,
                    method: 'DELETE',
                    data: {AUTH: authKey}
                });
                break;
            default:
                break;
        }
    }
}
function submitDrinkIngredients(drinkID, ingredientsList) {
    for (let i = 0; i < ingredientsList.length; i++) {
        switch (ingredientsList[i].Method) {
            case "POST":
                $.ajax({
                    url: "https://drinkit.pro/api/drink/" + drinkID + "/ingredient",
                    method: 'POST',
                    data: {
                        AUTH: authKey,
                        MEASUREMENTID: ingredientsList[i].measurement.ID,
                        INGREDIENTID: ingredientsList[i].ingredient.ID,
                        AMOUNT: ingredientsList[i].Amount * ingredientsList[i].measurement.Multiplier
                    }
                });
                break;
            case "PUT":
                $.ajax({
                    url: "https://drinkit.pro/api/drink/" + drinkID + "/ingredient/" + ingredientsList[i].ID,
                    method: 'PUT',
                    data: {
                        AUTH: authKey,
                        MEASUREMENTID: ingredientsList[i].measurement.ID,
                        INGREDIENTID: ingredientsList[i].ingredient.ID,
                        AMOUNT: ingredientsList[i].Amount * ingredientsList[i].measurement.Multiplier
                    }
                });
                break;
            case "DELETE":
                $.ajax({
                    url: "https://drinkit.pro/api/drink/" + drinkID + "/ingredient/" + ingredientsList[i].ID,
                    method: 'DELETE',
                    data: {
                        AUTH: authKey
                    }
                });
                break;
            default:
                break;
        }
    }
}
