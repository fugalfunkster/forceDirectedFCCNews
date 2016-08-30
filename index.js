var height = 1000, width = 1000;

////////////////////////////
// IMPORT AND FORMAT DATA //
////////////////////////////

// Thanks to fellow FreeCodeCamper Lawliet Black, for hosting the json for this graph after FCC deleted their API

d3.json('https://gist.githubusercontent.com/LawlietBlack/d368f28f6149ead9b704cc58cc965197/raw/76695d1499b9f3f214cfe027566624c2102a2ff1/camper-news.json', function(error, data){
  if(error){
    console.log(error);
  } else {
    console.log("success");
  }
 
  var importedData = data;

  // Only the good parts please
  var data = importedData.map(function(entry, index, array) {

    var post = {};

    var url = entry.link;
    var a = document.createElement('a');
    a.href = url;

    post.domain = a.hostname;
    post.author = entry.author.username;
    post.pic = entry.author.picture;

    return post;

  });  

  var domainNodes = [];
  data.forEach(function(each, index, list){
    var uniqueDomain = true;
    domainNodes.forEach(function(entry){
      if(entry.domain == each.domain){
        uniqueDomain = false;
      }
    });
    if(uniqueDomain){
          var radius = 0.45 * Math.min(height,width);
          var theta = index*2*Math.PI / list.length;
          var x = (width/2) + radius*Math.sin(theta);
          var y = (height/2) + radius*Math.cos(theta);
      domainNodes.push({
            "domain": each.domain,
            "links": [],
            "x": x,
            "y": y
      });
    }
  });
  domainNodes.forEach(function(node){
    data.forEach(function(each){
      if(each.domain == node.domain){
        if(node.links.indexOf(each.author) == -1){
          node.links.push(each.author);
        }
      }
    });
  });
  //console.log(domainNodes);

  var userNodes = [];
  data.forEach(function(each, index, list){
    var uniqueUser = true;
    userNodes.forEach(function(entry){
      if(entry.username == each.author){
        uniqueUser = false;
      }
    });
    if(uniqueUser){
          var radius = 0.2 * Math.min(height,width);
          var theta = index*2*Math.PI / list.length;
          var x = (width/2) + radius*Math.sin(theta);
          var y = (height/2) + radius*Math.cos(theta);
      userNodes.push({
            "username": each.author,
            "pic" : each.pic,
            "links": [],
            "x": x,
            "y": y
      });
    }
  });
  userNodes.forEach(function(node){
    data.forEach(function(each){
      if(each.author == node.username){
        node.links.push(each.domain);
      }
    });
  });
  //console.log(userNodes);

  var nodes = userNodes.concat(domainNodes);
  //console.log(nodes);

  var edges = [];
  nodes.forEach(function(user, userIndex, nodesArray){
    // for each node with a "username"
    if(user.username){
      //and for each link in that username's links field
      user.links.forEach(function(link, linkIndex, linksArray){
        // find each node with a "domain"
        nodes.forEach(function(domain, domainIndex, nodes){
          if(domain.domain){
            //and if that domain is the same as the link's value
            if(domain.domain == link){
              // store the indicies of both the DomainNode and the UserNode
              // did not store a an array of what is bring connected
              edges.push({"source": userIndex, "target" : domainIndex  });
              }
          }
        });
      });
    }
  });
  //console.log(edges);

  ////////////////////////
  // USE THE FORCE LUKE //
  ////////////////////////

  var force = d3.layout.force()
    .size([width, height])
    .nodes(d3.values(nodes))
    .links(edges)
    .linkDistance(120)
    .charge(-200);

  force.on("tick", function(){
    edgeSelection
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
    nodeSelection
        .attr("cx", function(d) {return d.x; })
        .attr("cy", function(d) {return d.y; });
    images
        .attr("x", function(d) {return d.x; })
        .attr("y", function(d) {return d.y; });
  });

  force.start();

  /////////////////////  
  // RENDER THE REST //
  /////////////////////

  var svg = d3.select("#container").append("svg")
    .attr("height", height)
    .attr("width", width);

  var nodeSelection = svg.selectAll(".node")
    .data(force.nodes())
    .enter()
    .append("circle")
    .attr("r", function(d){ return d.links.length*5})
    .attr("class", "node")
    .call(force.drag);

  var images = svg.selectAll("image")
      .data(force.nodes())
      .enter()
      .append("image")
      .attr("xlink:href", function(d) {
        console.log(d.pic);
        return d.pic;
      })
      .attr("width", 32)
      .attr("height", 32);

  var edgeSelection = svg.selectAll("line")
    .data(force.links())
    .enter()
    .append("line")
    .attr("class", "line");

  ////////////////////
  // EVENT HANDLERS //
  ////////////////////

  //build a tool tip
  var tooltip = d3.select("#container").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  nodeSelection.on("mouseover", function(d){

    d3.select(this).style("fill", "cyan");

    tooltip.style("opacity", .95);

    tooltip.html("<div>" + (d.username || d.domain) + "</div>")
      .style("left", (d3.event.pageX + 18) + "px")
      .style("top", (d3.event.pageY - 28) + "px");

    })
  .on("mouseout", function(){

      d3.select(this).style("fill", "white");

      tooltip.style("opacity", 0);

   });

  
});

  
