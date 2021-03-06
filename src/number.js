'use strict';

var card = require('bp-creditcards').card;

module.exports = function ($parse) {
  return {
    restrict: 'A',
    require: ['ngModel', 'ccNumber'],
    controller: function () {
      var expectedType;
      this.expect = function (type) {
        expectedType = type;
      };
    },
    compile: function (element, attributes) {
      attributes.$set('pattern', '[0-9]*');

      return function (scope, element, attributes, controllers) {
        var ngModelController = controllers[0];
        var ccNumberController = controllers[1];

        scope.$watch(attributes.ngModel, function (number) {
          ngModelController.$setViewValue(card.formattedParse(number));
          ngModelController.$render();
          ngModelController.$ccType = ccNumberController.type = card.type(number);
        });

        scope.$watch(attributes.ccType, function (type) {
          ccNumberController.expect(type);
          ngModelController.$validate();
        });

        ngModelController.$parsers.unshift(function (number) {
          return card.parse(number);
        });

        if(!attributes.skipLuhnValidation) {
          ngModelController.$validators.ccNumber = function (number) {
            return card.isValid(number);
          };
          ngModelController.$validators.ccNumberType = function (number) {
            return card.isValid(number, $parse(attributes.ccType)(scope));
          };
        }
      };
    }
  };
};
module.exports.$inject = ['$parse'];
