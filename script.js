const educationURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const countyURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

const svg = d3.select("svg");
const tooltip = d3.select("#tooltip");

const drawMap = (countryData, educationData) => {
  //d attribute in svg - the instructions to draw the path
  //then call d3.geoPath() to generates path instructions from the data
  svg
    .selectAll("path")
    .data(countryData)
    .enter()
    .append("path")
    .attr("d", d3.geoPath())
    .attr("class", "county")
    .attr("fill", (countyData) => {
      let id = countyData.id;
      //find fips code in education data which match with the geoJSON
      let county = educationData.find((item) => {
        return item.fips === id;
      });
      //access to the percentage of the matched county
      let percentage = county.bachelorsOrHigher;
      //set different percentage with difference color fill
      if (percentage <= 15) {
        return "#d4fadb";
      } else if (percentage <= 30) {
        return "#8dd99a";
      } else if (percentage <= 45) {
        return "#3f914c";
      } else {
        return "#0d4d18";
      }
    })
    .attr("data-fips", (countyData) => {
      return countyData.id;
    })
    .attr("data-education", (countyData) => {
      let id = countyData.id;
      let county = educationData.find((item) => {
        return item.fips === id;
      });
      return county.bachelorsOrHigher;
    })
    .on("mouseover", (countyData) => {
      tooltip.transition().style("visibility", "visible");

      let id = countyData.id;
      let county = educationData.find((item) => {
        return item.fips === id;
      });
      tooltip.html(
        county.fips + " - " + county.area_name + ", " + county.state + "<br/>" + "Percentage : " + county.bachelorsOrHigher + "%"
      );

      tooltip.attr("data-education", county.bachelorsOrHigher);
    })
    .on("mouseout", () => {
      tooltip.transition().style("visibility", "hidden");
    });
};

//fetch country url first, then call function to fetch the education data
async function fetchMap() {
  const countyResponse = await fetch(countyURL);
  const countryData = await countyResponse.json();

  //d3 only supports geoJSON so here we need to covert it
  //only the data > objects > counties will be use in this project, only convert this part
  //the geometry field of each object has an array of coordinates from which we can draw lines to draw a map outline of that county
  //and after converted as geoJSON, we only need features parts, so extrait it only
  const geoJSON = topojson.feature(countryData, countryData.objects.counties).features;

  //fetch education data after fetched the county data
  const educationResponse = await fetch(educationURL);
  const educationData = await educationResponse.json();

  drawMap(geoJSON, educationData);
}

fetchMap();
