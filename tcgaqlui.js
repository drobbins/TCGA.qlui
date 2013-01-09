(function () {
	"use strict";
	/*jshint browser:true jquery:true*/
	/*globals TCGA:false*/

	TCGA.loadScript({
		registerModules : false,
		scripts : [
		"https://raw.github.com/drobbins/TCGA.ql/master/tcgaql.js",
		"https://ajax.googleapis.com/ajax/libs/angularjs/1.0.3/angular.min.js" /*globals angular:false*/
	]}, function () {

		var app = angular.module("tcgaqlui", []);

		app.factory("QL", function () {
			return TCGA.ql;
		});

		app.controller("qlMain", function ($scope) {
			$scope.message = "Hello Friends!";
			$scope.template = "";
		});

		app.directive("filter", function ($window, QL) {
			return {
				restrict : "E",
				replace : true,
				scope : true,
				transclude : true,
				link : function ( $scope, element, attributes, controller) {
					$scope.filters = QL.filterNames;
					$scope.options = { def : "select filter type"};
					$scope.updateOptions = function updateOptions () {
						QL[$scope.filterName]().done(function (options) {
							$scope.$apply( function () {
								delete $scope.options.def;
								angular.extend($scope.options, options);
								$scope.selectedOptions = [];
							});
						});
					};
					$scope.updateFilters = function updateFilters () {
						QL[$scope.filterName]($scope.selectedOptions);
					};
				},
				template : [
					"<div class=\"filter\">",
					"	<div ng-transclude></div>",
					"	<select ng-model=\"filterName\" ng-options=\"f for f in filters\" ng-change=\"updateOptions()\"></select>",
					"	<select ng-model=\"selectedOptions\" ng-options=\"o for (k,o) in options\" ng-change=\"updateFilters()\" multiple></select>",
					"</div>"
				].join("")
			};
		});

		app.directive("query", function (QL) {
			return {
				restrict : "E",
				replace : true,
				scope : true,
				transclude : true,
				link : function ( $scope ) {
					$scope.query = QL.queryString();
					$scope.$watch( function () {return QL.queryString(); }, function (queryString) {
						$scope.query = queryString;
					});
				},
				template : [
					"<div class=\"query\">",
					"	<div ng-transclude></div>",
					"	<a class=\"accordion-toggle\" data-toggle=\"collapse\" data-target=\"#query-listing\" href=\"#\">Toggle Query Listing</a>",
					"	<div id=\"query-listing\" class=\"collapse\"><pre>{{query}}</pre></div>",
					"</div>"
				].join("")
			};
		});

		TCGA.ui.registerTab({
			id : "tcgaqlui",
			title : "TCGA Query Language",
			content : [
				"<div class=\"row-fluid\">",
				"	<div class=\"span3\"><filter> Filter 1</filter></div>",
				"	<div class=\"span3\"><filter> Filter 2</filter></div>",
				"	<div class=\"span3\"><filter> Filter 3</filter></div>",
				"</div>",
				"<div class=\"row-fluid\">",
				"	<div class=\"span12\"><query></query></div>",
				"</div>"
				].join(""),
			switchTab : true
		}, function (err, el) {
			angular.bootstrap(el, ["tcgaqlui"]);
		});
	});

})();