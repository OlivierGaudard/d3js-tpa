var groupDataMarqueSexe = [];
var groupDataCouleurSexe = [];
var groups = [];
var groupDataCouleurEnfants = [];
var groupDataMarqueEnfants = [];
var clients = [];

function clientPipeline(groups, subGroups){

    var data = {children:[], name:'CirclePacking'};

    for(i=0; i<groups.length; i++){
        data.children.push({name:groups[i], children:[]});
    }

    for(i=0; i<groups.length; i++){
        for(j=0; j<subGroups[i].length; j++){
            data.children[i].children.push({name:subGroups[i][j],children:[]});
        }
    }

    return data;
}

function addToPipeline(v, clients, data, xColumn, xAxis, groupList, column){

    for(i=0; i<groupList.length; i++){
        for(j=0; j<xAxis.length; j++){
            data.children[v].children[i].children.push({name:xAxis[j],size:0});
        }
    }

    clients.forEach(row => {
        for(i=0; i<xAxis.length;i++){
            if(row[xColumn] == xAxis[i]){
                data.children[v].children[groupList.indexOf(row[column])].children[xAxis.indexOf(xAxis[i])].size++;
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
    sexeList = ['M','F'];
    nbEnfantsList = ['0','1','2','3','4'];
    groups = ['MarqueSexe', 'CouleurSexe', 'MarqueEnfants', 'CouleurEnfants'];
    subGroups = [sexeList, sexeList, nbEnfantsList, nbEnfantsList];
    couleurList = ['blanc','noir','gris','bleu','rouge'];
    

    dataStruct = clientPipeline(groups, subGroups);
    groupDataMarqueSexe = addToPipeline(0,clients, dataStruct, 'marque', marqueList, sexeList, 'sexe');
    groupDataCouleurSexe = addToPipeline(1,clients, groupDataMarqueSexe, 'couleur', couleurList, sexeList, 'sexe');
    groupDataMarqueEnfants = addToPipeline(2,clients, groupDataCouleurSexe, 'marque', marqueList, nbEnfantsList, 'nbEnfantsAcharge');
    groupDataCouleurEnfants = addToPipeline(3,clients, groupDataMarqueEnfants, 'couleur', couleurList, nbEnfantsList, 'nbEnfantsAcharge');

    circlePacking(groupDataCouleurEnfants);
});

function circlePacking(root){

    var svg = d3.select("svg"),
    margin = 20,
    diameter = +svg.attr("width"),
    g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

    svg
        //.style("display", "block")
        //.style("margin", "auto")
        .style("width", "100%")


    var color = d3.scaleLinear()
        .domain([-1, 5])
        .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
        .interpolate(d3.interpolateHcl);

    var pack = d3.pack()
        .size([diameter - margin, diameter - margin])
        .padding(2);

    root = d3.hierarchy(root)
        .sum(function(d) { return d.size; })
        .sort(function(a, b) { return b.value - a.value; });

    var focus = root,
        nodes = pack(root).descendants(),
        view;

    var circle = g.selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
        .style("fill", function(d) { return d.children ? color(d.depth) : null; })
        .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });

    var text = g.selectAll("text")
        .data(nodes)
        .enter().append("text")
        .attr("class", "label")
        .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
        .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
        .text(function(d) { return d.data.name; });

    var node = g.selectAll("circle,text");

    svg
        .style("background", color(-1))
        .on("click", function() { zoom(root); });

    zoomTo([root.x, root.y, root.r * 2 + margin]);

    function zoom(d) {
        var focus0 = focus; focus = d;

        var transition = d3.transition()
            .duration(d3.event.altKey ? 7500 : 750)
            .tween("zoom", function(d) {
            var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
            return function(t) { zoomTo(i(t)); };
            });

        transition.selectAll("text")
        .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
            .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
            .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
            .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
    }

    function zoomTo(v) {
        var k = diameter / v[2]; view = v;
        node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
        circle.attr("r", function(d) { return d.r * k; });
    }
}
