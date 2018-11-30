// type: 1 (HG), 2 (SMG), 3 (RF), 4 (AR), 5 (MG), 6 (SG)
function getDollType(type)
{
    switch(type)
    {
        case 1: return "HG";
        case 2: return "SMG";
        case 3: return "RF";
        case 4: return "AR";
        case 5: return "MG";
        case 6: return "SG";
    }
}

function getDollRank(id, rank)
{
    if(dollData[id.toString()].region[$("#region").val()])
        return rank;
    return 0;
}

// Load Recipe
var recipePool = {};

$("#loadRecipeInfo").click(function()
{
    if(dollDataAcquired)
        updateTable();
});

var infoLoaded = false;
var loadingInfo = false;

function updateTable()
{
    var recipe = getRecipe("_");
    var r = recipePool[recipe];   

    if(r != undefined)
    {
        var data = r.data;
        var total = r.total;

        $("#total").text("Total : " + total);
        $("#typeInfo").text($("#type").val() + " Production");
        $("#tierInfo").text("Tier " + getTier());
        $("#rInfo").text("Recipe Info (" + $("#region").val() + ")");

        var cRecipe = getRecipe("/");
        cRecipe = cRecipe.slice(0, -2);
        $("#currentRecipe").text(cRecipe);

        var body = "";

        if(total > 0)
        {
            $.each(data, function(i)
            {          
                var id = getID(data[i].gun_id);                  
                var count = data[i].count;
                var doll = dollData[id.toString()];
                var row = "<tr href='" + wikiURL + doll.name.replace(" ", "_") + "'>";

                row += "<td>" + (i + 1) + "</td>";
                row += "<td>" + id + "</td>";
                row += "<td class='rank" + getDollRank(id, doll.rank) + "'>" + doll.name + "</td>";
                row += "<td>" + getDollType(doll.type) + "</td>";
                row += "<td>" + parseSeconds(doll.develop_duration) + "</td>";
                row += "<td>" + count + "</td>";
                row += "<td>" + Math.round(0.00001 + ((count / parseInt(total)) * 100) * 10000) / 10000 + "%</td>";
                row += "</tr>";
                body += row;
            });

            $(".recipeNotFound").collapse("hide");
            $("#recipeInfo").collapse("show");
            
        } else
        {
            $(".recipeNotFound").collapse("show");
            $("#recipeInfo").collapse("hide");
        }
           
        $("#infoBody").html(body);
        $("#infoBody").toggle();
        $("#infoBody").toggle(500);

        if(loadingInfo)
        {
            loadingInfo = false;
            $(".loading-info").toggle(200); 
        }

        collapseAndScroll("#infoDiv");
        addTableLinks();
    } else
    {
        getRecipeData(updateTable);
        loadingInfo = true;
        $(".loading-info").toggle(200);
    }
}

function getRecipe(divider)
{
    var manpower = $("#manpower").val();
    var ammo = $("#ammo").val();
    var rations = $("#rations").val();
    var parts = $("#parts").val();
    var type = $("#type").val();
    var tier = $("#tier").val();

    if(type == "Normal")
        tier = 0;

    var recipe = manpower + "-" + ammo + "-" + rations + "-" + parts + "-" + tier;
    recipe = recipe.replace(/-/g, divider);

    return recipe;
}

function getRecipeData(callback)
{    
    var url = neo_sp_build_info + "stats/tdoll/formula/" + getRecipe(":");
    
    $.get(url, function(data, status)
    {
        if(status == "success")
        {
            recipePool[getRecipe("_")] = JSON.parse(data);

            if(callback != null)
                callback();
        } else     
            alert("Error: Cannot Get Redcipe Data");                   
    });
}

function getTier()
{
    if($("#type").val() == "Normal")
        return 0;
    else
        return $("#tier").val();
}

// Tier Toggle
$("#type").change(function()
{
    if($(this).val() == "Normal")
        $(".tier").collapse("hide");
    else
        $(".tier").collapse("show");
});

// Rolling and RNG
var randomURL = "https://www.random.org/integers/?";
var rollAmount;
var rolls = [];
var totalRolls = 0;

