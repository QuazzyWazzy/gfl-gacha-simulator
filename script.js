// Source
var sp_build_info = "http://gfdb.baka.pw/";
var neo_sp_build_info = "https://ipick.baka.pw:444/";

// Doll Data
var dollData = {};
var dollDataAcquired = false;

// Regions
var regions = 
{
    EN: [[1, 3], [5, 27], [29], [31, 44], [46, 48], [50, 58], [60, 72], [74, 75], [77, 101], [103, 112], [114, 133], [135], [138, 144], [148, 149], [153, 159], [161], [166], [168], [170, 171], [173], [175], [183], [188, 190], [192], [196], [1001, 1002]],
    CN: [],
    KR: [],
    TW: [],
    JP: []
}

$.get(neo_sp_build_info + "data/json/gun_info_simple", function(data, status)
{
    if(status == "success")
    {
        $.each(data, function(i)
        {
            var doll = data[i];
            var id = doll.id;
            delete doll.id;
            doll.region = { EN: false };
            dollData[id.toString()] = doll;
        });

        $.each(regions.EN, function(i)
        {
            var id = regions.EN[i];

            if(id.length < 2)
            {
                if(dollData[id[0].toString()] != undefined)
                    dollData[id[0].toString()].region.EN = true;
            }             
            else
            {
                for(j = id[0]; j <= id[1]; j++)
                {
                    if(dollData[j.toString()] != undefined)
                        dollData[j.toString()].region.EN = true;
                }
            }
        });

        dollDataAcquired = true; 
    } 
});

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

        var cRecipe = getRecipe("/");
        cRecipe = cRecipe.slice(0, -2);
        $("#currentRecipe").text(cRecipe);

        var body = "";

        if(total > 0)
        {
            $.each(data, function(i)
            {
                var row = "<tr>";
                var id = data[i].gun_id;
                var count = data[i].count;
                var doll = dollData[id.toString()];

                row += "<td>" + (i + 1) + "</td>";
                row += "<td>" + id + "</td>";
                row += "<td class='rank" + getDollRank(id, doll.rank) + "'>" + doll.code + "</td>";
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
    } else
    {
        getRecipeData(updateTable);
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
        }             
    });
}

function getTier()
{
    if($("#type").val() == "Normal")
        return 0;
    else
        return $("#tier").val();
}

// Sidebar Checker
var maxWidth = 800;
var isBelowMax = false;

setInterval(function(){

    var width = $(window).width();

    if(width > maxWidth)
    {
        if(!$("#sidebar").hasClass("collapse show") && !$("#sidebar").hasClass("collapsing"))
            $("#sidebar").collapse("show");

        if(isBelowMax)
            toggleCol();
           
        isBelowMax = false;

    } else if(width <= maxWidth)
    {
        /*if(!isBelowMax && $("#sidebar").hasClass("collapse show") && !$("#sidebar").hasClass("collapsing"))
            $("#sidebar").collapse("hide");*/

        if(!isBelowMax)
            toggleCol();

        isBelowMax = true;
    }

}, 100);

function toggleCol()
{
    $("#infoDiv").toggleClass("col-4");
    $("#infoDiv").toggleClass("col-5");

    $("#rollsDiv").toggleClass("col-5");
    $("#rollsDiv").toggleClass("col-7");

    $("#sidebar").toggleClass("col-3");
    $("#sidebar").toggleClass("col-5");
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
                    var dollInfo = dollData[dollRolled.gun_id.toString()];
                    
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
        var row = "<tr>";
        var data = rolls[i];
        var id = data.gun_id;
        var doll = dollData[id.toString()];
        var recipe = data.recipe;
        var tier = data.tier

        row += "<td>" + (i + 1) + "</td>";
        row += "<td>" + id + "</td>";
        row += "<td class='rank" + getDollRank(id, doll.rank) + "'>" + doll.code + "</td>";
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
        if(totalRolls > 0)
            $(".roll-collapse").toggle(200);
        $("#rollsText").text(rolls.length + " Rolls");
    }

    for(i = 2; i <= 5; i++)
    {
        var h = $("#rank" + i).html().split(" ");
        h[0] = eval("rank" + i);
        $("#rank" + i).html(h[0] + " " + h[1]);
    }
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