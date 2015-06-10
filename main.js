/* global ko */
(function() {
  'use strict';
  
  var dailyProtein = ko.observable(175);
  var dailyCarb = ko.observable(240);
  var dailyFat = ko.observable(60);
  var dailyCalories = ko.observable(2200);
  
  var protein = ko.observable(100);
  var carb = ko.observable(120);
  var fat = ko.observable(12);
  
  var totalCalories = ko.computed(function() {
    return protein() * 4 + carb() * 4 + fat() * 7;
  });
  
  function percentageObservable(num, den) {
    return ko.computed(function() {
      return (100 * ko.unwrap(num) / ko.unwrap(den)) + '%';
    });
  }
  
  function getToday() {
    var key = (new Date()).toLocaleDateString();
    var today = window.localStorage.getItem(key);
    if (!today)
      return [];
    return JSON.parse(today);
  }
  
  function addToday(protein, carb, fat) {
    var key = (new Date()).toLocaleDateString();
    var today = window.localStorage.getItem(key);
    if (!today)
      today = [];
    else
      today = JSON.parse(today);
    today.push({
      protein: protein,
      carb: carb,
      fat: fat,
      time: (new Date()).toLocaleTimeString()
    });
    window.localStorage.setItem(key, JSON.stringify(today));
  }
  
  function setToday(today) {
    var key = (new Date()).toLocaleDateString();
    window.localStorage.setItem(key, JSON.stringify(today));
  }
  
  function roundObservable(num, den) {
    return ko.computed(function() {
      return Math.round(ko.unwrap(num));
    });
  }
  
  function fractionObservable(num, den) {
    return ko.computed(function() {
      return '/' + Math.round(ko.unwrap(den));
    });
  }
  
  var mainViewModel = {
    showHomeView: ko.observable(true),
    showAddView: ko.observable(false),
    showViewView: ko.observable(false),

    homeView: {
      init: function() {
        var p = 0;
        var c = 0;
        var f = 0;
        var today = getToday();
        today.forEach(function(entry) {
          p += parseInt(entry.protein, 10);
          c += parseInt(entry.carb, 10);
          f += parseInt(entry.fat, 10);
        });
        
        protein(p);
        carb(c);
        fat(f);
      },
      proteinHeight: percentageObservable(protein, dailyProtein),
      carbHeight: percentageObservable(carb, dailyCarb),
      fatHeight: percentageObservable(fat, dailyFat),
      bigProteinText: roundObservable(protein, dailyProtein),
      bigCarbText: roundObservable(carb, dailyCarb),
      bigFatText: roundObservable(fat, dailyFat),
      proteinText: fractionObservable(protein, dailyProtein),
      carbText: fractionObservable(carb, dailyCarb),
      fatText: fractionObservable(fat, dailyFat),
      totalCalories: totalCalories,
      dailyCalories: dailyCalories,
      onAddClick: onAddClick,
      onViewClick: onViewClick,
      onDailyProteinClick: onDailyValueClick.bind(null, dailyProtein, 'protein'),
      onDailyCarbClick: onDailyValueClick.bind(null, dailyCarb, 'carbohydrate'),
      onDailyFatClick: onDailyValueClick.bind(null, dailyFat, 'fat'),
      onDailyCaloriesClick: onDailyValueClick.bind(null, dailyCalories, 'calorie')
    },
    
    addView: {
      init: function() {
        this.proteinValue(0);
        this.carbValue(0);
        this.fatValue(0);
      },
      proteinValue: ko.observable(0),
      carbValue: ko.observable(0),
      fatValue: ko.observable(0),
      onProteinFocus: onProteinFocus,
      onCarbFocus: onCarbFocus,
      onFatFocus: onFatFocus,
      onProteinBlur: onProteinBlur,
      onCarbBlur: onCarbBlur,
      onFatBlur: onFatBlur,
      onAddCancelClick: onAddCancelClick,
      onAddAddClick: onAddAddClick
    },
    
    viewView: {
      init: function() {
        this.entries(getToday());
        this.entries.sort(function(lhs, rhs) {
          var today = (new Date()).toLocaleDateString();
          var t1 = new Date(today + ' ' + lhs.time).getTime();
          var t2 = new Date(today + ' ' + rhs.time).getTime();
          return t1 < t2;
        });
      },
      entries: ko.observableArray([]),
      onBackClick: onBackClick,
      onDeleteClick: onDeleteClick
    }
  };
  
  function onAddClick() {
    mainViewModel.showHomeView(false);
    mainViewModel.showAddView(true);
    mainViewModel.addView.init();
  }
  
  function onViewClick() {
    mainViewModel.showHomeView(false);
    mainViewModel.showViewView(true);
    mainViewModel.viewView.init();
  }
  
  function onDailyValueClick(observable, name) {
    var value = window.prompt('Enter daily ' + name + ' requirement', observable());
    if (!isNan(parseInt(value)))
      observable(parseInt(value));
  }
  
  function onAddCancelClick() {
    mainViewModel.showHomeView(true);
    mainViewModel.showAddView(false);
    mainViewModel.homeView.init();
  }
  
  function onAddAddClick() {
    var addView = mainViewModel.addView;
    if (parseInt(addView.proteinValue(), 10) +
        parseInt(addView.carbValue(), 10) +
        parseInt(addView.fatValue(), 10) > 0) {

      addToday(
        addView.proteinValue(),
        addView.carbValue(),
        addView.fatValue()
      );
    }
    onAddCancelClick();
  }
  
  function onProteinFocus(vm, e) {
    vm.proteinValue('');
  }

  function onCarbFocus(vm, e) {
    vm.carbValue('');
  }

  function onFatFocus(vm, e) {
    vm.fatValue('');
  }
  
  function isNan(a) {
    return a !== a;
  }

  function onProteinBlur(vm, e) {
    if (isNan(parseInt(vm.proteinValue(), 10)))
      vm.proteinValue(0);
  }

  function onCarbBlur(vm, e) {
    if (isNan(parseInt(vm.carbValue(), 10)))
      vm.carbValue(0);
  }

  function onFatBlur(vm, e) {
    if (isNan(parseInt(vm.fatValue(), 10)))
      vm.fatValue(0);
  }
  
  function onBackClick() {
    mainViewModel.showHomeView(true);
    mainViewModel.showViewView(false);
    mainViewModel.homeView.init();
  }
  
  function onDeleteClick(vm) {
    var val = ko.unwrap(vm.protein) + '/' + ko.unwrap(vm.carb) + '/' + ko.unwrap(vm.fat); 
    if (!window.confirm("Really delete the " + val + " entry?"))
      return;
    mainViewModel.viewView.entries.remove(vm);
    setToday(mainViewModel.viewView.entries());
  }
  
  document.body.addEventListener('touchmove', function(e) {
    if (!ko.unwrap(mainViewModel.showViewView))
      e.preventDefault();
  });
  
  mainViewModel.homeView.init();
  ko.applyBindings(mainViewModel);
})();