$("#rollOnce").click(function()
{
    rollAmount = 1;
    totalRolls++;
    Roll();
    $(".roll-collapse").toggle(200);
});

$("#rollTen").click(function()
{
    rollAmount = 10;
    totalRolls += 10;
    Roll();
    $(".roll-collapse").toggle(200)
});

$("#reset").click(function()
{
    rolls = [];
    totalRolls = 0;
    updateRollTable();
});

function Roll()
{
    var recipe = getRecipe("_");
    var r = recipePool[recipe];   

    if(r != undefined)
    {
        if(r.total > 0)
        {
            var request = "num=" + rollAmount + "&min=1&max=" + r.total + "&col=1&base=10&format=plain&rnd=new";

            $.get(randomURL + request, function(data, status)
            {
                if(status == "success")
                {
                    var numbers = data.split("\n");
                    numbers.pop();

                    $.each(numbers, function(i)
                    {
                        var n = numbers[i];
                        var pCount = 0;
                        var luckyDoll;

                        $.each(r.data, function(j)
                        {
                            var cCount = r.data[j].count;
                            var nCount = pCount + cCount;
                            
                            if(n > pCount && n <= nCount)
                            {
                                luckyDoll = j;
                                return false;
                            }

                            pCount = nCount;
                        });

                        var dollRolled = r.data[luckyDoll];
                        var dollInfo = dollData[getID(dollRolled.gun_id).toString()];
                        
                        if(getDollRank(dollRolled.gun_id) != 0)
                        {
                            var dollRecipe = getRecipe("/");

                            dollRecipe = dollRecipe.slice(0, -2);
                            dollRolled.recipe = dollRecipe;
                            dollRolled.tier = getTier();

                            rolls.push(dollRolled);
                        } else
                        {
                            rollAmount = 1;
                            Roll();
                        }                                               
                    });
                    updateRollTable();
                } else
                    alert("Error: RNG Failed");
                
            });
            $(".recipeNotFound2").collapse("hide");           
        } else
        {
            $(".recipeNotFound2").collapse("show");
            $(".roll-collapse").toggle(200);
            totalRolls -= rollAmount;
        }
        
    } else
    {
        getRecipeData(Roll);
    }
}

// Roll Table
function updateRollTable()
{
    var body = "";

    var pContracts = 0;
    var qContracts = 0;
    var cores = 0;

    var manpower = 0;
    var ammo = 0;
    var rations = 0;
    var parts = 0;

    var rank2 = 0;
    var rank3 = 0;
    var rank4 = 0;
    var rank5 = 0;

    $.each(rolls, function(i)
    {
        var data = rolls[i];
        var id = getID(data.gun_id);
        var doll = dollData[id.toString()];
        var recipe = data.recipe;
        var tier = parseInt(data.tier);
        var row = "<tr href='" + wikiURL + doll.name.replace(" ", "_") + "'>";

        row += "<td>" + (i + 1) + "</td>";
        row += "<td>" + id + "</td>";
        row += "<td class='rank" + doll.rank + "'>" + doll.name + "</td>";
        row += "<td>" + getDollType(doll.type) + "</td>";
        row += "<td>" + parseSeconds(doll.develop_duration) + "</td>";
        row += "<td>" + recipe + "</td>";
        row += "<td>" + tier + "</td>";
        row += "</tr>";

        row += body;
        body = row;

        switch(tier)
        {
            case 0:
                pContracts += 1;
                break;
            case 1:
                pContracts += 1;
                cores += 3;
                break;
            case 2:
                pContracts += 20
                cores += 5;
                break;
            case 3:
                pContracts += 50;
                cores += 10;
                break;
        }

        if(tier == 0)
            qContracts += 1;
        else
            qContracts += 10;

        recipe = recipe.split("/");
        manpower += parseInt(recipe[0]);
        ammo += parseInt(recipe[1]);
        rations += parseInt(recipe[2]);
        parts += parseInt(recipe[3]);

       eval("rank" + doll.rank + "++;");
    });

    $("#rollBody").html(body);
    $("#rollsTable").scrollTop(0);
    $("#rollsText").text(rolls.length + " Rolls (" + (totalRolls - rolls.length) + " Pending)");

    $("#pContracts").text("P-Contracts: " + pContracts)
    $("#qContracts").text("QP-Contracts: " + qContracts);
    $("#cores").text("Cores: " + cores);
    $("#resources").text(manpower + "/" + ammo + "/" + rations + "/" + parts);

    if(rolls.length == totalRolls)
    {
        $("#rollsText").text(rolls.length + " Rolls");

        if(totalRolls > 0)
            $(".roll-collapse").toggle(200); 
            
        $("#rollBody").toggle();
        $("#rollBody").toggle(500);
        
        collapseAndScroll("#rollsDiv");
    }

    for(i = 2; i <= 5; i++)
    {
        var h = $("#rank" + i).html().split(" ");
        h[0] = eval("rank" + i);
        $("#rank" + i).html(h[0] + " " + h[1]);
    }

    addTableLinks();
}

