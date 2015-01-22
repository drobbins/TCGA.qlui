(function () {
	"use strict";
	/*jshint browser:true jquery:true*/
	/*globals TCGA:false*/

	TCGA.loadScript({
		registerModules : false,
		scripts : [
		"http://drobbins.github.io/TCGA.ql/tcgaql.js",
		"https://ajax.googleapis.com/ajax/libs/angularjs/1.0.3/angular.min.js" /*globals angular:false*/
	]}, function () {

		var app = angular.module("tcgaqlui", []);

		app.factory("QL", function () {
			return TCGA.ql;
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
						$scope.$broadcast("showSpinner");
						QL[$scope.filterName]().done(function (options) {
							$scope.$apply( function () {
								$scope.$broadcast("hideSpinner");
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
					"	<span ng-transclude></span> <spinner></spinner>",
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

		app.directive("results", function (QL) {
			return {
				restrict : "E",
				replace : true,
				scope : true,
				transclude : true,
				link : function ( $scope ) {
					$scope.results = { results : { bindings : [{file : { value: "No results loaded yet"}}]}};
					$scope.getResults = function getResults () {
						$scope.$broadcast("showSpinner");
						QL.run().done(function (results) {
							$scope.$apply(function () {
								$scope.$broadcast("hideSpinner");
								$scope.results = results;
							});
						});
					};
				},
				template : [
					"<div class=\"query-results\">",
					"	<div ng-transclude></div>",
					"	<button class=\"btn btn-primary\" ng-click=\"getResults()\">Get Results</button> <spinner></spinner>",
					"	<table class=\"table table-condensed\">",
					"		<thead><tr><th>File Name</th><th>URL</th></tr></thead>",
					"		<tbody>",
					"			<tr ng-repeat=\"binding in results.results.bindings\"><td>{{binding.file.value}}</td><td><a href=\"{{binding.url.value}}\">{{binding.url.value}}</a></td></tr>",
					"		</tbody>",
					"	</table>",
					"</div>"
				].join("")
			};
		});

		app.directive("spinner", function () {
			return {
				restrict : "E",
				replace : true,
				scope : true,
				transclude : true,
				link : function ( $scope ) {
					$scope.currentClass = "hide";
					$scope.$on("showSpinner", function () {
						$scope.currentClass = "";
					});
					$scope.$on("hideSpinner", function () {
						$scope.currentClass = "hide";
					});
				},
				template : [
					"<span ng-class=\"currentClass\"><img src=\"img/loader.gif\"> Loading...</span>"
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
				"</div>",
				"<div class=\"row-fluid\">",
				"	<div class=\"span12\"><results><h4>Query Results</h4></results></div>",
				"</div>"
				].join(""),
			switchTab : true
		}, function (err, el) {
			angular.bootstrap(el, ["tcgaqlui"]);
		});
	});

})();
