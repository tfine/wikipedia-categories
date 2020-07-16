var i = 0;

// strings for url
var urlstartcat =
  "https://en.wikipedia.org/w/api.php?action=query&origin=*&list=categorymembers&cmtitle=Category:";
var urlfinishcat = "&cmlimit=500&format=json";
var urlstartpage =
  "https://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&prop=linkshere&lhlimit=500&pageids=";

// empty array, want global
var array2 = [];

// get category name from field and start API call function
function submit() {
  var url = urlstartcat + document.getElementById("text").value + urlfinishcat;
  check(url);
}

// AJAX function for categories
function check(url) {
  // empty array
  array2 = [];
  $.ajax({
    url: url,
    type: "GET",
    success: processData,
    error: errorFunction
  });
}

function processData(data) {
  console.log(data);
  for (var i = 0; i < data["query"]["categorymembers"].length; i++) {
    // make url for each item to get number of links
    // TO-DO: Multiple items at once? Check what is maximum
    var url = urlstartpage + data["query"]["categorymembers"][i]["pageid"];
    $.ajax({
      url: url,
      type: "GET"
    }).done(function(data2) {
      var array = Object.values(data2["query"]["pages"]);
      if ("linkshere" in array[0]) {
        array2.push([array[0]["title"], array[0]["linkshere"].length]);
      }
    });
  }
}

function errorFunction() {
  //pass
}

// when all searches are done, make links for page
$(document).ajaxStop(function() {
  // sort array by number of links
  array2.sort((a, b) => {
    return b[1] - a[1];
  });
  // delete all links
  $("#link").empty();
  $("#link").append("<p>" + array2.length + " pages.</p></ br>");
  for (var x = 0; x < array2.length; x++) {
    // check if link is a category
    if (array2[x][0].startsWith("Category:")) {
      // encode for HTML, not sure if needed?
      var newurl = encodeURI(
        // since Category was in URL string, make sure not included twice
        urlstartcat + array2[x][0].replace("Category:", "") + urlfinishcat
      );
      // add each Category link to DOM  
      $("#link").append(
        '<a onclick=check("' +
          newurl +
          '") href="#">' +
          array2[x][0] +
          "</a><br />"
      );
    } else {
      // make sure Wikipedia links open in new window
      $("#link").append(
        "<a  target='_blank' href='http://en.wikipedia.org/wiki/" +
          array2[x][0] +
          "'>" +
          array2[x][0] +
          ":" +
          array2[x][1] +
          "</a><br />"
      );
    }
  }
});

// link submit button to submit function
$(document).ready(function() {
  $("#button").click(function() {
    submit();
  });
});