// Popular Recipes
var popularRecipes = [
    ["All Around", 430, 430, 430, 230],
    ["SMG Focus", 400, 400, 91, 30],
    ["AR Focus", 91, 400, 400, 30],
    ["RF Focus", 400, 91, 400, 30],
    ["HG Focus", 130, 130, 130, 30],
    ["MG Focus", 600, 600, 100, 400],
    ["SG Focus", 6000, 2000, 6000, 4000],
];

var pBody = "";

$.each(popularRecipes, function(x)
{
    var pr = popularRecipes[x];
    pBody += ("<tr id='pRow" + x + "'>");

    $.each(pr, function(y)
    {
       pBody += ("<td>" + pr[y] + "</td>");
    });

    pBody += ("</tr>");
});

$("#popularBody").html(pBody);

$.each(popularRecipes, function(x)
{
    $("#pRow" + x).on("click", function()
    {
        $(this).find("td").each(function(y)
        {
            switch(y)
            {
                case 1:
                    $("#manpower").val($(this).text());
                    break;
                case 2:
                    $("#ammo").val($(this).text());
                    break;
                case 3:
                    $("#rations").val($(this).text());
                    break;
                case 4:
                    $("#parts").val($(this).text());
                    break;
            }
        });
    });
});

// Other
function parseSeconds(s)
{
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hrs = (s - mins) / 60;

    if(mins < 10)
        mins = "0" + mins;

    if(hrs < 10)
        hrs = "0" + hrs;

    return hrs + ":" + mins + ":00";
}

function addTableLinks()
{
    $("table tr").click(function()
    {
        var link = $(this).attr('href');
        if(link != undefined)
        {
            var w = window.open(link, "_blank");

            if(w)
                w.focus();
            else
                window.location = link;
        }           
    });
}

// For some reason some doll IDs are bugged 
function getID(id)
{
    if(id == 9034)             
        id = 206;
    if(id == 9035)
        id = 205;
    if(id > 1010)
        console.log(id); 
    return id;
}

// Sidebar
var minWidth = 575;
var minNavbarWidth = 430;
var isBelowMin = false;

$(".navbar-brand").addClass("navbar-brand-show");

setInterval(function(){

    var width = $(window).width();

    if(width >= minWidth)
    {
        if(!$("#sidebar").hasClass("collapse show") && !$("#sidebar").hasClass("collapsing"))
            $("#sidebar").collapse("show");

        if(isBelowMin)
            toggleCol();
           
        isBelowMin = false;   

    } else if(width <= minWidth)
    {
        if(!isBelowMin && $("#sidebar").hasClass("collapse show") && !$("#sidebar").hasClass("collapsing"))
            $("#sidebar").collapse("hide");     

        if(!isBelowMin)
            toggleCol();

        isBelowMin = true;       
    }

    if(width <= minNavbarWidth)
        $(".navbar-brand").text("Production Simulator");
    else
        $(".navbar-brand").text("Girls Frontline Production Simulator");

}, 100);

function toggleCol()
{
    $("#sidebar").toggleClass("col-3");
    $("#sidebar").toggleClass("col-12");
}

var scrollOffset = -60;

function collapseAndScroll(div)
{
    if(isBelowMin)    
        $("#sidebar").collapse("hide");
    
    $("html, body").animate({ scrollTop: $(div).offset().top + scrollOffset }, 1000);
}
