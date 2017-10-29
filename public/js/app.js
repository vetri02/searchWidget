"use strict";

window.search = window.search || {};

window.search.inputWidget = function () {
  return {
    // Initialize App

    init: function init() {
      var self = this;
      $("#search-input").focus();
      self.searchInputActions();
    },

    // Search Input related actions (focus, blur & keyup events)

    searchInputActions: function searchInputActions() {
      var self = this;

      //Debounce fetching result to avoid multiple calls in each keystroke
      var fetchResultDebounced = _.debounce(function () {
        self.fetchResults($("#search-input").val());
      }, 200);

      $("#search-input").on("focus", function () {
        $("#close-search").addClass("open");
        $(".nav-search").addClass("active");
        self.searchClearOnClose();
      })
      // .on("blur", function() {
      //   if (!$(this).val()) {
      //     $("#close-search").removeClass("open");
      //   }
      //   $(".nav-search").removeClass("active");
      //   self.showResults("");
      // })
      .on("keyup", function (e) {
        var keyCode = e.keyCode;
        //console.log(keyCode);
        if (keyCode === 27 || keyCode === 38 || keyCode === 40) {
          self.keyBoardaccessiblity(keyCode);
        } else {
          $(".nav-search").addClass("active");
          fetchResultDebounced();
        }
      });

      $("html, body").on("click", function (e) {
        if (!$(e.target).is("#search-input") && !$(e.target).is("#hits-container") && !$(e.target).closest("#hits-item").length > 0) {
          self.searchAndResultClear();
        }
      });
    },

    // KeyBorad Accessible list
    //@param {number} keyCode

    keyBoardaccessiblity: function keyBoardaccessiblity(keyCode) {
      var self = this;
      if ($(".hits-item").length > 0) {
        // Pass on the focus to the result list

        if (keyCode === 38) {
          //KeyUp
          $(".hits-item:last-child").focus();
        } else if (keyCode === 40) {
          //Keydown
          $(".hits-item:first-child").focus();
        } else if (keyCode === 27) {
          //Escape
          self.searchAndResultClear();
        }

        $("#hits-container").off()
        // run the focus through result list
        .on("keydown", ".hits-item", function (e) {
          var keyCode = e.keyCode;
          if (keyCode === 38) {
            //KeyUp
            if ($(this).is(":first-child")) {
              $(this).closest("#hits-container").find(".hits-item:last-child").focus();
            } else {
              $(this).prev().focus();
            }
          } else if (keyCode === 40) {
            //Keydown
            if ($(this).is(":last-child")) {
              $(this).closest("#hits-container").find(".hits-item:first-child").focus();
            } else {
              $(this).next().focus();
            }
          } else if (keyCode === 13) {
            //Enter
            // Select when enter is hit
            e.stopImmediatePropagation();
            var selectedValue = $(this).attr("data-value");
            self.populateInput(selectedValue, self.query);
          } else {
            $(".hits-item").blur();
            $("#search-input").focus();
          }
        }).on("focus", ".hits-item", function (e) {
          //a11y
          $(this).attr("aria-selected", "true");
        }).on("blur", ".hits-item", function (e) {
          //a11y
          $(this).attr("aria-selected", "false");
        });
      }
    },

    // Search Input clear on close button click

    searchClearOnClose: function searchClearOnClose() {
      $("#close-search.open").off().on("click", function () {
        $("#search-input").val("");
        $(this).removeClass("open");
      });
    },

    // Search Input and results clear

    searchAndResultClear: function searchAndResultClear() {
      var self = this;
      if (!$("#search-input").val()) {
        $("#close-search").removeClass("open");
      }
      $(".nav-search").removeClass("active");
      self.showResults("");
      $("#search-input").focus();
    },

    // Fetch results
    //@param {string} query

    fetchResults: function fetchResults(query) {
      var self = this;

      var queryArray = query.split(" ");

      var partialQueryValue = "";
      var valueArrayClean = [];
      var valueLength = queryArray.length;
      //console.log(valueLength);
      var lastQueryIndex = valueLength - 1;
      if (queryArray[lastQueryIndex] === "") {
        return;
      }

      //All space delimited words other than the last can be considered to be already tokenized and should not be sent to the get suggestions server API.

      if (valueLength > 1) {
        valueArrayClean = _.compact(queryArray);
        partialQueryValue = valueArrayClean[valueArrayClean.length - 1];
        if (partialQueryValue && partialQueryValue !== "") {
          query = partialQueryValue;
        }
      }

      self.query = query;

      //console.log(query);
      getSuggestions(query).then(function (res) {
        //console.log(res);
        self.showResults(res, query);
      }, function (err) {
        //console.log(err);
        self.showResults("");
      });
    },

    // Show fetched results
    //@param {array} results
    //@param {string} query

    showResults: function showResults(results, query) {
      var self = this;
      var query_regexp = new RegExp(query, "g");

      if (results) {
        var resultSet = results.map(function (item, index) {
          return "\n                <a href=\"javascript:;\" class=\"hits-link hits-item\" data-value=\"" + item + "\" data-key=" + (index + 1) + "\">\n                    <div class=\"hit\">\n                            <p class=\"hit-description\">" + item.replace(query_regexp, "<mark>" + query + "</mark>") + "</p>\n                    </div>\n                </a>\n        ";
        });

        //console.log(resultSet);

        $("#hits-container").html(resultSet.join(""));

        $("#hits-container").off().on("mousedown touchstart", "a", function (e) {
          e.stopImmediatePropagation();
          var selectedValue = $(this).attr("data-value");
          self.populateInput(selectedValue, query);
        });
      } else {
        $("#hits-container").html("");
      }
    },

    // populate the search input with selected value
    //@param {string} selectedValue
    //@param {string} query

    populateInput: function populateInput(selectedValue, query) {
      var self = this;
      var searchInputvalue = $("#search-input").val();
      if (searchInputvalue && searchInputvalue !== query) {
        var query_regexp = new RegExp(query, "g");
        $("#search-input").val(searchInputvalue.replace(query_regexp, "") + selectedValue + " ");
      } else {
        $("#search-input").val(selectedValue + " ");
      }

      self.searchAndResultClear();

      return false;
    }
  };
}();

window.search.inputWidget.init();
'use strict';

// ================================= Mock Server Start =============================
var FAILURE_COEFF = 10;
var MAX_SERVER_LATENCY = 200;

function getRandomBool(n) {
  var maxRandomCoeff = 1000;
  if (n > maxRandomCoeff) n = maxRandomCoeff;
  return Math.floor(Math.random() * maxRandomCoeff) % n === 0;
}

function getSuggestions(text) {
  var pre = 'pre';
  var post = 'post';
  var results = [];
  if (getRandomBool(2)) {
    results.push(pre + text);
  }
  if (getRandomBool(2)) {
    results.push(text);
  }
  if (getRandomBool(2)) {
    results.push(text + post);
  }
  if (getRandomBool(2)) {
    results.push(pre + text + post);
  }
  return new Promise(function (resolve, reject) {
    var randomTimeout = Math.random() * MAX_SERVER_LATENCY;
    setTimeout(function () {
      if (getRandomBool(FAILURE_COEFF)) {
        reject();
      } else {
        resolve(results);
      }
    }, randomTimeout);
  });
}
// ================================= Mock Server End =============================