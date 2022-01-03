var clients = [];
var groupDataCouleurEnfants = [];
var groupDataMarqueEnfants = [];
var groupDataCouleurSexe = [];
var groupDataMarqueSexe = [];
var percent = true;

function clientPipeline(clients, xColumn, xAxis, groupList, column){

    var data = {children:[], xColumn:xColumn, name:column};

    for(i=0; i<groupList.length; i++){
        data.children.push({name:groupList[i], children:[]});
    }

    for(i=0; i<groupList.length; i++){
        for(j=0; j<xAxis.length; j++){
            data.children[i].children.push({name:xAxis[j],value:0});
        }
    }

    clients.forEach(row => {
        for(i=0; i<xAxis.length;i++){
            if(row[xColumn] == xAxis[i]){
                data.children[groupList.indexOf(row[column])].children[xAxis.indexOf(xAxis[i])].value++;
            }
        }
    });


    return data;
}

d3.csv("../data/Clients_Immatriculations_d3.csv", function(data) {
    for (var i = 0; i < data.length; i++) {
        clients.push({age:data[i].age, sexe:data[i].sexe, immatriculation:data[i].immatriculation, 
            marque:data[i].marque, occasion:data[i].occasion, situationFamiliale:data[i].situationFamiliale,
            nbEnfantsAcharge:data[i].nbEnfantsAcharge, couleur:data[i].couleur});
    }

    marqueList = ['Renault','Volvo','Volkswagen','Peugeot','Audi','Skoda','Mercedes','BMW','Saab','Jaguar','Ford','Fiat','Kia','Seat','Daihatsu','Nissan','Dacia','Mini','Lancia'];
    couleurList = ['blanc','noir','gris','bleu','rouge'];
    nbEnfantsList = ['0','1','2','3','4'];
    sexeList = ['M','F'];

    groupDataMarqueEnfants = clientPipeline(clients, 'marque', marqueList,nbEnfantsList, 'nbEnfantsAcharge');
    groupDataCouleurEnfants = clientPipeline(clients, 'couleur', couleurList, nbEnfantsList, 'nbEnfantsAcharge');

    groupDataMarqueSexe = clientPipeline(clients, 'marque', marqueList, sexeList, 'sexe');
    groupDataCouleurSexe = clientPipeline(clients, 'couleur', couleurList, sexeList, 'sexe');

    treeMap(groupDataCouleurSexe);
});


function treeMap(data){


    console.log(data.name);

    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 1400 - margin.left - margin.right,
    height = 1250 - margin.top - margin.bottom;


    d3.select("svg").remove();
    // append the svg object to the body of the page
    var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Give the data to this cluster layout:
    var root = d3.hierarchy(data).sum(function(d){ return d.value}) // Here the size of each leave is given in the 'value' field in input data

    // Then d3.treemap computes the position of each element of the hierarchy
    d3.treemap()
        .size([width, height])
        .paddingTop(28)
        .paddingRight(7)
        .paddingInner(3)      // Padding between each rectangle
        //.paddingOuter(6)
        //.padding(20)
        (root)

    // prepare a color scale
    var color = d3.scaleOrdinal()
        .domain(["boss1", "boss2", "boss3"])
        .range([ "#402D54", "#D18975", "#8FD175"])

    // And a opacity scale
    var opacity = d3.scaleLinear()
        .domain([10, 30])
        .range([.5,1])

    // use this information to add rectangles:
    svg
        .selectAll("rect")
        .data(root.leaves())
        .enter()
        .append("rect")
        .attr('x', function (d) { return d.x0; })
        .attr('y', function (d) { return d.y0; })
        .attr('width', function (d) { return d.x1 - d.x0; })
        .attr('height', function (d) { return d.y1 - d.y0; })
        .style("stroke", "black")
        .style("fill", function(d){ return color(d.parent.data.name)} )
        .style("opacity", function(d){ return opacity(d.data.value)})

    // and to add the text labels
    svg
        .selectAll("text")
        .data(root.leaves())
        .enter()
        .append("text")
        .attr("x", function(d){ return d.x0+5})    // +10 to adjust position (more right)
        .attr("y", function(d){ return d.y0+20})    // +20 to adjust position (lower)
        .text(function(d){ return d.data.name.replace('mister_','') })
        .attr("font-size", "100%")
        .attr("fill", "white")

    // and to add the text labels
    svg
        .selectAll("vals")
        .data(root.leaves())
        .enter()
        .append("text")
        .attr("x", function(d){ return d.x0+5})    // +10 to adjust position (more right)
        .attr("y", function(d){ return d.y0+35})    // +20 to adjust position (lower)
        .text(function(d){ return d.data.value })
        .attr("font-size", "100%")
        .attr("fill", "white")

    // Add title for the 3 groups
    svg
        .selectAll("titles")
        .data(root.descendants().filter(function(d){return d.depth==1}))
        .enter()
        .append("text")
        .attr("x", function(d){ return d.x0})
        .attr("y", function(d){ return d.y0+21})
        .text(function(d){ return d.data.name })
        .attr("font-size", "19px")
        .attr("fill",  function(d){ return color(d.data.name)} )

    // Add title for the 3 groups
    svg
        .append("text")
        .attr("x", 0)
        .attr("y", 14)    // +20 to adjust position (lower)
        .text("Quantité de voitures achetés par " + data.xColumn + " par " + data.name)
        .attr("font-size", "19px")
        .attr("fill",  "black" )

}