﻿; (function () {
	'use strict';

	app.run(initializeLocalization);

	initializeLocalization.$inject = ["$rootScope", "eventsService", "languageResource"];

	function initializeLocalization($rootScope, eventsService, languageResource) {
		eventsService.on("app.authenticated", function (e, d) {
			languageResource.getAllLanguages().then(function (data) {

				// Add all languages to the root scope
				$rootScope.isLoading = true; // Hack: because selectedLanguages = [] will call the controller with wrong values...

				$rootScope.languages = [];
				$rootScope.selectedLanguages = [];
				$rootScope.defaultLanguages = [];
				angular.forEach(data, function (value, key) {
					var language = {
						isoCode: value.isoCode,
						twoLetterISOCode: value.isoCode.split('-')[0],
						displayName: value.displayName,
						nativeName: value.nativeName,
						select: function () {
							if ($rootScope.selectedLanguages.indexOf(this.isoCode) == -1) {
								$rootScope.selectedLanguages.push(this.isoCode);
							} else {
								$rootScope.selectedLanguages.splice($rootScope.selectedLanguages.indexOf(this.isoCode), 1);
							}
						}
					};

					if (value.isDefault) {
						$rootScope.defaultLanguages.push(language.isoCode);
					}

					$rootScope.languages.push(language);
				});

				setSelectedLanguages();
			});

			// Handle language change

			$rootScope.$watch("selectedLanguages", function (value) {
				// we have to have some languages even if it is empty array.
				if (value) {
					storeSelectedLanguages(value);

					if ($rootScope.isLoading) {
						$rootScope.isLoading = false;
					}
				}
			}, true);

			$rootScope.selectAllLanguages = function () {
				$rootScope.selectedLanguages = $rootScope.languages.map(function (o) { return o.isoCode; });
			};

			$rootScope.deselectAllLanguages = function () {
				$rootScope.selectedLanguages = [];
			};


			// Private functions

			function setSelectedLanguages() {
				// Set stored language as current

				languageResource.getSelectedLanguages().then(function (languages) {
					if (languages && languages.length) {
						// if it's not the same amount we select them otherwise it's 'all'
						if (languages.length == $rootScope.languages.length) {
							$rootScope.selectedLanguages = [];
						}
						else {
							var selected = [];
							angular.forEach(languages, function (language) {
								selected.push(language.isoCode);
							});
							$rootScope.selectedLanguages = selected;
						}
					}
					else {
						// if no languages yet set default
						$rootScope.selectedLanguages = $rootScope.defaultLanguages;
					}
				});
			};

			function storeSelectedLanguages(isoCodes) {
				if (!$rootScope.isLoading && isoCodes) {
					// post and store the language in a cookie
					languageResource.postSelectedLanguages(isoCodes);
				}
			};
		});
	};

}());