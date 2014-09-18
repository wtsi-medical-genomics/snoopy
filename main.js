var b = new Browser({
    chr:          '22',
    viewStart:    30000000,
    viewEnd:      30000100,
    cookieKey:    'human-grc_h37',

    coordSystem: {
        speciesName: 'Human',
    taxon: 9606,
    auth: 'GRCh',
    version: '37',
    ucscName: 'hg19',
    },

    chains: {
        hg18ToHg19: new Chainset('http://www.derkholm.net:8080/das/hg18ToHg19/', 'NCBI36', 'GRCh37',
                        {
                            speciesName: 'Human',
        taxon: 9606,
        auth: 'GRCh',
        version: 37
                        })
    },

    /*noTrackAdder : true,
      noLeapButtons : true,
      noLocationField : true,
      noZoomSlider : true,
      noTitle : true,
      noTrackEditor : true,
      noExport : true,
      noOptions : true,
      noHelp : true,
      disableDefaultFeaturePopup : true,
      noPersist : true,
      noPersistView : true,*/
    sources: [
    {name: 'Genome',
        twoBitURI: 'http://www.biodalliance.org/datasets/hg19.2bit',
        tier_type: 'sequence',
        provides_entrypoints: true,
        pinned: true
    }],
    setDocumentTitle: true,
    uiPrefix: 'file:///nfs/users/nfs_d/dr9/snpshow/dalliance/',
    fullScreen: true,

    browserLinks: {
        Ensembl: 'http://ncbi36.ensembl.org/Homo_sapiens/Location/View?r=${chr}:${start}-${end}',
        UCSC: 'http://genome.ucsc.edu/cgi-bin/hgTracks?db=hg19&position=chr${chr}:${start}-${end}',
        Sequence: 'http://www.derkholm.net:8080/das/hg19comp/sequence?segment=${chr}:${start},${end}'
    }
});

b.hubs = [
'http://www.biodalliance.org/datasets/testhub/hub.txt',
'http://ftp.ebi.ac.uk/pub/databases/ensembl/encode/integration_data_jan2011/hub.txt'
];

b.addFeatureInfoPlugin(function(f, info) {
    info.add('Testing', 'This is a test!');
});
/*
   b.addViewListener(function(chr, min, max) {
   var link = document.getElementById('enslink');
   link.href = 'http://www.ensembl.org/Homo_sapiens/Location/View?r=' + chr + ':' + min + '-' + max;
   });
/*var geneDescriptions;
connectBigTab(new URLFetchable('http://www.biodalliance.org/datasets/ensg-to-desc.bt'), function(bt) {
geneDescriptions = bt;
});

b.addFeatureInfoPlugin(function(f, info) {
if (f.geneId) {
var desc = makeElement('div', 'Loading...');
info.add('Description', desc);
geneDescriptions.index.lookup(f.geneId, function(res, err) {
if (err) {
console.log(err);
} else {
desc.textContent = res;
}
});
}
}); */

function variantLocations(variantFile) {
    this.variantArray = [];
    this.current = 0;
}


function updateByList () {
    var selected = document.getElementById("mySelect");
    console.log(selected);
    v.current = selected.value;
    v.gotoCurrentVariant();
}


variantLocations.prototype.processVariantFile = function(fileText) {
    var textArray = fileText.split("\n");
    var pattern = /\s*[,:-\s]+\s*/
        for (i = 0; i < textArray.length; i++) {
            var variant = textArray[i].trim();
            var parts = variant.split(pattern);
            var chr = parseInt(parts[0]);
            var loc = parseInt(parts[1]); 
            if (parts.length === 2) {
                this.variantArray.push([chr, loc]);
            }
        }

    var myDiv = document.getElementById("variantSelectListHolder");

    var stringArray = this.getStringArray();

    //Create and append select list
    var selectList = document.createElement("select");
    selectList.id = "mySelect";
    selectList.className = "form-control";
    selectList.size = 10;
    selectList.onchange = function(){updateByList();};
    myDiv.appendChild(selectList);

    //Create and append the options
    for (var i = 0; i < stringArray.length; i++) {
        var option = document.createElement("option");
        option.value = i;
        option.text = stringArray[i];
        selectList.appendChild(option);
    }

    //var option = document.getElementById("").options[0];
    //option.value = option.text = getYear();
};


variantLocations.prototype.getStringArray = function() {
    var stringArray = Array(this.variantArray.length);
    for (i = 0; i<this.variantArray.length; i++) {
        stringArray[i] = this.variantArray[i][0] + ":" + this.variantArray[i][1];
    }
    return stringArray;
};

variantLocations.prototype.gotoCurrentVariant = function() {
    var c = this.variantArray[this.current];
    document.getElementById("currentVariant").innerHTML = String(c[0]) + " : " + String(c[1]);
    b.setLocation("chr" + c[0], c[1] - 20, c[1] + 20);
    document.getElementById("mySelect").value = this.current;
};

variantLocations.prototype.next = function() {
    if (this.current < this.variantArray.length - 1) {
        this.current++;
        this.gotoCurrentVariant();
    }
};

variantLocations.prototype.prev = function() {
    if (this.current > 0) {
        this.current--;
        this.gotoCurrentVariant();

    }
};



var v = new variantLocations();

loadFiles = function() {
    var BAMfile = document.getElementById("bamFile").files[0];
    var BAIfile = document.getElementById("baiFile").files[0];
    var variantFile = document.getElementById("variantListFile").files[0];    

    console.log('here it is');

    console.log(BAMfile);
    console.log(BAIfile);
    console.log(variantFile);

    var reader = new FileReader();
    reader.readAsText(variantFile);
    reader.onload = function() {
        console.log(reader.result);
        v.processVariantFile(reader.result);
        v.gotoCurrentVariant();
    }

    var myBAM = {
        baiBlob : BAIfile,
        bamBlob : BAMfile,
        name : "example",
        noPersist : true,
    };

    b.addTier(myBAM);


};


