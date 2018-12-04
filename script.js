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

// Rank and Stars
function getDollRank(id, rank)
{
    if(dollData[id.toString()].region[$("#region").val()])
        return rank;
    return 0;
}

function getDollStars(rank)
{
    var stars = "";
    for(i = 0; i < rank; i++)
    {
        stars += "☆";
    }
    return stars;
}

// Wiki URLs
var EN_wikiURL = "https://en.gfwiki.com/wiki/";
var JP_wikiURL = "https://wikiwiki.jp/dolls-fl/";
var CN_wikiURL = "https://zh.moegirl.org/少女前线:";
var KR_wikiURL = "http://gfl.zzzzz.kr/doll.php?id=";
var TW_wikiURL = "https://gf.fws.tw/db/guns/info/"

function getDollURL(id)
{
    var r = $("#region").val();
    var name = getDollName(id);

    switch(r)
    {
        case "JP": return JP_wikiURL + name;
        case "CN": return CN_wikiURL + name.replace(" ", "_");
        case "KR": return KR_wikiURL + id;
        case "TW": return TW_wikiURL + id;
        default: return EN_wikiURL + name.replace(" ", "_");
    }
}

// Doll Names
function getDollName(id)
{
    id = id.toString();
    var name = dollNames[$("#region").val()][id];

    if(name == undefined)
        return dollNames.EN[id];

    return name;
}

// For some reason some doll IDs are bugged 
function getID(id)
{
    if(id == 9034)             
        id = 206;
    if(id == 9035)
        id = 205;
    //if(id > 1010)
        //console.log(id); 
    return id;
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
                var row = "<tr href='" + getDollURL(id) + "'>";

                row += "<td>" + (i + 1) + "</td>";
                row += "<td>" + id + "</td>";
                row += "<td class='rank" + getDollRank(id, doll.rank) + "'>" + getDollName(id) + "</td>";
                row += "<td class='rank" + doll.rank + "' data-sort-value='" + doll.rank + "'>" + getDollStars(doll.rank) + "</td>";
                row += "<td>" + getDollType(doll.type) + "</td>";
                row += "<td data-sort-value='" + doll.develop_duration + "'>" + parseSeconds(doll.develop_duration) + "</td>";
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

function getRecipeTotal(recipe, splitter)
{
    var total = 0;
    recipe = recipe.split(splitter);
    $.each(recipe, function(i)
    {
        total += parseInt(recipe[i]);
    });
    return total;
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

    var pContracts = 0, qContracts = 0, cores = 0;
    var manpower = 0, ammo = 0, rations = 0, parts = 0;
    var rank2 = 0, rank3 = 0, rank4 = 0, rank5 = 0;

    $.each(rolls, function(i)
    {
        var data = rolls[i];
        var id = getID(data.gun_id);
        var doll = dollData[id.toString()];
        var recipe = data.recipe;
        var tier = parseInt(data.tier);
        var row = "<tr href='" + getDollURL(id) + "'>";

        row += "<td>" + (i + 1) + "</td>";
        row += "<td>" + id + "</td>";
        row += "<td class='rank" + doll.rank + "'>" + getDollName(id) + "</td>";
        row += "<td class='rank" + doll.rank + "' data-sort-value='" + doll.rank + "'>" + getDollStars(doll.rank) + "</td>";
        row += "<td>" + getDollType(doll.type) + "</td>";
        row += "<td data-sort-value='" + doll.develop_duration + "'>" + parseSeconds(doll.develop_duration) + "</td>";
        row += "<td data-sort-value='" + getRecipeTotal(recipe, "/") + "'>" + recipe + "</td>";
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

// Table Links and Sorting
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
    
    if(infoCol != undefined)  
        infoCol.stupidsort(infoDir);      
    if(rollsCol != undefined)  
        rollsCol.stupidsort(rollsDir);
}

var table = $("table").stupidtable();
var infoCol, infoDir;
var rollsCol, rollsDir;

table.on("aftertablesort", function (event, data) 
{
    var th = $(this).find("th");
    var id = $(this).attr("id");
    var offset = 0;

    if(id == "infoTable")
        offset = 2;
    if(id == "rollsTable")
        offset = 6;

    th.find(".arrow").remove();       
    var dir = $.fn.stupidtable.dir;
    var arrow = data.direction === dir.ASC ? "up" : "down";
    var col = th.eq(data.column + offset);

    if(id == "infoTable")
    {
        infoCol = col;
        infoDir = data.direction;
    }      
    if(id == "rollsTable")
    {
        rollsCol = col;
        rollsDir = data.direction;
    }

    col.append("<span class='arrow' data-feather='arrow-" + arrow + "'></span>");
    feather.replace();
});

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
