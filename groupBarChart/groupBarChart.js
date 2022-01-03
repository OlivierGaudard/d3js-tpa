var clients = [];
var groupDataAgePercent = [];
var groupDataSituationFamilialePercent = [];
var groupDataNbEnfantsAChargePercent = [];
var groupDataAgeCount = [];
var groupDataSituationFamilialeCount = [];
var groupDataNbEnfantsAChargeCount = [];
var percent = true;

function percentCount(btn){

    if(btn){
        btn = false;
        document.getElementById('btnPercent').innerHTML="Percent";
        document.getElementById('btnAge').innerHTML="Par age (Count)";
        document.getElementById('btnSitu').innerHTML="Par situation familiale (Count)";
        document.getElementById('btnEnfants').innerHTML="Par enfants a charge (Count)";
    }
    else
    {
        btn = true;
        document.getElementById('btnPercent').innerHTML="Count";
        document.getElementById('btnAge').innerHTML="Par age (%)";
        document.getElementById('btnSitu').innerHTML="Par situation familiale (%)";
        document.getElementById('btnEnfants').innerHTML="Par enfants a charge (%)";
    }
    percent = btn;
}

function clientPipeline(clients, xColumn, xAxis, percent){

    var data = [];

    for(i = 0; i < xAxis.length; i++){
        data.push({[xColumn]:xAxis[i], nbPersonne:'0', values:[{grpName:'occasion',grpValue:'0'},{grpName:'neuf',grpValue:'0'}]});
    }

    clients.forEach(row => {
        if(row[xColumn] == xAxis[0]){
            row.occasion == "True" ? data[0].values[0].grpValue++ : data[0].values[1].grpValue++;
            data[0].nbPersonne++;
        }
        else if(row[xColumn] == xAxis[1]){
            row.occasion == "True" ? data[1].values[0].grpValue++ : data[1].values[1].grpValue++;
            data[1].nbPersonne++;
        }
        else if(row[xColumn] == xAxis[2]){
            row.occasion == "True" ? data[2].values[0].grpValue++ : data[2].values[1].grpValue++;
            data[2].nbPersonne++;
        }
        else if(row[xColumn] == xAxis[3]){
            row.occasion == "True" ? data[3].values[0].grpValue++ : data[3].values[1].grpValue++;
            data[3].nbPersonne++;
        }
        else if(row[xColumn] == xAxis[4]){
            row.occasion == "True" ? data[4].values[0].grpValue++ : data[4].values[1].grpValue++;
            data[4].nbPersonne++;
        }
    });

    if(percent){
        data.forEach(row => {
            var total = row.values[0].grpValue + row.values[1].grpValue;
            row.values[0].grpValue = Math.round((row.values[0].grpValue/total)*100);
            row.values[1].grpValue = Math.round((row.values[1].grpValue/total)*100);
        });
    }

    return data;
}

d3.csv("../data/Clients_Immatriculations_d3.csv", function(data) {
    for (var i = 0; i < data.length; i++) {
        clients.push({age:data[i].age, sexe:data[i].sexe, immatriculation:data[i].immatriculation, 
            marque:data[i].marque, occasion:data[i].occasion, situationFamiliale:data[i].situationFamiliale,
            nbEnfantsAcharge:data[i].nbEnfantsAcharge});
    }

    groupDataAgePercent = clientPipeline(clients, 'age', ['-25', '26-45', '46-65', '+66'], true);
    groupDataSituationFamilialePercent = clientPipeline(clients, 'situationFamiliale', ['En Couple','Celibataire','Marie','Divorce'], true);
    groupDataNbEnfantsAChargePercent = clientPipeline(clients, 'nbEnfantsAcharge', ['0','1','2','3','4'], true);
    groupDataAgeCount = clientPipeline(clients, 'age', ['-25', '26-45', '46-65', '+66'], false);
    groupDataSituationFamilialeCount = clientPipeline(clients, 'situationFamiliale', ['En Couple','Celibataire','Marie','Divorce'], false);
    groupDataNbEnfantsAChargeCount = clientPipeline(clients, 'nbEnfantsAcharge', ['0','1','2','3','4'], false);

    groupBarChart(groupDataAgePercent, groupDataAgeCount, percent);
});


function groupBarChart(groupDataPercent, groupDataCount, percent){

    var groupData = percent ? groupDataPercent : groupDataCount;
    var titleValue = percent ? " (%)" : " (Count)";
    var axisBottom = Object.keys(groupData[0])[0];

    var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;
   
    var x0  = d3.scaleBand().rangeRound([0, width], .5);
    var x1  = d3.scaleBand();
    var y   = d3.scaleLinear().rangeRound([height, 0]);

    var xAxis = d3.axisBottom().scale(x0)
                                //.tickFormat(d3.timeFormat("Week %V"))
                                .tickValues(groupData.map(d=>d[axisBottom]));

    var yAxis = d3.axisLeft().scale(y);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    d3.select("svg").remove();
    var svg = d3.select('body').append("svg")
    .style("display", "block")
    .style("margin", "auto")
    .style("margin-top", "5%")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var categoriesNames = groupData.map(function(d) { return d[axisBottom]; });
    var rateNames = groupData[0].values.map(function(d) { return d.grpName; });

    x0.domain(categoriesNames);
    x1.domain(rateNames).rangeRound([0, x0.bandwidth()]);
    y.domain([0, d3.max(groupData, function(key) { return d3.max(key.values, function(d) { return d.grpValue; }); })]);

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);


    svg.append("g")
      .attr("class", "y axis")
      .style('opacity','0')
      .call(yAxis)
        .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .style('font-weight','bold')
            .text("Value");

    svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", 0 - (margin.top / 2.5))
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("text-decoration", "underline")  
        .text("Achat de voitures neuf/occasion par " + axisBottom + titleValue);

    svg.select('.y').transition().duration(500).delay(1300).style('opacity','1');

    var slice = svg.selectAll(".slice")
      .data(groupData)
      .enter().append("g")
      .attr("class", "g")
      .attr("transform",function(d) { return "translate(" + x0(d[axisBottom]) + ",0)"; });

      slice.selectAll("rect")
      .data(function(d) { return d.values; })
        .enter().append("rect")
            .attr("width", x1.bandwidth())
            .attr("x", function(d) { return x1(d.grpName); })
             .style("fill", function(d) { return color(d.grpName) })
             .attr("y", function(d) { return y(0); })
             .attr("height", function(d) { return height - y(0); })
            .on("mouseover", function(d) {
                d3.select(this).style("fill", d3.rgb(color(d.grpName)).darker(2));
            })
            .on("mouseout", function(d) {
                d3.select(this).style("fill", color(d.grpName));
            });


    slice.selectAll("rect")
      .transition()
      .delay(function (d) {return Math.random()*1000;})
      .duration(1000)
      .attr("y", function(d) { return y(d.grpValue); })
      .attr("height", function(d) { return height - y(d.grpValue); });

      //Legend
  var legend = svg.selectAll(".legend")
      .data(groupData[0].values.map(function(d) { return d.grpName; }).reverse())
  .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d,i) { return "translate(0," + i * 20 + ")"; })
      .style("opacity","0");

  legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", function(d) { return color(d); });

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) {return d; });

  legend.transition().duration(500).delay(function(d,i){ return 1300 + 100 * i; }).style("opacity","1");
}