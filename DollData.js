var sp_build_info = "http://gfdb.baka.pw/";
var neo_sp_build_info = "https://ipick.baka.pw:444/";

var wikiURL = "https://en.gfwiki.com/wiki/";

var dollData = {};
var dollDataAcquired = false;

var dollNames = 
{
    "1": "Colt Revolver",
    "2": "M1911",
    "3": "M9",
    "4": "Python",
    "5": "Nagant Revolver",
    "6": "Tokarev",
    "7": "Stechkin",
    "8": "Makarov",
    "9": "P38",
    "10": "PPk",
    "11": "P08",
    "12": "C96",
    "13": "Type 92",
    "14": "Astra Revolver",
    "15": "Glock 17",
    "16": "Thompson",
    "17": "M3",
    "18": "MAC-10",
    "19": "FMG-9",
    "20": "Vector",
    "21": "PPSh-41",
    "22": "PPS-43",
    "23": "PP-90",
    "24": "PP-2000",
    "25": "MP40",
    "26": "MP5",
    "27": "Skorpion",
    "28": "MP7",
    "29": "Sten MkII",
    "31": "Beretta Model 38",
    "32": "Micro Uzi",
    "33": "m45",
    "34": "M1 Garand",
    "35": "M1A1",
    "36": "Springfield",
    "37": "M14",
    "38": "M21",
    "39": "Mosin-Nagant",
    "40": "SVT-38",
    "41": "Simonov",
    "42": "PTRD",
    "43": "SVD",
    "44": "SV-98",
    "46": "Kar98k",
    "47": "G43",
    "48": "WA2000",
    "49": "Type 56",
    "50": "Lee-Enfield",
    "51": "FN-49",
    "52": "BM59",
    "53": "NTW-20",
    "54": "M16A1",
    "55": "M4A1",
    "56": "M4 SOPMOD II",
    "57": "ST AR-15",
    "58": "AK-47",
    "59": "AK-74U",
    "60": "AS Val",
    "61": "StG44",
    "62": "G41",
    "63": "G3",
    "64": "G36",
    "65": "HK416",
    "66": "Type 56-1",
    "68": "L85A1",
    "69": "FAMAS",
    "70": "FNC",
    "71": "Galil",
    "72": "TAR-21",
    "73": "AUG",
    "74": "SIG-510",
    "75": "M1918",
    "77": "M2HB",
    "78": "M60",
    "79": "M249 SAW",
    "80": "M1919A4",
    "81": "LWMMG",
    "82": "DP28",
    "84": "RPD",
    "85": "PK",
    "86": "MG42",
    "87": "MG34",
    "88": "MG3",
    "89": "Bren",
    "90": "FNP-9",
    "91": "MP-446",
    "92": "Spectre M4",
    "93": "IDW",
    "94": "Type 64",
    "95": "Hanyang Type 88",
    "96": "Grizzly MkV",
    "97": "M950A",
    "98": "SPP-1",
    "99": "Mk23",
    "100": "P7",
    "101": "UMP9",
    "102": "UMP40",
    "103": "UMP45",
    "104": "G36C",
    "105": "OTs-12",
    "106": "FAL",
    "107": "F2000",
    "108": "CZ-805",
    "109": "MG5",
    "110": "FG42",
    "111": "AAT-52",
    "112": "Negev",
    "113": "Serdyukov",
    "114": "Welrod MkII",
    "115": "Suomi",
    "116": "Z-62",
    "117": "PSG-1",
    "118": "9A-91",
    "119": "OTs-14",
    "120": "ARX-160",
    "121": "Mk-48",
    "122": "G11",
    "123": "P99",
    "124": "Super SASS",
    "125": "MG4",
    "126": "NZ75",
    "127": "Type 79",
    "128": "M99",
    "129": "Type 95",
    "130": "Type 97",
    "131": "EVO 3",
    "132": "Type 59",
    "133": "Type 63",
    "134": "AR70",
    "135": "SR-3MP",
    "136": "PP-19",
    "137": "PP-19-01",
    "138": "6P62",
    "139": "Bren Ten",
    "140": "PSM",
    "141": "USP Compact",
    "142": "Five-seveN",
    "143": "RO635",
    "144": "MT-9",
    "145": "OTs-44",
    "146": "G28",
    "147": "SSG 69",
    "148": "IWS 2000",
    "149": "AEK-999",
    "150": "Shipka",
    "151": "M1887",
    "152": "M1897",
    "153": "M37",
    "154": "M500",
    "155": "M590",
    "156": "Super-Shorty",
    "157": "KSG",
    "158": "KS-23",
    "159": "RMB-93",
    "160": "Saiga-12",
    "161": "Type 97 Shotgun",
    "162": "SPAS-12",
    "163": "AA-12",
    "164": "FP-6",
    "165": "M1014",
    "166": "CZ75",
    "167": "HK45",
    "168": "Spitfire",
    "169": "SCW",
    "170": "ASh-12.7",
    "171": "Ribeyrolles",
    "172": "RFB",
    "173": "PKP",
    "174": "Type 81 Carbine",
    "175": "ART556",
    "176": "TMP",
    "177": "KLIN",
    "178": "F1",
    "179": "DSR-50",
    "180": "PzB 39",
    "181": "T91",
    "182": "wz.29",
    "183": "Contender",
    "184": "T-5000",
    "185": "Ameli",
    "186": "P226",
    "187": "Ak 5",
    "188": "S.A.T.8",
    "189": "USAS 12",
    "190": "NS2000",
    "191": "M12",
    "192": "JS05",
    "193": "T65",
    "194": "K2",
    "195": "HK23",
    "196": "Zas M21",
    "197": "Carcano M1891",
    "198": "Carcano M91/38",
    "199": "Type 80",
    "200": "XM3",
    "201": "Gepard",
    "202": "Thunder",
    "203": "Honey Badger",
    "204": "Ballista",
    "205": "AN-94",
    "206": "AK-12",
    "207": "CZ2000",
    "208": "HK21",
    "209": "OTs-39",
    "210": "CZ52",
    "211": "SRS",
    "212": "K5",
    "213": "C-MS",
    "215": "MDR",
    "216": "XM8",
    "217": "SM-1",
    "218": "T77",
    "220": "MP-443",
    "221": "GSh-18",
    "222": "TAC-50",
    "223": "Model L",
    "224": "PM-06",
    "225": "Cx4 Storm",
    "226": "Mk 12",
    "227": "A-91",
    "228": "Type 100",
    "229": "M870",
    "230": "OBR",
    "231": "M82A1",
    "232": "MP-448",
    "233": "Px4 Storm",
    "234": "JS 9",
    "235": "SPR A3G",
    "236": "K11",
    "237": "SAR-21",
    "238": "Type 88",
    "239": "Type 03",
    "240": "Mk46",
    "241": "RT-20",
    "1001": "Noel",
    "1002": "Elphelt",
    "1003": "Kiana",
    "1004": "Raiden Mei",
    "1005": "Bronya",
    "1006": "Theresa",
    "1007": "Murata Himeko",
    "1008": "Seele",
    "1009": "Clear",
    "1010": "Fail",
};

