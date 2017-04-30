/** Created by elliot on 29/03/2017. The behaviour for the tool */ let authKey = "";
let dKDBMApp = angular.module('dKDBMApp', ['ngRoute', 'ngResource']).config(function ($routeProvider) {
    $routeProvider.when("/login", {
        templateUrl: "templates/login.html",
        controller: 'loginController'
    }).when("/drinks", {
        templateUrl: "templates/drinks.html",
        controller: 'drinksController'
    }).when("/drink/:id", {
        templateUrl: "templates/drink.html",
        controller: 'drinkController'
    }).when("/skills", {
        templateUrl: "templates/skills.html",
        controller: 'skillsController'
    }).when("/skill/:id", {
        templateUrl: "templates/skill.html",
        controller: 'skillController'
    }).otherwise("/login");
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
        $rootScope.drinks = [];
        $(".drinks").isotope();

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
        $scope.goToDrink = function (id) {
            fadeView(false);
            $timeout(function () {
                $location.path("drink/" + id);
            }, 1000);
        };
        $scope.goToSkills = function () {
            fadeView();
            $timeout(function () {
                $location.path("skills/");
            }, 1000);
        };
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
            $.get("https://drinkit.pro/api/flag").done(function (data) {
                delete $rootScope.flags;
                $rootScope.flags = data;
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
            $.get("https://drinkit.pro/api/skill").done(function (data) {
                delete $rootScope.skills;
                $rootScope.skills = data;
            });
        };

        $document.ready(function () {
            $scope.reload();
            fadeViewIn();
        });

        function addURL(i) {
            $.get("https://drinkit.pro/api/drink/" + $rootScope.drinks[i].ID + "/image").then(function (data) {
                $rootScope.drinks[i].URL = data;
                $scope.$apply();
            });
        }
    })
    .controller('skillsController', function ($scope, $location, $document, $timeout, $rootScope) {
        $rootScope.skills = [];
        $(".skills").isotope();

        $scope.createSkill = function () {
            $.post("https://drinkit.pro/api/skill", {
                AUTH: authKey,
                NAME: "",
                DIFFICULTYID: 1
            }).done(function (data) {
                fadeView();
                $timeout(function () {
                    $scope.reload();
                    $scope.$apply();
                    $scope.goToSkill(data[data.length - 1].ID);
                }, 1000);
            });
        };
        $scope.goToSkill = function (id) {
            fadeView(false);
            $timeout(function () {
                $location.path("skill/" + id);
            }, 1000);
        };
        $scope.goToDrinks = function () {
            fadeView();
            $timeout(function () {
                $location.path("drinks/");
            }, 1000);
        };
        $scope.reload = function () {
            $.get("https://drinkit.pro/api/skill/difficulty").done(function (data) {
                delete $rootScope.types;
                $rootScope.difficulties = data;
            });
            $.get("https://drinkit.pro/api/skill").done(function (data) {
                delete $rootScope.skills;
                $rootScope.skills = data;
                $scope.$apply();
                let skills = $(".skills");
                skills.isotope('destroy');
                skills.isotope();
            });
        };

        $document.ready(function () {
            $scope.reload();
            fadeViewIn();
        });
    })
    .controller('drinkController', function ($scope, $routeParams, $document, $rootScope, $location, $timeout) {
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
            submitDrinkEquipment($scope.drink.ID, $scope.equipmentz);
            submitDrinkFlags($scope.drink.ID, $scope.flags);
            submitDrinkSkills($scope.drink.ID, $scope.skills);
            uploadDrinkImage($scope.drink.ID, $(".image-path").val());
            $scope.goBack();
        };
        $scope.goBack = function () {
            fadeView();
            $timeout(function () {
                $location.path("drinks/");
            }, 1000);
        };
        $scope.deleteDrink = function () {
            $.ajax({
                url: "https://drinkit.pro/api/drink/" + $scope.drink.ID,
                method: "DELETE",
                data: {
                    AUTH : authKey,
                }
            });
            $scope.goBack();
        };

        $scope.selectStep = function (index) {
            $scope.step = index;
        };
        $scope.createStep = function () {
            $scope.steps[$scope.steps.length] = {Method: "POST", Text: ""};
            $scope.step = $scope.steps.length - 1;
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
        $scope.addStepToUpdate = function () {
            if (!$scope.steps[$scope.step].Method) {
                $scope.steps[$scope.step].Method = "PUT";
            }
        };

        $scope.selectEquipment = function (index) {
            $scope.equipment = index;
        };
        $scope.createEquipment = function () {
            $scope.equipmentz[$scope.equipmentz.length] = {Method: "POST"};
            $scope.equipment = $scope.equipmentz.length - 1;
            $scope.equipmentz[$scope.equipment].e = {};
            $scope.equipmentz[$scope.equipment].e.Text = "None Selected";
        };
        $scope.deleteEquipment = function () {
            $scope.equipmentz[$scope.equipment].Method = 'DELETE';
            for (let i = $scope.equipment; i >= 0; i--) {
                if ($scope.equipmentz[i].Method != "DELETE") {
                    $scope.equipment = i;
                    return;
                }
            }
            for (let i = $scope.equipment; i < $scope.equipmentz.length; i++) {
                if ($scope.equipmentz[i].Method != "DELETE") {
                    $scope.equipment = i;
                    return;
                }
            }
            $scope.equipment = null;
        };
        $scope.addEquipmentToUpdate = function () {
            if (!$scope.equipmentz[$scope.equipment].Method) {
                $scope.equipmentz[$scope.equipment].Method = "PUT";
            }
            console.log($scope.equipmentz[$scope.equipment]);
        };

        $scope.selectFlag = function (index) {
            $scope.flag = index;
        };
        $scope.createFlag = function () {
            $scope.flags[$scope.flags.length] = {Method: "POST"};
            $scope.flag = $scope.flags.length - 1;
            $scope.flags[$scope.flag].f = {};
            $scope.flags[$scope.flag].f.Text = "None Selected";
        };
        $scope.deleteFlag = function () {
            $scope.flags[$scope.flag].Method = 'DELETE';
            for (let i = $scope.flag; i >= 0; i--) {
                if ($scope.flags[i].Method != "DELETE") {
                    $scope.flag = i;
                    return;
                }
            }
            for (let i = $scope.flag; i < $scope.flags.length; i++) {
                if ($scope.flags[i].Method != "DELETE") {
                    $scope.flag = i;
                    return;
                }
            }
            $scope.flag = null;
        };
        $scope.addFlagsToUpdate = function () {
            if (!$scope.flags[$scope.flag].Method) {
                $scope.flags[$scope.flag].Method = "PUT";
            }
            console.log($scope.flags[$scope.flag]);
        };

        $scope.selectSkill = function (index) {
            $scope.skill = index;
        };
        $scope.createSkill = function () {
            $scope.skills[$scope.skills.length] = {Method: "POST"};
            $scope.skill = $scope.skills.length - 1;
            $scope.skills[$scope.skill].s = {};
            $scope.skills[$scope.skill].s.Name = "None Selected";
        };
        $scope.deleteSkill = function () {
            $scope.skills[$scope.skill].Method = 'DELETE';
            for (let i = $scope.skill; i >= 0; i--) {
                if ($scope.skills[i].Method != "DELETE") {
                    $scope.skill = i;
                    return;
                }
            }
            for (let i = $scope.skill; i < $scope.skills.length; i++) {
                if ($scope.skills[i].Method != "DELETE") {
                    $scope.skill = i;
                    return;
                }
            }
            $scope.skill = null;
        };
        $scope.addSkillsToUpdate = function () {
            if (!$scope.skills[$scope.skill].Method) {
                $scope.skills[$scope.skill].Method = "PUT";
            }
            console.log($scope.skills[$scope.skill]);
        };

        $scope.selectIngredient = function (index) {
            $scope.ingredient = index;
        };
        $scope.createIngredient = function () {
            $scope.ingredients[$scope.ingredients.length] = {Method: "POST", Name: "-New-", Unit: "--"};
            $scope.ingredient = $scope.ingredients.length - 1;
            console.log($scope.ingredients);
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
        $scope.addIngredientToUpdate = function () {
            if (!$scope.ingredients[$scope.ingredient].Method) {
                $scope.ingredients[$scope.ingredient].Method = "PUT";
            }
        };

        $scope.tab = "general";
        $scope.goToTab = function (target) {
            let oldTab = '.' + $scope.tab;
            let newTab = '.' + target;
            $(oldTab).removeClass("button-active-view");
            $(newTab).addClass("button-active-view");
            $scope.tab = target;
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
                $scope.step = null;
                if ($scope.steps[0]) {
                    $scope.step = 0;
                }
                $scope.$apply();
            });
            $.get("https://drinkit.pro/api/drink/" + $scope.drink.ID + "/ingredient").done(function (data) {
                $scope.ingredients = data;
                $scope.ingredient = null;
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
                for (var i = 0; i < $scope.equipmentz.length; i++) {
                    for (var j = 0; j < $rootScope.equipment.length; j++) {
                        if ($scope.equipmentz[i].ID == $rootScope.equipment[j].ID) {
                            $scope.equipmentz[i].e = $rootScope.equipment[j];
                            break;
                        }
                    }
                }
                $scope.equipment = null;
                if ($scope.equipmentz[0]) {
                    $scope.equipment = 0;
                }
                $scope.$apply();
            });
            $.get("https://drinkit.pro/api/drink/" + $scope.drink.ID + "/flag").done(function (data) {
                $scope.flags = data;
                for (var i = 0; i < $scope.flags.length; i++) {
                    for (var j = 0; j < $rootScope.flags.length; j++) {
                        if ($scope.flags[i].ID == $rootScope.flags[j].ID) {
                            $scope.flags[i].f = $rootScope.flags[j];
                            break;
                        }
                    }
                }
                $scope.flag = null;
                if ($scope.flags[0]) {
                    $scope.flag = 0;
                }
                $scope.$apply();
            });
            $.get("https://drinkit.pro/api/drink/" + $scope.drink.ID + "/skill").done(function (data) {
                $scope.skills = data;
                for (var i = 0; i < $scope.skills.length; i++) {
                    for (var j = 0; j < $rootScope.skills.length; j++) {
                        if ($scope.skills[i].ID == $rootScope.skills[j].ID) {
                            $scope.skills[i].s = $rootScope.skills[j];
                            break;
                        }
                    }
                }
                $scope.skill = null;
                if ($scope.skills[0]) {
                    $scope.skill = 0;
                }
                $scope.$apply();
            });
            $scope.$apply();
            fadeViewIn();
        });
    })
    .controller('skillController', function ($scope, $routeParams, $document, $rootScope, $location, $timeout) {
        $scope.runUpdate = function () {
            $.ajax({
                url: "https://drinkit.pro/api/skill/" + $scope.skill.ID,
                method: 'PUT',
                data: {
                    NAME: $scope.skill.Name,
                    DIFFICULTYID: $scope.skill.d.ID,
                    AUTH: authKey
                }
            });
            submitSkillSteps($scope.skill.ID, $scope.steps);
            $scope.goBack();
        };
        $scope.goBack = function () {
            fadeView();
            $timeout(function () {
                $location.path("skills/");
            }, 1000);
        };
        $scope.deleteSkill = function () {
            $.ajax({
                url: "https://drinkit.pro/api/skill/" + $scope.skill.ID,
                method: "DELETE",
                data: {
                    AUTH : authKey,
                }
            });
            $scope.goBack();
        };

        $scope.selectStep = function (index) {
            $scope.step = index;
        };
        $scope.createStep = function () {
            $scope.steps[$scope.steps.length] = {Method: "POST", Text: ""};
            $scope.step = $scope.steps.length - 1;
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
        $scope.addStepToUpdate = function () {
            if (!$scope.steps[$scope.step].Method) {
                $scope.steps[$scope.step].Method = "PUT";
            }
        };

        $scope.tab = "general";
        $scope.goToTab = function (target) {
            let oldTab = '.' + $scope.tab;
            let newTab = '.' + target;
            $(oldTab).removeClass("button-active-view");
            $(newTab).addClass("button-active-view");
            $scope.tab = target;
        };

        $document.ready(function () {

            console.log($rootScope.types);
            for (let i = 0; i < $rootScope.skills.length; i++) {
                if ($rootScope.skills[i].ID == $routeParams.id) {
                    $scope.skill = $rootScope.skills[i];
                    console.log($scope.skill);
                    break;
                }
            }
            for(let i = 0; i < $rootScope.difficulties.length; i++) {
                if($scope.skill.DifficultyID == $rootScope.difficulties[i].ID){
                    $scope.skill.d = $rootScope.difficulties[i];
                    break;
                }
            }
            $scope.step = null;
            $.get("https://drinkit.pro/api/skill/" + $scope.skill.ID + "/step").done(function (data) {
                $scope.steps = data;
                $scope.step = null;
                if ($scope.steps[0]) {
                    $scope.step = 0;
                }
                $scope.$apply();
            });
            $scope.$apply();
            fadeViewIn();
        });
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
function submitSkillSteps(drinkID, stepsList) {
    for (let i = 0; i < stepsList.length; i++) {
        switch (stepsList[i].Method) {
            case "POST":
                $.ajax({
                    url: "https://drinkit.pro/api/skill/" + drinkID + "/step",
                    method: 'POST',
                    data: {AUTH: authKey, TEXT: stepsList[i].Text}
                });
                break;
            case "PUT":
                $.ajax({
                    url: "https://drinkit.pro/api/skill/" + drinkID + "/step/" + stepsList[i].ID,
                    method: 'PUT',
                    data: {AUTH: authKey, TEXT: stepsList[i].Text}
                });
                break;
            case "DELETE":
                $.ajax({
                    url: "https://drinkit.pro/api/skill/" + drinkID + "/step/" + stepsList[i].ID,
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
function submitDrinkEquipment(drinkID, equipmentList) {
    for (let i = 0; i < equipmentList.length; i++) {
        switch (equipmentList[i].Method) {
            case "POST":
                $.ajax({
                    url: "https://drinkit.pro/api/drink/" + drinkID + "/equipment",
                    method: 'POST',
                    data: {
                        AUTH: authKey,
                        EQUIPMENTID: equipmentList[i].e.ID,
                    }
                });
                break;
            case "PUT":
                $.ajax({
                    url: "https://drinkit.pro/api/drink/" + drinkID + "/equipment/" + equipmentList[i].ID,
                    method: 'DELETE',
                    data: {
                        AUTH: authKey
                    }
                });
                $.ajax({
                    url: "https://drinkit.pro/api/drink/" + drinkID + "/equipment",
                    method: 'POST',
                    data: {
                        AUTH: authKey,
                        EQUIPMENTID: equipmentList[i].e.ID,
                    }
                });
                break;
            case "DELETE":
                $.ajax({
                    url: "https://drinkit.pro/api/drink/" + drinkID + "/equipment/" + equipmentList[i].e.ID,
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
function submitDrinkFlags(drinkID, flagList) {
    for (let i = 0; i < flagList.length; i++) {
        switch (flagList[i].Method) {
            case "POST":
                $.ajax({
                    url: "https://drinkit.pro/api/drink/" + drinkID + "/flag/"+flagList[i].f.ID,
                    method: 'POST',
                    data: {
                        AUTH: authKey
                    }
                });
                break;
            case "PUT":
                $.ajax({
                    url: "https://drinkit.pro/api/drink/" + drinkID + "/flag/"+flagList[i].ID,
                    method: 'DELETE',
                    data: {
                        AUTH: authKey,
                    }
                });
                $.ajax({
                    url: "https://drinkit.pro/api/drink/" + drinkID + "/flag/"+flagList[i].f.ID,
                    method: 'POST',
                    data: {
                        AUTH: authKey,
                    }
                });
                break;
            case "DELETE":
                $.ajax({
                    url: "https://drinkit.pro/api/drink/" + drinkID + "/flag/"+flagList[i].ID,
                    method: 'DELETE',
                    data: {
                        AUTH: authKey,
                    }
                });
                break;
            default:
                break;
        }
    }
}
function submitDrinkSkills(drinkID, skillList) {
    for (let i = 0; i < skillList.length; i++) {
        switch (skillList[i].Method) {
            case "POST":
                $.ajax({
                    url: "https://drinkit.pro/api/drink/" + drinkID + "/skill/" + skillList[i].s.ID,
                    method: 'POST',
                    data: {
                        AUTH: authKey
                    }
                });
                break;
            case "PUT":
                $.ajax({
                    url: "https://drinkit.pro/api/drink/" + drinkID + "/skill/" + skillList[i].ID,
                    method: 'DELETE',
                    data: {
                        AUTH: authKey
                    }
                });
                $.ajax({
                    url: "https://drinkit.pro/api/drink/" + drinkID + "/skill/" + skillList[i].s.ID,
                    method: 'POST',
                    data: {
                        AUTH: authKey
                    }
                });
                break;
            case "DELETE":
                $.ajax({
                    url: "https://drinkit.pro/api/drink/" + drinkID + "/skill/" + skillList[i].ID,
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
function uploadDrinkImage(drinkID, imagePath){
    if(imagePath){
        var formData = new FormData();
        formData.append("AUTH", authKey);
        formData.append("IMAGE", $('.image-path')[0].files[0]);
        $.ajax({
            url: "https://drinkit.pro/api/drink/" + drinkID + "/image",
            method: "PUT",
            data: formData,
            processData: false,
            contentType: false
        });
    }
}