var regionList = ["EN", "JP", "CN", "KR", "TW"];
var regions = 
{
    EN: [[1, 3], [5, 27], [29], [31, 44], [46, 48], [50, 58], [60, 72], [74, 75], [77, 101], [103, 112], [114, 133], [135], [138, 144], [148, 149], [153, 159], [161], [166], [168], [170, 171], [173], [175], [183], [188, 190], [192], [196], [1001, 1002]],
    JP: [[1, 3], [5, 22], [24, 27], [29], [31, 44], [46, 48], [50, 58], [60, 72], [74, 75], [77, 82], [85, 101], [103, 112], [114, 120], [122], [124, 125], [128, 130], [132, 133], [135], [138, 140], [141, 143], [149], [153, 156], [157, 159], [161], [165, 166], [172], [175, 176], [228], [1001, 1002]],
    CN: [[1, 241], [1001, 1010]],
    KR: [[1, 227], [229, 241], [1001, 1002], [1009, 1010]],
    TW: [[1, 227], [229, 241], [1001, 1002], [1009, 1010]]
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
            id = id.toString();

            doll.region = { EN: false, JP: false, CN: false, KR: false, TW: false };
            doll.name = dollNames[id];
            dollData[id] = doll;
        });

        $.each(regionList, function(i)
        {
            addRegion(regionList[i]);
        });

        $("#main").addClass("main-show");
        $(".loading").addClass("loading-hide");

        dollDataAcquired = true;

    } else
        alert("Error: Cannot Get Doll Information");
});

function addRegion(r) 
{
    $.each(regions[r], function(i)
    {
        var id = regions[r][i];

        if(id.length < 2)
        {
            if(dollData[id[0].toString()] != undefined)
                dollData[id[0].toString()].region[r] = true;
        }             
        else
        {
            for(j = id[0]; j <= id[1]; j++)
            {
                if(dollData[j.toString()] != undefined)
                    dollData[j.toString()].region[r] = true;
            }
        }
    }); 
}